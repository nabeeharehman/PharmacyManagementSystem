import CustomerSidebar from '../../components/CustomerSidebar';
import { WireframeLayout, WireframeBox, WireframeButton, WireframeCard } from '../../components/WireframeLayout';

export default function CustomerProfile() {

  return (
    <WireframeLayout
      sidebar={<CustomerSidebar />}
      title="My Profile"
    >
      <div className="space-y-6">
        <WireframeCard title="Personal Information">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-mono text-neutral-700 mb-1">Full Name *</div>
              <WireframeBox label="John Doe" />
            </div>
            <div>
              <div className="text-xs font-mono text-neutral-700 mb-1">Email Address *</div>
              <WireframeBox label="john.doe@example.com" />
            </div>
            <div>
              <div className="text-xs font-mono text-neutral-700 mb-1">Phone Number</div>
              <WireframeBox label="(555) 123-4567" />
            </div>
            <div>
              <div className="text-xs font-mono text-neutral-700 mb-1">Date of Birth</div>
              <WireframeBox label="MM/DD/YYYY" />
            </div>
          </div>
          <div className="mt-6 border-t-2 border-neutral-300 pt-4">
            <div className="flex gap-4">
              <WireframeButton label="Update Profile" />
              <WireframeButton label="Cancel" variant="secondary" />
            </div>
          </div>
        </WireframeCard>

        <WireframeCard title="Delivery Addresses">
          <div className="space-y-4">
            {[
              {
                label: 'HOME (Default)',
                address: '123 Main Street, Apt 4B, Springfield, ST 12345',
                phone: '(555) 123-4567',
                isDefault: true,
              },
              {
                label: 'WORK',
                address: '456 Business Ave, Suite 200, Springfield, ST 12345',
                phone: '(555) 987-6543',
                isDefault: false,
              },
            ].map((addr, index) => (
              <div key={index} className="border-2 border-neutral-300 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm font-mono text-neutral-800 mb-1">{addr.label}</div>
                    <div className="text-xs font-mono text-neutral-600">{addr.address}</div>
                    <div className="text-xs font-mono text-neutral-600">Phone: {addr.phone}</div>
                  </div>
                  {addr.isDefault && (
                    <div className="px-2 py-1 bg-neutral-600 text-white border border-neutral-800 text-xs font-mono">
                      DEFAULT
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <WireframeButton label="Edit" variant="secondary" />
                  {!addr.isDefault && <WireframeButton label="Set as Default" variant="secondary" />}
                  <WireframeButton label="Delete" variant="danger" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <WireframeButton label="+ Add New Address" />
          </div>
        </WireframeCard>

        <WireframeCard title="Change Password">
          <div className="grid grid-cols-1 gap-4 max-w-md">
            <div>
              <div className="text-xs font-mono text-neutral-700 mb-1">Current Password *</div>
              <WireframeBox label="Enter current password..." />
            </div>
            <div>
              <div className="text-xs font-mono text-neutral-700 mb-1">New Password *</div>
              <WireframeBox label="Enter new password..." />
            </div>
            <div>
              <div className="text-xs font-mono text-neutral-700 mb-1">Confirm New Password *</div>
              <WireframeBox label="Confirm new password..." />
            </div>
          </div>
          <div className="mt-6 border-t-2 border-neutral-300 pt-4">
            <div className="flex gap-4">
              <WireframeButton label="Change Password" />
              <WireframeButton label="Cancel" variant="secondary" />
            </div>
          </div>
        </WireframeCard>

        <WireframeCard title="Account Settings">
          <div className="space-y-4">
            <div className="border-2 border-neutral-300 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-mono text-neutral-800 mb-1">Email Notifications</div>
                  <div className="text-xs font-mono text-neutral-600">Receive order updates and promotions via email</div>
                </div>
                <div className="px-3 py-1 bg-neutral-600 text-white border border-neutral-800 text-xs font-mono">
                  ON
                </div>
              </div>
            </div>
            <div className="border-2 border-neutral-300 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-mono text-neutral-800 mb-1">SMS Notifications</div>
                  <div className="text-xs font-mono text-neutral-600">Receive delivery updates via text message</div>
                </div>
                <div className="px-3 py-1 bg-neutral-400 border border-neutral-600 text-xs font-mono">
                  OFF
                </div>
              </div>
            </div>
            <div className="border-2 border-neutral-300 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-mono text-neutral-800 mb-1">Save Prescription History</div>
                  <div className="text-xs font-mono text-neutral-600">Store uploaded prescriptions for future reference</div>
                </div>
                <div className="px-3 py-1 bg-neutral-600 text-white border border-neutral-800 text-xs font-mono">
                  ON
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t-2 border-neutral-300 pt-4">
            <WireframeButton label="Save Settings" />
          </div>
        </WireframeCard>

        <WireframeCard title="Saved Payment Methods">
          <div className="space-y-4">
            {[
              { type: 'Credit Card', last4: '4242', expiry: '12/25', isDefault: true },
              { type: 'Debit Card', last4: '5678', expiry: '08/26', isDefault: false },
            ].map((payment, index) => (
              <div key={index} className="border-2 border-neutral-300 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm font-mono text-neutral-800 mb-1">{payment.type} •••• {payment.last4}</div>
                    <div className="text-xs font-mono text-neutral-600">Expires: {payment.expiry}</div>
                  </div>
                  {payment.isDefault && (
                    <div className="px-2 py-1 bg-neutral-600 text-white border border-neutral-800 text-xs font-mono">
                      DEFAULT
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <WireframeButton label="Edit" variant="secondary" />
                  {!payment.isDefault && <WireframeButton label="Set as Default" variant="secondary" />}
                  <WireframeButton label="Remove" variant="danger" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <WireframeButton label="+ Add Payment Method" />
          </div>
        </WireframeCard>

        <WireframeCard title="Account Actions">
          <div className="space-y-4">
            <div className="border-2 border-neutral-300 p-4">
              <div className="text-sm font-mono text-neutral-800 mb-2">Download Account Data</div>
              <div className="text-xs font-mono text-neutral-600 mb-3">
                Download a copy of all your account data including orders, prescriptions, and profile information
              </div>
              <WireframeButton label="Request Data Download" variant="secondary" />
            </div>
            <div className="border-2 border-red-300 bg-red-50 p-4">
              <div className="text-sm font-mono text-red-800 mb-2">Delete Account</div>
              <div className="text-xs font-mono text-red-700 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </div>
              <WireframeButton label="Delete Account" variant="danger" />
            </div>
          </div>
        </WireframeCard>
      </div>
    </WireframeLayout>
  );
}
