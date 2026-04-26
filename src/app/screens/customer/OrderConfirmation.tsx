import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import CustomerSidebar from '../../components/CustomerSidebar';
import { WireframeLayout, WireframeButton, WireframeCard } from '../../components/WireframeLayout';
import { getCart, placeOrder, clearCart, type OrderRecord } from '../../lib/cart';
import { showError, showSuccess } from '../../lib/notifications';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    const cart = getCart();
    const prescriptionId = sessionStorage.getItem('checkout_prescription_id') || undefined;

    if (cart.length === 0) {
      setError('Your cart was empty. No order was placed.');
      setLoading(false);
      return;
    }

    placeOrder({ cart, prescriptionId: prescriptionId || undefined })
      .then((placed) => {
        setOrder(placed);
        clearCart();
        sessionStorage.removeItem('checkout_prescription_id');
        showSuccess('Order placed successfully!');
      })
      .catch((e) => {
        setError(e.message || 'Could not place order.');
        showError(e.message || 'Could not place order.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <WireframeLayout sidebar={<CustomerSidebar />} title="Order Confirmation">
      <div className="max-w-2xl mx-auto space-y-6">
        {loading && (
          <div className="text-sm font-mono text-neutral-500 p-8 text-center">Placing your order...</div>
        )}

        {error && !loading && (
          <div className="border border-red-300 bg-red-50 p-4 text-sm font-mono text-red-800">
            {error}
            <div className="mt-3">
              <WireframeButton label="Back to Cart" onClick={() => navigate('/customer/cart')} />
            </div>
          </div>
        )}

        {order && !loading && (
          <>
            <div className="border-4 border-neutral-700 bg-neutral-100 p-8 text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">✓</div>
              <div className="text-lg font-mono font-bold text-neutral-800 mb-2">Order Placed Successfully!</div>
              <div className="text-sm font-mono text-neutral-600">Order ID: {order.id.slice(0, 8).toUpperCase()}</div>
              {order.status === 'prescription_required' && (
                <div className="mt-3 text-xs font-mono text-amber-800 bg-amber-50 border border-amber-300 p-3 text-left">
                  Your order contains prescription medicines. A pharmacist will verify your prescription before dispensing.
                  Order status: <strong>Prescription Under Review</strong>.
                </div>
              )}
            </div>

            <WireframeCard title="Order Summary">
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs font-mono border-b border-neutral-200 pb-2">
                    <span className="text-neutral-700">{item.medicine_name} × {item.quantity}</span>
                    <span className="text-neutral-800">Rs. {(item.unit_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-mono font-bold pt-2">
                  <span>Total:</span>
                  <span>Rs. {order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </WireframeCard>

            <WireframeCard title="Order Status">
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Status:</span>
                  <span className="text-neutral-800 font-bold uppercase">{order.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Placed:</span>
                  <span className="text-neutral-700">{new Date(order.created_at).toLocaleString()}</span>
                </div>
              </div>
            </WireframeCard>

            <div className="flex gap-4">
              <WireframeButton label="View My Orders" onClick={() => navigate('/customer/orders')} />
              <WireframeButton label="Continue Shopping" variant="secondary" onClick={() => navigate('/customer/browse')} />
            </div>
          </>
        )}
      </div>
    </WireframeLayout>
  );
}
