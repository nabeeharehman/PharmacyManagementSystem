import { useEffect, useMemo, useState } from 'react';
import { WireframeButton, WireframeCard, WireframeLayout, Sidebar } from '../../components/WireframeLayout';
import { createInventoryTransaction, loadMedicineInventory, type MedicineRow } from '../../lib/inventory';
import { showError, showSuccess } from '../../lib/notifications';

type StockForm = {
  medicineId: string;
  quantityChange: string;
};

const initialForm: StockForm = {
  medicineId: '',
  quantityChange: '',
};

export default function ManageInventory() {
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [form, setForm] = useState<StockForm>(initialForm);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sidebarItems = [
    { label: 'Dashboard', path: '/inventory/dashboard' },
    { label: 'Manage Inventory', path: '/inventory/manage', active: true },
    { label: 'Reports', path: '/inventory/reports' },
    { label: 'Logout', path: '/' },
  ];

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

  const selectedMedicine = useMemo(
    () => medicines.find((medicine) => medicine.id === selectedMedicineId) ?? medicines[0] ?? null,
    [medicines, selectedMedicineId],
  );

  const filteredMedicines = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return medicines;
    }

    return medicines.filter((medicine) =>
      [medicine.name, medicine.sku, medicine.category ?? ''].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [medicines, search]);

  useEffect(() => {
    if (!selectedMedicine && medicines.length > 0) {
      setSelectedMedicineId(medicines[0].id);
      setForm((current) => ({ ...current, medicineId: medicines[0].id }));
      return;
    }

    if (selectedMedicine) {
      setForm((current) => ({ ...current, medicineId: selectedMedicine.id }));
    }
  }, [medicines, selectedMedicine]);

  const refreshInventory = async () => {
    setLoading(true);

    try {
      const data = await loadMedicineInventory();
      setMedicines(data);
      if (data.length > 0 && !selectedMedicineId) {
        setSelectedMedicineId(data[0].id);
      }
    } catch (loadError: any) {
      setError(loadError.message || 'Unable to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  const selectMedicine = (medicineId: string) => {
    setSelectedMedicineId(medicineId);
    setForm((current) => ({ ...current, medicineId }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedMedicine) {
      setError('Select a medicine before updating stock.');
      return;
    }

    const quantityChange = Number(form.quantityChange);

    if (!Number.isInteger(quantityChange) || quantityChange === 0) {
      setError('Enter a whole number for stock change. Use positive numbers to add stock and negative numbers to reduce stock.');
      return;
    }

    const previousStock = selectedMedicine.current_stock;
    const newStock = previousStock + quantityChange;

    if (newStock < 0) {
      setError('Stock cannot go below zero.');
      return;
    }

    setSaving(true);

    try {
      await createInventoryTransaction({
        medicineId: selectedMedicine.id,
        transactionType: quantityChange > 0 ? 'restock' : 'adjustment',
        quantityChange,
        previousStock,
        newStock,
      });

      const actionLabel = quantityChange > 0 ? 'restocked' : 'updated';
      setMessage(`${selectedMedicine.name} ${actionLabel} successfully. New stock is ${newStock} units.`);
      setForm((current) => ({ ...current, quantityChange: '' }));
      await refreshInventory();
      setSelectedMedicineId(selectedMedicine.id);
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to update stock.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <WireframeLayout
      sidebar={<Sidebar items={sidebarItems} />}
      title="Manage Inventory"
    >
      <div className="space-y-6">
        <div className="flex gap-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search medicines by name, SKU, or category..."
            className="flex-1 border-2 border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          />
          <WireframeButton label="Refresh" variant="secondary" onClick={() => void refreshInventory()} />
        </div>

        {message && <div className="border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}
        {error && <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <WireframeCard title={`Inventory List (${loading ? '...' : filteredMedicines.length} items)`}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-400">
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">SKU</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Medicine Name</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Category</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Current Stock</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Expiry Date</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Status</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine) => {
                  const isLowStock = medicine.current_stock <= medicine.min_stock_level;

                  return (
                    <tr key={medicine.id} className="border-b border-neutral-300">
                      <td className="p-3 text-xs font-mono text-neutral-700">{medicine.sku}</td>
                      <td className="p-3 text-xs font-mono text-neutral-700">{medicine.name}</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">{medicine.category || 'N/A'}</td>
                      <td className="p-3 text-xs font-mono text-neutral-700">{medicine.current_stock} units</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">{medicine.expiry_date || 'N/A'}</td>
                      <td className="p-3">
                        <div className={`px-2 py-1 border text-xs font-mono inline-block ${
                          isLowStock
                            ? 'bg-neutral-500 border-neutral-700 text-white'
                            : 'bg-neutral-300 border-neutral-500'
                        }`}>
                          {isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                        </div>
                      </td>
                      <td className="p-3">
                        <WireframeButton
                          label="Update Stock"
                          variant={medicine.id === selectedMedicine?.id ? 'primary' : 'secondary'}
                          onClick={() => selectMedicine(medicine.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
                {!loading && filteredMedicines.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-sm text-neutral-600">
                      No medicines matched your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </WireframeCard>

        <WireframeCard title={`Update Stock${selectedMedicine ? ` - ${selectedMedicine.name}` : ''}`}>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <Field label="Medicine Name">
                <input className={inputClassName} value={selectedMedicine?.name ?? ''} readOnly />
              </Field>
              <Field label="SKU">
                <input className={inputClassName} value={selectedMedicine?.sku ?? ''} readOnly />
              </Field>
              <Field label="Current Stock">
                <input className={inputClassName} value={selectedMedicine ? `${selectedMedicine.current_stock} units` : ''} readOnly />
              </Field>
            </div>

            <div className="space-y-4">
              <Field label="Minimum Stock Level">
                <input className={inputClassName} value={selectedMedicine ? `${selectedMedicine.min_stock_level} units` : ''} readOnly />
              </Field>
              <Field label="Stock Change *">
                <input
                  type="number"
                  step="1"
                  className={inputClassName}
                  value={form.quantityChange}
                  onChange={(event) => setForm((current) => ({ ...current, quantityChange: event.target.value }))}
                  placeholder="Use +10 to add, -5 to reduce"
                />
              </Field>
              <div className="text-xs font-mono text-neutral-600">
                Stock is recorded in `inventory_transactions` using `quantity_change`, `previous_stock`, and `new_stock`.
              </div>
            </div>

            <div className="col-span-2 flex gap-4">
              <WireframeButton label={saving ? 'Saving...' : 'Update Stock'} disabled={saving || !selectedMedicine} type="submit" />
              <WireframeButton
                label="Clear"
                variant="secondary"
                disabled={saving}
                onClick={() => setForm((current) => ({ ...current, quantityChange: '' }))}
                type="button"
              />
            </div>
          </form>
        </WireframeCard>
      </div>
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
