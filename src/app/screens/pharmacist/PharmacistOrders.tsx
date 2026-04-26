import { useEffect, useMemo, useState } from 'react';
import PharmacistSidebar from '../../components/PharmacistSidebar';
import { WireframeLayout, WireframeButton, WireframeCard } from '../../components/WireframeLayout';
import {
  loadAllOrdersForPharmacist, updateOrderStatus, orderStatusLabel, orderStatusBadgeClass,
  type OrderRecord, type OrderStatus,
} from '../../lib/cart';
import { createPrescriptionSignedUrl } from '../../lib/prescriptions';
import { showError, showSuccess } from '../../lib/notifications';

type StatusFilter = OrderStatus | 'all';

const filterOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'prescription_required', label: 'Prescription Required' },
  { value: 'approved', label: 'Approved' },
  { value: 'dispensed', label: 'Dispensed' },
  { value: 'rejected', label: 'Rejected' },
];

export default function PharmacistOrders() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [openingRx, setOpeningRx] = useState(false);


  const refresh = () => {
    setLoading(true);
    loadAllOrdersForPharmacist()
      .then((data) => { setOrders(data); })
      .catch((e) => showError(e.message || 'Could not load orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (selectedOrder) setNotes(selectedOrder.pharmacist_notes || '');
  }, [selectedOrder]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const counts = useMemo(() => ({
    pending: orders.filter((o) => o.status === 'pending').length,
    rxRequired: orders.filter((o) => o.status === 'prescription_required').length,
    approved: orders.filter((o) => o.status === 'approved').length,
    dispensed: orders.filter((o) => o.status === 'dispensed').length,
  }), [orders]);

  const handleAction = async (action: 'approved' | 'dispensed' | 'rejected') => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const updated = await updateOrderStatus({ orderId: selectedOrder.id, status: action, notes });
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
      setSelectedOrder(updated);
      showSuccess('Order ' + action + ' successfully.');
    } catch (e: any) {
      showError(e.message || 'Could not update order.');
    } finally {
      setSaving(false);
    }
  };

  const handleViewPrescription = async () => {
    if (!selectedOrder?.prescription_id) return;
    setOpeningRx(true);
    try {
      const { supabase } = await import('../../lib/supabase');
      const { data } = await supabase
        .from('prescriptions')
        .select('file_url, file_name')
        .eq('id', selectedOrder.prescription_id)
        .single();
      if (!data?.file_url || data.file_url === 'missing') {
        showError('This prescription was uploaded before file storage was configured. The file cannot be retrieved. Please ask the customer to re-upload their prescription.');
        return;
      }
      const url = await createPrescriptionSignedUrl(data.file_url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e: any) {
      showError(e.message || 'Could not open prescription.');
    } finally {
      setOpeningRx(false);
    }
  };

  return (
    <WireframeLayout sidebar={<PharmacistSidebar />} title="Order Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Pending Review', value: counts.pending },
            { label: 'Rx Required', value: counts.rxRequired },
            { label: 'Approved', value: counts.approved },
            { label: 'Dispensed', value: counts.dispensed },
          ].map((s) => (
            <WireframeCard key={s.label}>
              <div className="text-center">
                <div className="text-2xl font-mono text-neutral-800 mb-1">{s.value}</div>
                <div className="text-xs font-mono text-neutral-600">{s.label}</div>
              </div>
            </WireframeCard>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <select
            className={inputCls + ' w-56'}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            {filterOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <WireframeButton label={loading ? 'Refreshing...' : 'Refresh'} variant="secondary" disabled={loading} onClick={refresh} />
        </div>

        {/* Order list */}
        <WireframeCard title={'Orders (' + filtered.length + ')'}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-400">
                  {['Order ID', 'Customer', 'Date', 'Items', 'Rx?', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left p-3 text-xs font-mono text-neutral-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className={'border-b border-neutral-300 ' + (selectedOrder?.id === order.id ? 'bg-neutral-100' : '')}>
                    <td className="p-3 text-xs font-mono text-neutral-700">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-3 text-xs font-mono text-neutral-700">{order.customer_name}</td>
                    <td className="p-3 text-xs font-mono text-neutral-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-xs font-mono text-neutral-600">{order.items.length}</td>
                    <td className="p-3 text-xs font-mono">{order.prescription_id ? <span className="text-amber-700">YES</span> : <span className="text-neutral-400">No</span>}</td>
                    <td className="p-3">
                      <span className={'px-2 py-1 border text-xs font-mono ' + orderStatusBadgeClass(order.status)}>
                        {orderStatusLabel(order.status).toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <WireframeButton label="Review" variant={selectedOrder?.id === order.id ? 'primary' : 'secondary'} onClick={() => setSelectedOrder(order)} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={7} className="p-4 text-sm font-mono text-neutral-500">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </WireframeCard>

        {/* Order detail */}
        {selectedOrder && (
          <WireframeCard title={'Order Detail - ' + selectedOrder.id.slice(0, 8).toUpperCase()}>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="space-y-1 text-xs font-mono">
                <div className="text-neutral-600 font-bold mb-2">Customer</div>
                <div>{selectedOrder.customer_name}</div>
                <div className="text-neutral-500">{selectedOrder.customer_email}</div>
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="text-neutral-600 font-bold mb-2">Order Info</div>
                <div>Date: {new Date(selectedOrder.created_at).toLocaleString()}</div>
                <div>Total: Rs. {selectedOrder.total_amount.toFixed(2)}</div>
                <div>Items: {selectedOrder.items.length}</div>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="text-neutral-600 font-bold mb-2">Prescription</div>
                {selectedOrder.prescription_id ? (
                  <>
                    <div>ID: {selectedOrder.prescription_id.slice(0, 8).toUpperCase()}</div>
                    <WireframeButton
                      label={openingRx ? 'Opening...' : 'View Prescription File'}
                      variant="secondary"
                      disabled={openingRx}
                      onClick={() => void handleViewPrescription()}
                    />
                  </>
                ) : (
                  <div className="text-neutral-400">No prescription attached</div>
                )}
              </div>
            </div>

            <div className="text-xs font-mono text-neutral-600 font-bold mb-2">Medicines to Dispense</div>
            <div className="space-y-2 mb-6">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="border-2 border-neutral-200 p-3 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-mono text-neutral-800">{item.medicine_name}</div>
                    <div className="text-xs font-mono text-neutral-500">Qty: {item.quantity} | Unit: Rs. {item.unit_price.toFixed(2)}</div>
                  </div>
                  <div className="text-xs font-mono text-neutral-700">Rs. {(item.unit_price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-neutral-300 pt-4 space-y-3">
              <div className="text-xs font-mono text-neutral-600 font-bold">Pharmacist Notes</div>
              <textarea
                className={inputCls + ' min-h-20'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this order (drug interactions, counselling, etc.)..."
                disabled={saving}
              />
              <div className="flex gap-3">
                <WireframeButton
                  label={saving ? 'Saving...' : 'Approve & Dispense'}
                  disabled={saving || selectedOrder.status === 'dispensed'}
                  onClick={() => void handleAction('approved')}
                />
                <WireframeButton
                  label={saving ? 'Saving...' : 'Mark as Dispensed'}
                  variant="secondary"
                  disabled={saving || selectedOrder.status === 'dispensed' || selectedOrder.status === 'rejected'}
                  onClick={() => void handleAction('dispensed')}
                />
                <WireframeButton
                  label={saving ? 'Saving...' : 'Reject Order'}
                  variant="danger"
                  disabled={saving || selectedOrder.status === 'dispensed'}
                  onClick={() => void handleAction('rejected')}
                />
              </div>
            </div>
          </WireframeCard>
        )}
      </div>
    </WireframeLayout>
  );
}

const inputCls = 'w-full border-2 border-neutral-300 bg-white px-3 py-2 text-sm font-mono text-neutral-900 outline-none focus:border-neutral-900';
