import { WireframeLayout, Sidebar, WireframeBox, WireframeButton, WireframeCard } from '../../components/WireframeLayout';

export default function OrdersPage() {
  // This can be used by different user roles - adjust sidebar based on role
  const sidebarItems = [
    { label: 'Dashboard', path: '/customer/dashboard' },
    { label: 'Browse Medicines', path: '/customer/browse-medicines' },
    { label: 'Upload Prescription', path: '/customer/upload-prescription' },
    { label: 'Cart', path: '/customer/cart' },
    { label: 'Orders', path: '/orders', active: true },
    { label: 'Logout', path: '/' },
  ];

  return (
    <WireframeLayout 
      sidebar={<Sidebar items={sidebarItems} />}
      title="Order Management"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <WireframeBox label="Search orders by ID or customer name..." />
          </div>
          <WireframeBox label="Filter by Status ▼" className="w-48" />
          <WireframeBox label="Filter by Date ▼" className="w-48" />
          <WireframeButton label="Apply Filters" variant="secondary" />
        </div>

        {/* Orders Table */}
        <WireframeCard title="All Orders">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-400">
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Order ID</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Customer Name</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Order Date</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Items</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Total Amount</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Status</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 12 }).map((_, index) => {
                  const statuses = ['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
                  const status = statuses[index % 5];
                  const bgColor = 
                    status === 'PENDING' ? 'bg-neutral-400' :
                    status === 'APPROVED' ? 'bg-neutral-500' :
                    status === 'SHIPPED' ? 'bg-neutral-500' :
                    status === 'DELIVERED' ? 'bg-neutral-600 text-white' :
                    'bg-neutral-300';

                  return (
                    <tr key={index} className="border-b border-neutral-300">
                      <td className="p-3 text-xs font-mono text-neutral-700">#1234{index}</td>
                      <td className="p-3 text-xs font-mono text-neutral-700">Customer {index + 1}</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">2026-03-{(index % 7) + 1 < 10 ? '0' : ''}{(index % 7) + 1}</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">{(index % 5) + 1} items</td>
                      <td className="p-3 text-xs font-mono text-neutral-700">${(index + 1) * 25}.00</td>
                      <td className="p-3">
                        <div className={`px-2 py-1 border-2 border-neutral-600 text-xs font-mono inline-block ${bgColor}`}>
                          {status}
                        </div>
                      </td>
                      <td className="p-3">
                        <WireframeButton label="View" variant="secondary" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </WireframeCard>

        {/* Order Detail Panel */}
        <WireframeCard title="Order Details - #12340">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-mono text-neutral-600 mb-3">Order Information</div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Order ID:</span>
                  <span className="text-neutral-700">#12340</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Order Date:</span>
                  <span className="text-neutral-700">2026-03-01</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Customer:</span>
                  <span className="text-neutral-700">John Doe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Email:</span>
                  <span className="text-neutral-700">john@email.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Phone:</span>
                  <span className="text-neutral-700">(555) 123-4567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Status:</span>
                  <span className="px-2 py-1 bg-neutral-400 border border-neutral-600">PENDING</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-mono text-neutral-600 mb-3">Delivery Address</div>
              <div className="border-2 border-neutral-300 p-3 text-xs font-mono text-neutral-700">
                <div>123 Main Street</div>
                <div>Apartment 4B</div>
                <div>City, State 12345</div>
                <div>United States</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-mono text-neutral-600 mb-3">Ordered Items</div>
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="border-2 border-neutral-300 p-3 flex justify-between">
                  <div>
                    <div className="text-xs font-mono text-neutral-700">Medicine Name {item}</div>
                    <div className="text-xs font-mono text-neutral-600">Quantity: {item}</div>
                  </div>
                  <div className="text-xs font-mono text-neutral-700">$XX.XX</div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t-2 border-neutral-300 flex justify-between text-sm font-mono">
              <span className="text-neutral-800">Total Amount:</span>
              <span className="text-neutral-800">$XXX.XX</span>
            </div>
          </div>

          <div className="mt-6 border-t-2 border-neutral-300 pt-4">
            <div className="text-xs font-mono text-neutral-600 mb-2">Update Order Status</div>
            <div className="flex gap-4 mb-4">
              <WireframeButton label="Mark as Approved" />
              <WireframeButton label="Mark as Shipped" />
              <WireframeButton label="Mark as Delivered" />
              <WireframeButton label="Cancel Order" variant="danger" />
            </div>
            <div>
              <div className="text-xs font-mono text-neutral-600 mb-2">Order Notes</div>
              <WireframeBox height="h-24" label="Add notes about this order..." />
            </div>
          </div>
        </WireframeCard>

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          <WireframeButton label="← Prev" variant="secondary" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((page) => (
              <div 
                key={page}
                className={`w-10 h-10 border-2 flex items-center justify-center text-xs font-mono ${
                  page === 1 ? 'bg-neutral-600 text-white border-neutral-800' : 'bg-white border-neutral-400'
                }`}
              >
                {page}
              </div>
            ))}
          </div>
          <WireframeButton label="Next →" variant="secondary" />
        </div>
      </div>
    </WireframeLayout>
  );
}
