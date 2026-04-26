import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { WireframeLayout, Sidebar, WireframeButton, WireframeCard } from '../../components/WireframeLayout';
import { createInventoryTransaction, loadMedicineInventory, type MedicineRow } from '../../lib/inventory';
import { showError, showSuccess } from '../../lib/notifications';
import { supabase } from '../../lib/supabase';

type MedicineForm = {
  sku: string;
  name: string;
  category: string;
  description: string;
  dosage: string;
  price: string;
  opening_stock: string;
  min_stock_level: string;
  expiry_date: string;
  batch_number: string;
  supplier: string;
  requires_prescription: boolean;
};

const initialForm: MedicineForm = {
  sku: '',
  name: '',
  category: '',
  description: '',
  dosage: '',
  price: '',
  opening_stock: '0',
  min_stock_level: '0',
  expiry_date: '',
  batch_number: '',
  supplier: '',
  requires_prescription: false,
};

export default function InventoryDashboard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<MedicineForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [loading, setLoading] = useState(true);

  const sidebarItems = [
    { label: 'Dashboard', path: '/inventory/dashboard', active: true },
    { label: 'Manage Inventory', path: '/inventory/manage' },
    { label: 'Reports', path: '/inventory/reports' },
    { label: 'Logout', path: '/' },
  ];

  const totalMedicines = medicines.length;
  const lowStockMedicines = useMemo(
    () => medicines.filter((medicine) => medicine.current_stock <= medicine.min_stock_level),
    [medicines],
  );
  const expiringSoonMedicines = useMemo(() => {
    const today = new Date();
    const cutoff = new Date();
    cutoff.setDate(today.getDate() + 30);

    return medicines.filter((medicine) => {
      if (!medicine.expiry_date) return false;
      const expiry = new Date(medicine.expiry_date);
      return expiry >= today && expiry <= cutoff;
    });
  }, [medicines]);
  const outOfStockMedicines = useMemo(
    () => medicines.filter((medicine) => medicine.current_stock === 0),
    [medicines],
  );

  useEffect(() => {
    void refreshInventory();
  }, []);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);

  useEffect(() => {
    if (message) {
      showSuccess(message);
    }
  }, [message]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  const refreshInventory = async () => {
    setLoading(true);

    try {
      const data = await loadMedicineInventory();
      setMedicines(data);
    } catch (loadError: any) {
      setError(loadError.message || 'Unable to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof MedicineForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.sku.trim() || !form.name.trim() || !form.category.trim()) {
      setError('SKU, medicine name, and category are required.');
      return;
    }

    const price = Number(form.price);
    const openingStock = Number(form.opening_stock);
    const minStockLevel = Number(form.min_stock_level);

    if (Number.isNaN(price) || price < 0) {
      setError('Price must be a valid non-negative number.');
      return;
    }

    if (!Number.isInteger(openingStock) || openingStock < 0) {
      setError('Opening stock must be a non-negative whole number.');
      return;
    }

    if (!Number.isInteger(minStockLevel) || minStockLevel < 0) {
      setError('Minimum stock level must be a non-negative whole number.');
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: insertedMedicine, error: insertError } = await supabase
        .from('medicines')
        .insert({
          sku: form.sku.trim(),
          name: form.name.trim(),
          category: form.category.trim(),
          description: form.description.trim() || null,
          dosage: form.dosage.trim() || null,
          price,
          min_stock_level: minStockLevel,
          expiry_date: form.expiry_date || null,
          batch_number: form.batch_number.trim() || null,
          supplier: form.supplier.trim() || null,
          requires_prescription: form.requires_prescription,
          created_by: user?.id ?? null,
        })
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

      try {
        if (openingStock > 0) {
          await createInventoryTransaction({
            medicineId: insertedMedicine.id,
            transactionType: 'restock',
            quantityChange: openingStock,
            previousStock: 0,
            newStock: openingStock,
          });
        }
      } catch (transactionError) {
        await supabase.from('medicines').delete().eq('id', insertedMedicine.id);
        throw transactionError;
      }

      setMessage('Medicine added successfully.');
      setForm(initialForm);
      setIsModalOpen(false);
      await refreshInventory();
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to add medicine.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <WireframeLayout
      sidebar={<Sidebar items={sidebarItems} />}
      title="Inventory Manager Dashboard"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <WireframeCard>
            <div className="text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">{loading ? '...' : totalMedicines}</div>
              <div className="text-xs font-mono text-neutral-600">Total Medicines</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">{loading ? '...' : lowStockMedicines.length}</div>
              <div className="text-xs font-mono text-neutral-600">Low Stock Items</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">{loading ? '...' : expiringSoonMedicines.length}</div>
              <div className="text-xs font-mono text-neutral-600">Expiring Soon</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">{loading ? '...' : outOfStockMedicines.length}</div>
              <div className="text-xs font-mono text-neutral-600">Out of Stock</div>
            </div>
          </WireframeCard>
        </div>

        {message && <div className="border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}
        {error && <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <WireframeCard title="Low Stock Alerts">
          <div className="space-y-2">
            {lowStockMedicines.length === 0 && (
              <div className="text-sm text-neutral-600">No low-stock medicines found.</div>
            )}
            {lowStockMedicines.slice(0, 5).map((item) => (
              <div key={item.id} className="border-2 border-neutral-400 bg-neutral-100 p-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-mono text-neutral-800">{item.name}</div>
                  <div className="text-xs font-mono text-neutral-600">SKU: {item.sku}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs font-mono text-neutral-600">Current Stock</div>
                    <div className="text-sm font-mono text-neutral-800">{item.current_stock} units</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-neutral-600">Min. Required</div>
                    <div className="text-sm font-mono text-neutral-800">{item.min_stock_level} units</div>
                  </div>
                  <WireframeButton label="Restock" onClick={() => navigate('/inventory/manage')} />
                </div>
              </div>
            ))}
          </div>
        </WireframeCard>

        <WireframeCard title="Expiring Soon (Within 30 Days)">
          <div className="space-y-2">
            {expiringSoonMedicines.length === 0 && (
              <div className="text-sm text-neutral-600">No medicines expiring within the next 30 days.</div>
            )}
            {expiringSoonMedicines.slice(0, 3).map((item) => (
              <div key={item.id} className="border-2 border-neutral-300 p-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-mono text-neutral-800">{item.name}</div>
                  <div className="text-xs font-mono text-neutral-600">Batch: {item.batch_number || 'N/A'}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs font-mono text-neutral-600">Expiry Date</div>
                    <div className="text-sm font-mono text-neutral-800">{item.expiry_date || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-neutral-600">Quantity</div>
                    <div className="text-sm font-mono text-neutral-800">{item.current_stock} units</div>
                  </div>
                  <WireframeButton label="View Details" variant="secondary" />
                </div>
              </div>
            ))}
          </div>
        </WireframeCard>

        <div className="flex gap-4">
          <WireframeButton
            label="Add Medicine"
            onClick={() => {
              setIsModalOpen(true);
              setError('');
              setMessage('');
            }}
          />
          <WireframeButton
            label="Manage All Inventory"
            variant="secondary"
            onClick={() => navigate('/inventory/manage')}
          />
          <WireframeButton label="Refresh" variant="secondary" onClick={() => void refreshInventory()} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-6">
          <div className="relative w-full max-w-2xl max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6 pr-16 shadow-2xl">
            <button
              type="button"
              aria-label="Close add medicine popup"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-lg font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
              onClick={() => setIsModalOpen(false)}
            >
              x
            </button>

            <div className="sticky top-0 mb-4 flex items-start justify-between gap-4 bg-white pb-3">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Add Medicine</h2>
                <p className="mt-1 text-sm text-neutral-600">Create the medicine first, then record the opening stock in inventory transactions.</p>
              </div>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="SKU *">
                  <input className={inputClassName} value={form.sku} onChange={(e) => handleChange('sku', e.target.value)} />
                </Field>
                <Field label="Medicine Name *">
                  <input className={inputClassName} value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
                </Field>
                <Field label="Category *">
                  <input className={inputClassName} value={form.category} onChange={(e) => handleChange('category', e.target.value)} />
                </Field>
                <Field label="Dosage">
                  <input className={inputClassName} value={form.dosage} onChange={(e) => handleChange('dosage', e.target.value)} />
                </Field>
                <Field label="Price *">
                  <input type="number" min="0" step="0.01" className={inputClassName} value={form.price} onChange={(e) => handleChange('price', e.target.value)} />
                </Field>
                <Field label="Opening Stock *">
                  <input type="number" min="0" step="1" className={inputClassName} value={form.opening_stock} onChange={(e) => handleChange('opening_stock', e.target.value)} />
                </Field>
                <Field label="Minimum Stock Level *">
                  <input type="number" min="0" step="1" className={inputClassName} value={form.min_stock_level} onChange={(e) => handleChange('min_stock_level', e.target.value)} />
                </Field>
                <Field label="Expiry Date">
                  <input type="date" className={inputClassName} value={form.expiry_date} onChange={(e) => handleChange('expiry_date', e.target.value)} />
                </Field>
                <Field label="Batch Number">
                  <input className={inputClassName} value={form.batch_number} onChange={(e) => handleChange('batch_number', e.target.value)} />
                </Field>
                <Field label="Supplier">
                  <input className={inputClassName} value={form.supplier} onChange={(e) => handleChange('supplier', e.target.value)} />
                </Field>
              </div>

              <Field label="Description">
                <textarea className={`${inputClassName} min-h-24`} value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
              </Field>

              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={form.requires_prescription}
                  onChange={(e) => handleChange('requires_prescription', e.target.checked)}
                />
                Requires prescription
              </label>

              {error && <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

              <div className="flex gap-3">
                <WireframeButton label={saving ? 'Saving...' : 'Save Medicine'} disabled={saving} type="submit" />
                <WireframeButton label="Reset" variant="secondary" disabled={saving} onClick={resetForm} type="button" />
                <WireframeButton label="Cancel" variant="secondary" disabled={saving} onClick={() => setIsModalOpen(false)} type="button" />
              </div>
            </form>
          </div>
        </div>
      )}
    </WireframeLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-mono font-bold uppercase tracking-wide text-neutral-700">{label}</div>
      {children}
    </label>
  );
}

const inputClassName =
  'w-full border-2 border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900';
