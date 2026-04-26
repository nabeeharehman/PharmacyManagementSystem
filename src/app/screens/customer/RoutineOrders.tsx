import CustomerSidebar from '../../components/CustomerSidebar';
import { WireframeLayout, WireframeBox, WireframeButton, WireframeCard } from '../../components/WireframeLayout';

export default function RoutineOrders() {

  return (
    <WireframeLayout
      sidebar={<CustomerSidebar />}
      title="Routine Orders & Subscriptions"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <WireframeCard>
            <div className="text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">3</div>
              <div className="text-xs font-mono text-neutral-600">Active Subscriptions</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">1</div>
              <div className="text-xs font-mono text-neutral-600">Upcoming Delivery</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">24</div>
              <div className="text-xs font-mono text-neutral-600">Total Deliveries</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">$XXX</div>
              <div className="text-xs font-mono text-neutral-600">Monthly Cost</div>
            </div>
          </WireframeCard>
        </div>

        <WireframeCard title="Create New Routine Order">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Medicine Name *</div>
                <WireframeBox label="Search or select medicine..." />
              </div>
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Quantity per Delivery *</div>
                <WireframeBox label="Enter quantity..." />
              </div>
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Delivery Frequency *</div>
                <WireframeBox label="Select frequency ▼" />
                <div className="mt-1 text-xs font-mono text-neutral-500 pl-2">
                  <div>• Daily</div>
                  <div>• Every 3 days</div>
                  <div>• Weekly (Every Sunday, Monday, etc.)</div>
                  <div>• Bi-weekly (Every 2 weeks)</div>
                  <div>• Monthly (Specific date)</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Delivery Day/Date *</div>
                <WireframeBox label="Select day or date..." />
              </div>
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Start Date *</div>
                <WireframeBox label="Select start date..." />
              </div>
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Delivery Address *</div>
                <WireframeBox label="Select delivery address ▼" />
              </div>
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Special Instructions</div>
                <WireframeBox height="h-20" label="Add any special instructions..." />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t-2 border-neutral-300 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-neutral-700">
                <div className="mb-1">Estimated Cost per Delivery: <strong>$XX.XX</strong></div>
                <div>Next Delivery: <strong>March 15, 2026</strong></div>
              </div>
              <div className="flex gap-4">
                <WireframeButton label="Clear Form" variant="secondary" />
                <WireframeButton label="Create Subscription" />
              </div>
            </div>
          </div>
        </WireframeCard>

        <WireframeCard title="Active Subscriptions">
          <div className="space-y-4">
            {[
              { medicine: 'Medicine A - 500mg', frequency: 'Weekly (Every Sunday)', nextDelivery: 'March 10, 2026', status: 'ACTIVE', price: '$25.00' },
              { medicine: 'Medicine B - 250mg', frequency: 'Bi-weekly', nextDelivery: 'March 15, 2026', status: 'ACTIVE', price: '$40.00' },
              { medicine: 'Medicine C - 100mg', frequency: 'Monthly (1st of month)', nextDelivery: 'April 01, 2026', status: 'ACTIVE', price: '$30.00' },
            ].map((subscription, index) => (
              <div key={index} className="border-2 border-neutral-400 bg-neutral-50 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="text-sm font-mono text-neutral-800 mb-1">{subscription.medicine}</div>
                    <div className="text-xs font-mono text-neutral-600">Frequency: {subscription.frequency}</div>
                    <div className="text-xs font-mono text-neutral-600">Next Delivery: {subscription.nextDelivery}</div>
                    <div className="text-xs font-mono text-neutral-600">Cost per Delivery: {subscription.price}</div>
                  </div>
                  <div className="px-3 py-1 bg-neutral-600 text-white border border-neutral-800 text-xs font-mono">
                    {subscription.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  <WireframeButton label="View Details" variant="secondary" />
                  <WireframeButton label="Modify" variant="secondary" />
                  <WireframeButton label="Pause" variant="secondary" />
                  <WireframeButton label="Cancel" variant="danger" />
                </div>
              </div>
            ))}
          </div>
        </WireframeCard>

        <WireframeCard title="Paused Subscriptions">
          <div className="space-y-4">
            {[
              { medicine: 'Medicine D - 200mg', frequency: 'Weekly (Every Wednesday)', pausedDate: 'Feb 20, 2026', status: 'PAUSED', price: '$35.00' },
            ].map((subscription, index) => (
              <div key={index} className="border-2 border-neutral-300 bg-neutral-100 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="text-sm font-mono text-neutral-800 mb-1">{subscription.medicine}</div>
                    <div className="text-xs font-mono text-neutral-600">Frequency: {subscription.frequency}</div>
                    <div className="text-xs font-mono text-neutral-600">Paused On: {subscription.pausedDate}</div>
                    <div className="text-xs font-mono text-neutral-600">Cost per Delivery: {subscription.price}</div>
                  </div>
                  <div className="px-3 py-1 bg-neutral-400 border border-neutral-600 text-xs font-mono">
                    {subscription.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  <WireframeButton label="Resume" />
                  <WireframeButton label="Modify" variant="secondary" />
                  <WireframeButton label="Cancel" variant="danger" />
                </div>
              </div>
            ))}
          </div>
        </WireframeCard>
      </div>
    </WireframeLayout>
  );
}
