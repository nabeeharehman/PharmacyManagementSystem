import { useEffect, useState } from 'react';
import CustomerSidebar from '../../components/CustomerSidebar';
import { WireframeLayout, WireframeButton, WireframeCard } from '../../components/WireframeLayout';
import { loadCustomerOrders, orderStatusLabel, orderStatusBadgeClass, type OrderRecord } from '../../lib/cart';
import { showError } from '../../lib/notifications';

export default function CustomerOrders() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);


  useEffect(() => {
    loadCustomerOrders()
      .then((data) => { setOrders(data); if (data.length > 0) setSelectedOrder(data[0]); })
      .catch((e) => showError(e.message || 'Could not load orders.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <WireframeLayout sidebar={<CustomerSidebar />} title="My Orders">
      <div className="space-y-6">
        {loading && <div className="text-sm font-mono text-neutral-500">Loading orders...</div>}

        {!loading && orders.length === 0 && (
          <div className="text-sm font-mono text-neutral-500">You have no orders yet.</div>
        )}

        {orders.length > 0 && (
          <WireframeCard title={'All Orders (' + orders.length + ')'}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-neutral-400">
                    {['Order ID', 'Date', 'Items', 'Total', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left p-3 text-xs font-mono text-neutral-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className={'border-b border-neutral-300 ' + (selectedOrder?.id === order.id ? 'bg-neutral-100' : '')}>
                      <td className="p-3 text-xs font-mono text-neutral-700">{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">{order.items.length} items</td>
                      <td className="p-3 text-xs font-mono text-neutral-700">Rs. {order.total_amount.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={'px-2 py-1 border text-xs font-mono ' + orderStatusBadgeClass(order.status)}>
                          {orderStatusLabel(order.status).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <WireframeButton label="View" variant="secondary" onClick={() => setSelectedOrder(order)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </WireframeCard>
        )}

        {selectedOrder && (
          <WireframeCard title={'Order Details - ' + selectedOrder.id.slice(0, 8).toUpperCase()}>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="space-y-1 text-xs font-mono">
                <div className="text-neutral-600 mb-2 font-bold">Order Information</div>
                <div className="flex justify-between"><span className="text-neutral-600">Status:</span>
                  <span className={'px-2 py-0.5 border text-xs font-mono ' + orderStatusBadgeClass(selectedOrder.status)}>
                    {orderStatusLabel(selectedOrder.status).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-neutral-600">Date:</span><span>{new Date(selectedOrder.created_at).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-neutral-600">Total:</span><span>Rs. {selectedOrder.total_amount.toFixed(2)}</span></div>
                {selectedOrder.prescription_id && <div className="flex justify-between"><span className="text-neutral-600">Prescription:</span><span>{selectedOrder.prescription_id.slice(0, 8).toUpperCase()}</span></div>}
              </div>
              {selectedOrder.pharmacist_notes && (
                <div className="space-y-1 text-xs font-mono">
                  <div className="text-neutral-600 mb-2 font-bold">Pharmacist Notes</div>
                  <div className="border-2 border-neutral-200 bg-neutral-50 p-3 text-neutral-700">{selectedOrder.pharmacist_notes}</div>
                </div>
              )}
            </div>
            <div className="text-xs font-mono text-neutral-600 mb-2 font-bold">Ordered Items</div>
            <div className="space-y-2">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="border-2 border-neutral-200 p-3 flex justify-between">
                  <div>
                    <div className="text-xs font-mono text-neutral-800">{item.medicine_name}</div>
                    <div className="text-xs font-mono text-neutral-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-xs font-mono text-neutral-700">Rs. {(item.unit_price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </WireframeCard>
        )}
      </div>
    </WireframeLayout>
  );
}
