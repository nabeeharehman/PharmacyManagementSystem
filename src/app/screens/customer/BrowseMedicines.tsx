import { useEffect, useMemo, useState } from 'react';
import CustomerSidebar from '../../components/CustomerSidebar';
import { WireframeLayout, WireframeButton, WireframeCard } from '../../components/WireframeLayout';
import { loadMedicineCatalogue, addToCart, type CatalogueMedicine } from '../../lib/cart';
import { showError, showSuccess } from '../../lib/notifications';

export default function BrowseMedicines() {
  const [medicines, setMedicines] = useState<CatalogueMedicine[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);


  useEffect(() => {
    loadMedicineCatalogue()
      .then(setMedicines)
      .catch((e) => showError(e.message || 'Could not load medicines.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(medicines.map((m) => m.category).filter(Boolean))) as string[],
    [medicines],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return medicines.filter((m) => {
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q);
      const matchCat = !categoryFilter || m.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [medicines, search, categoryFilter]);

  const handleAddToCart = (medicine: CatalogueMedicine) => {
    if (medicine.currentStock <= 0) return;
    setAddingId(medicine.id);
    try {
      addToCart({
        medicineId: medicine.id,
        medicineName: medicine.name,
        sku: medicine.sku,
        category: medicine.category,
        pricePerUnit: medicine.pricePerUnit,
        quantity: 1,
        requiresPrescription: medicine.requiresPrescription,
        currentStock: medicine.currentStock,
      });
      showSuccess(medicine.name + ' added to cart.');
    } catch (e: any) {
      showError(e.message || 'Could not add to cart.');
    } finally {
      setAddingId(null);
    }
  };

  const stockLabel = (m: CatalogueMedicine) => {
    if (m.currentStock <= 0) return 'Out of Stock';
    if (m.currentStock <= 10) return 'Low Stock (' + m.currentStock + ')';
    return 'In Stock (' + m.currentStock + ')';
  };

  const stockClass = (m: CatalogueMedicine) => {
    if (m.currentStock <= 0) return 'text-red-600';
    if (m.currentStock <= 10) return 'text-amber-600';
    return 'text-emerald-700';
  };

  return (
    <WireframeLayout
      sidebar={<CustomerSidebar />}
      title="Browse Medicines"
    >
      <div className="space-y-6">
        <div className="flex gap-3">
          <input
            className={inputCls}
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={inputCls + ' w-52 flex-none'}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <WireframeButton label="Clear" variant="secondary" onClick={() => { setSearch(''); setCategoryFilter(''); }} />
        </div>

        {loading && <div className="text-sm font-mono text-neutral-500">Loading medicines...</div>}
        {!loading && filtered.length === 0 && <div className="text-sm font-mono text-neutral-500">No medicines found.</div>}

        <div className="grid grid-cols-4 gap-4">
          {filtered.map((medicine) => (
            <WireframeCard key={medicine.id}>
              <div className="border-2 border-dashed border-neutral-300 bg-neutral-50 h-28 flex items-center justify-center mb-3">
                <span className="text-xs font-mono text-neutral-400">[Medicine Image]</span>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-mono text-neutral-800 font-bold">{medicine.name}</div>
                <div className="text-xs font-mono text-neutral-500">SKU: {medicine.sku}</div>
                {medicine.category && <div className="text-xs font-mono text-neutral-500">Category: {medicine.category}</div>}
                <div className="text-sm font-mono text-neutral-700">Rs. {medicine.pricePerUnit.toFixed(2)}</div>
                <div className={'text-xs font-mono ' + stockClass(medicine)}>{stockLabel(medicine)}</div>
                {medicine.requiresPrescription && (
                  <div className="text-xs font-mono text-amber-700 border border-amber-300 bg-amber-50 px-2 py-0.5 inline-block">
                    Rx Prescription Required
                  </div>
                )}
                <WireframeButton
                  label={addingId === medicine.id ? 'Adding...' : medicine.currentStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  className="w-full mt-2"
                  variant={medicine.currentStock <= 0 ? 'secondary' : 'primary'}
                  disabled={medicine.currentStock <= 0 || addingId === medicine.id}
                  onClick={() => handleAddToCart(medicine)}
                />
              </div>
            </WireframeCard>
          ))}
        </div>
      </div>
    </WireframeLayout>
  );
}

const inputCls = 'flex-1 border-2 border-neutral-300 bg-white px-3 py-2 text-sm font-mono text-neutral-900 outline-none focus:border-neutral-900';
