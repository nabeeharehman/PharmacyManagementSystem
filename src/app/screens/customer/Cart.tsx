import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import CustomerSidebar from '../../components/CustomerSidebar';
import { WireframeLayout, WireframeButton, WireframeCard } from '../../components/WireframeLayout';
import {
  getCart, removeFromCart, updateCartQty, cartRequiresPrescription, cartTotal,
  type CartItem,
} from '../../lib/cart';
import { loadCurrentCustomerPrescriptions, type PrescriptionRecord } from '../../lib/prescriptions';
import { showError, showSuccess } from '../../lib/notifications';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [loadingRx, setLoadingRx] = useState(false);


  const needsRx = cartRequiresPrescription(cart);
  const approvedPrescriptions = prescriptions.filter((p) => p.status === 'approved');

  useEffect(() => {
    setCart(getCart());
  }, []);

  useEffect(() => {
    if (!needsRx) return;
    setLoadingRx(true);
    loadCurrentCustomerPrescriptions()
      .then((records) => setPrescriptions(records))
      .catch((e) => showError(e.message || 'Could not load prescriptions.'))
      .finally(() => setLoadingRx(false));
  }, [needsRx]);

  const handleRemove = (medicineId: string) => {
    setCart(removeFromCart(medicineId));
    showSuccess('Item removed from cart.');
  };

  const handleQty = (medicineId: string, qty: number) => {
    setCart(updateCartQty(medicineId, qty));
  };

  const handleCheckout = () => {
    if (cart.length === 0) { showError('Your cart is empty.'); return; }
    if (needsRx) {
      if (approvedPrescriptions.length === 0) {
        showError('Your cart contains prescription medicines. Please upload and get a prescription approved first.');
        return;
      }
      if (!selectedPrescriptionId) {
        showError('Please select an approved prescription before checking out.');
        return;
      }
    }
    // Pass prescription ID via sessionStorage for OrderConfirmation to read
    sessionStorage.setItem('checkout_prescription_id', selectedPrescriptionId);
    navigate('/customer/order-confirmation');
  };

  const total = cartTotal(cart);

  return (
    <WireframeLayout sidebar={<CustomerSidebar />} title="Shopping Cart">
      {cart.length === 0 ? (
        <div className="text-sm font-mono text-neutral-500 p-6">
          Your cart is empty.{' '}
          <button className="underline text-neutral-800" onClick={() => navigate('/customer/browse')}>
            Browse Medicines
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="col-span-2 space-y-4">
            <WireframeCard title={'Cart Items (' + cart.length + ')'}>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.medicineId} className="border-2 border-neutral-300 p-4 flex gap-4">
                    <div className="border-2 border-dashed border-neutral-300 bg-neutral-50 w-20 h-20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-mono text-neutral-400">[IMG]</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-mono text-neutral-800 font-bold mb-0.5">{item.medicineName}</div>
                      {item.category && <div className="text-xs font-mono text-neutral-500 mb-1">Category: {item.category}</div>}
                      <div className="text-sm font-mono text-neutral-700">Rs. {item.pricePerUnit.toFixed(2)}</div>
                      {item.requiresPrescription && (
                        <div className="text-xs font-mono text-amber-700 mt-1">Rx Prescription Required</div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <WireframeButton label="Remove" variant="danger" onClick={() => handleRemove(item.medicineId)} />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-600">Qty:</span>
                        <div className="flex border-2 border-neutral-400">
                          <button
                            className="w-8 h-8 bg-neutral-200 text-xs font-mono hover:bg-neutral-300"
                            onClick={() => handleQty(item.medicineId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >-</button>
                          <div className="w-10 h-8 flex items-center justify-center border-x-2 border-neutral-400 text-xs font-mono">{item.quantity}</div>
                          <button
                            className="w-8 h-8 bg-neutral-200 text-xs font-mono hover:bg-neutral-300"
                            onClick={() => handleQty(item.medicineId, item.quantity + 1)}
                            disabled={item.quantity >= item.currentStock}
                          >+</button>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-neutral-700">Rs. {(item.pricePerUnit * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </WireframeCard>

            {/* Prescription selector */}
            {needsRx && (
              <WireframeCard title="Prescription Required">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-amber-800 bg-amber-50 border border-amber-300 p-3">
                    One or more items in your cart require a valid prescription. Please select an approved prescription below, or{' '}
                    <button className="underline" onClick={() => navigate('/customer/prescription')}>upload one</button>.
                  </div>

                  {loadingRx && <div className="text-xs font-mono text-neutral-500">Loading prescriptions...</div>}

                  {!loadingRx && approvedPrescriptions.length === 0 && (
                    <div className="text-xs font-mono text-red-700">
                      No approved prescriptions found. Please upload a prescription and wait for pharmacist approval.
                    </div>
                  )}

                  {approvedPrescriptions.map((rx) => (
                    <label key={rx.id} className={'flex gap-3 border-2 p-3 cursor-pointer ' + (selectedPrescriptionId === rx.id ? 'border-neutral-800 bg-neutral-50' : 'border-neutral-300')}>
                      <input
                        type="radio"
                        name="prescription"
                        value={rx.id}
                        checked={selectedPrescriptionId === rx.id}
                        onChange={() => setSelectedPrescriptionId(rx.id)}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="text-xs font-mono text-neutral-800">ID: {rx.id.slice(0, 8).toUpperCase()}</div>
                        <div className="text-xs font-mono text-neutral-600">{rx.file_name}</div>
                        <div className="text-xs font-mono text-emerald-700">APPROVED</div>
                        <div className="text-xs font-mono text-neutral-500">Uploaded: {new Date(rx.uploaded_at).toLocaleDateString()}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </WireframeCard>
            )}
          </div>

          {/* Order summary */}
          <div>
            <WireframeCard title="Order Summary">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.medicineId} className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-600">{item.medicineName} x{item.quantity}</span>
                    <span className="text-neutral-800">Rs. {(item.pricePerUnit * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t-2 border-neutral-300 pt-3 flex justify-between text-sm font-mono font-bold">
                  <span>Total:</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
                <WireframeButton label="Checkout" className="w-full mt-4" onClick={handleCheckout} />
                <WireframeButton label="Continue Shopping" className="w-full" variant="secondary" onClick={() => navigate('/customer/browse')} />
              </div>
            </WireframeCard>
          </div>
        </div>
      )}
    </WireframeLayout>
  );
}
