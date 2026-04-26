import { useNavigate } from 'react-router';
import { WireframeLayout, Sidebar, WireframeButton, WireframeCard } from '../../components/WireframeLayout';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin/dashboard', active: true },
    { label: 'Add Staff Accounts', path: '/admin/add-staff' },
    { label: 'Manage Users', path: '/admin/manage-users' },
    { label: 'Reports', path: '/admin/reports' },
    { label: 'Logout', path: '/' },
  ];

  return (
    <WireframeLayout 
      sidebar={<Sidebar items={sidebarItems} />}
      title="Administrator Dashboard"
    >
      <div className="space-y-6">
        {/* System Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <WireframeCard>
            <div className="text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">1,234</div>
              <div className="text-xs font-mono text-neutral-600">Total Users</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">45</div>
              <div className="text-xs font-mono text-neutral-600">Active Pharmacists</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">12</div>
              <div className="text-xs font-mono text-neutral-600">Inventory Managers</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-3xl font-mono text-neutral-800 mb-2">456</div>
              <div className="text-xs font-mono text-neutral-600">Total Medicines</div>
            </div>
          </WireframeCard>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-3 gap-4">
          <WireframeCard title="Orders">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-600">Pending:</span>
                <span className="text-neutral-800">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Completed:</span>
                <span className="text-neutral-800">1,456</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Cancelled:</span>
                <span className="text-neutral-800">12</span>
              </div>
            </div>
          </WireframeCard>
          <WireframeCard title="Revenue">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-600">Today:</span>
                <span className="text-neutral-800">$X,XXX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">This Month:</span>
                <span className="text-neutral-800">$XX,XXX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Total:</span>
                <span className="text-neutral-800">$XXX,XXX</span>
              </div>
            </div>
          </WireframeCard>
          <WireframeCard title="Inventory">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-600">Low Stock:</span>
                <span className="text-neutral-800">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Out of Stock:</span>
                <span className="text-neutral-800">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Expiring Soon:</span>
                <span className="text-neutral-800">7</span>
              </div>
            </div>
          </WireframeCard>
        </div>

        {/* Pending Pharmacist Approvals */}
        <WireframeCard title="Recently Created Staff Accounts">
          <div className="space-y-2">
            {[
              { name: 'Dr. Pharmacist Smith', role: 'Pharmacist', status: 'ACTIVE' },
              { name: 'Inv. Manager Johnson', role: 'Inventory Manager', status: 'NOT_LOGGED_IN' },
              { name: 'Dr. Pharmacist Brown', role: 'Pharmacist', status: 'ACTIVE' },
              { name: 'Inv. Manager Davis', role: 'Inventory Manager', status: 'ACTIVE' },
              { name: 'Dr. Pharmacist Wilson', role: 'Pharmacist', status: 'NOT_LOGGED_IN' },
            ].map((staff, index) => (
              <div key={index} className="border-2 border-neutral-300 p-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-mono text-neutral-800">{staff.name}</div>
                  <div className="text-xs font-mono text-neutral-600">Role: {staff.role}</div>
                  <div className="text-xs font-mono text-neutral-500">Created: 2026-03-0{(index % 7) + 1}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 border text-xs font-mono ${
                    staff.status === 'ACTIVE' 
                      ? 'bg-neutral-600 text-white border-neutral-800' 
                      : 'bg-neutral-400 border-neutral-600'
                  }`}>
                    {staff.status}
                  </div>
                  <WireframeButton 
                    label="View Details"
                    variant="secondary"
                    onClick={() => navigate('/admin/add-staff')}
                  />
                </div>
              </div>
            ))}
          </div>
        </WireframeCard>

        {/* Recent Activity */}
        <WireframeCard title="Recent System Activity">
          <div className="space-y-2">
            {[
              'New customer registration: customer@email.com',
              'Staff account created: Dr. Pharmacist Wilson',
              'Prescription approved by Dr. Smith',
              'Order #12345 completed',
              'Inventory updated: Medicine X restocked',
            ].map((activity, index) => (
              <div key={index} className="border-b border-neutral-200 pb-2">
                <div className="text-xs font-mono text-neutral-700">{activity}</div>
                <div className="text-xs font-mono text-neutral-500">2026-03-07 - {10 + index}:30 AM</div>
              </div>
            ))}
          </div>
        </WireframeCard>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <WireframeButton 
            label="Add Staff Account"
            onClick={() => navigate('/admin/add-staff')}
          />
          <WireframeButton label="Generate Report" variant="secondary" />
          <WireframeButton label="System Settings" variant="secondary" />
        </div>
      </div>
    </WireframeLayout>
  );
}