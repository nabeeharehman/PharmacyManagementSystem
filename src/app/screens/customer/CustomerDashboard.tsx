import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import CustomerSidebar from '../../components/CustomerSidebar';
import { WireframeLayout, WireframeButton, WireframeCard } from '../../components/WireframeLayout';
import { loadMedicineCatalogue, addToCart, loadCustomerOrders, orderStatusLabel, orderStatusBadgeClass, type CatalogueMedicine, type OrderRecord } from '../../lib/cart';
import { showError, showSuccess } from '../../lib/notifications';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<CatalogueMedicine[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadMedicineCatalogue(),
      loadCustomerOrders(),
    ]).then(([meds, ords]) => {
      setMedicines(meds);
      setOrders(ords);
    }).catch((e) => showError(e.message || 'Could not load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    navigate('/customer/browse');
  };

  const handleAddToCart = (medicine: CatalogueMedicine) => {
    if (medicine.currentStock <= 0) return;
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
  };

  // Show first 6 in-stock medicines as "recommended"
  const recommended = medicines.filter((m) => m.currentStock > 0).slice(0, 6);
  const recentOrders = orders.slice(0, 3);

  return (
    <WireframeLayout sidebar={<CustomerSidebar />} title="Customer Dashboard">
      <div className="space-y-6">

        {/* Search bar */}
        <div>
          <div className="text-xs font-mono text-neutral-700 mb-2">Search Medicines</div>
          <div className="flex gap-2">
            <input
              className="flex-1 border-2 border-neutral-300 bg-white px-3 py-2 text-sm font-mono text-neutral-900 outline-none focus:border-neutral-900"
              placeholder="Search for medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <WireframeButton label="Search" onClick={handleSearch} />
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-4 gap-4">
          <WireframeButton label="Upload Prescription" onClick={() => navigate('/customer/prescription')} />
          <WireframeButton label="Browse Medicines" onClick={() => navigate('/customer/browse')} />
          <WireframeButton label="My Orders" onClick={() => navigate('/customer/orders')} />
          <WireframeButton label="View Cart" onClick={() => navigate('/customer/cart')} />
        </div>

        {/* Recommended medicines - real data */}
        <WireframeCard title="Recommended Medicines">
          {loading && <div className="text-xs font-mono text-neutral-500">Loading medicines...</div>}
          {!loading && recommended.length === 0 && (
            <div className="text-xs font-mono text-neutral-500">No medicines available.</div>
          )}
          <div className="grid grid-cols-3 gap-4">
            {recommended.map((medicine) => (
              <div key={medicine.id} className="border-2 border-neutral-300 p-3">
                <div className="border-2 border-dashed border-neutral-300 bg-neutral-50 h-24 flex items-center justify-center mb-2">
                  <span className="text-xs font-mono text-neutral-400">[Medicine Image]</span>
                </div>
                <div className="text-xs font-mono text-neutral-800 font-bold">{medicine.name}</div>
                {medicine.category && <div className="text-xs font-mono text-neutral-500">{medicine.category}</div>}
                <div className="text-xs font-mono text-neutral-700">Rs. {medicine.pricePerUnit.toFixed(2)}</div>
                <div className="text-xs font-mono text-emerald-700 mb-2">In Stock ({medicine.currentStock})</div>
                {medicine.requiresPrescription && (
                  <div className="text-xs font-mono text-amber-700 mb-1">Rx Required</div>
                )}
                <WireframeButton
                  label="Add to Cart"
                  className="w-full"
                  variant="secondary"
                  onClick={() => handleAddToCart(medicine)}
                />
              </div>
            ))}
          </div>
        </WireframeCard>

        {/* Recent orders - real data */}
        <WireframeCard title="Recent Orders">
          {loading && <div className="text-xs font-mono text-neutral-500">Loading orders...</div>}
          {!loading && recentOrders.length === 0 && (
            <div className="text-xs font-mono text-neutral-500">No orders yet.</div>
          )}
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="border-2 border-neutral-300 p-3 flex justify-between items-center">
                <div>
                  <div className="text-xs font-mono text-neutral-700">Order #{order.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-xs font-mono text-neutral-600">{new Date(order.created_at).toLocaleDateString()}</div>
                  <div className="text-xs font-mono text-neutral-500">{order.items.length} item(s) · Rs. {order.total_amount.toFixed(2)}</div>
                </div>
                <span className={'px-2 py-1 border text-xs font-mono ' + orderStatusBadgeClass(order.status)}>
                  {orderStatusLabel(order.status).toUpperCase()}
                </span>
                <WireframeButton label="View" variant="secondary" onClick={() => navigate('/customer/orders')} />
              </div>
            ))}
          </div>
        </WireframeCard>

      </div>
    </WireframeLayout>
  );
}
