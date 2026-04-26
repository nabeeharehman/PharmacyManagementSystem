import { WireframeLayout, Sidebar, WireframeBox, WireframeButton, WireframeCard } from '../../components/WireframeLayout';

export default function ManageUsers() {
  const sidebarItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Add Staff Accounts', path: '/admin/add-staff' },
    { label: 'Manage Users', path: '/admin/manage-users', active: true },
    { label: 'Reports', path: '/admin/reports' },
    { label: 'Logout', path: '/' },
  ];

  return (
    <WireframeLayout 
      sidebar={<Sidebar items={sidebarItems} />}
      title="Manage Users"
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <WireframeBox label="Search by name or email..." />
          </div>
          <WireframeBox label="Filter by Role ▼" className="w-48" />
          <WireframeBox label="Filter by Status ▼" className="w-48" />
          <WireframeButton label="Add New User" />
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-5 gap-4">
          <WireframeCard>
            <div className="text-center">
              <div className="text-2xl font-mono text-neutral-800 mb-1">1,234</div>
              <div className="text-xs font-mono text-neutral-600">Total Users</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-2xl font-mono text-neutral-800 mb-1">1,050</div>
              <div className="text-xs font-mono text-neutral-600">Customers</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-2xl font-mono text-neutral-800 mb-1">45</div>
              <div className="text-xs font-mono text-neutral-600">Pharmacists</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-2xl font-mono text-neutral-800 mb-1">12</div>
              <div className="text-xs font-mono text-neutral-600">Inv. Managers</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="text-2xl font-mono text-neutral-800 mb-1">3</div>
              <div className="text-xs font-mono text-neutral-600">Admins</div>
            </div>
          </WireframeCard>
        </div>

        {/* Users Table */}
        <WireframeCard title="All Users">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-400">
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">User ID</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Name</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Email</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Role</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Registration Date</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Status</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 15 }).map((_, index) => {
                  const roles = ['Customer', 'Pharmacist', 'Inventory Manager', 'Admin'];
                  const statuses = ['ACTIVE', 'SUSPENDED', 'PENDING'];
                  const role = roles[index % 4];
                  const status = index % 10 === 0 ? 'SUSPENDED' : index % 8 === 0 ? 'PENDING' : 'ACTIVE';
                  
                  return (
                    <tr key={index} className="border-b border-neutral-300">
                      <td className="p-3 text-xs font-mono text-neutral-700">USR-{1000 + index}</td>
                      <td className="p-3 text-xs font-mono text-neutral-700">User Name {index + 1}</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">user{index + 1}@email.com</td>
                      <td className="p-3 text-xs font-mono text-neutral-700">{role}</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">2026-0{(index % 2) + 1}-{(index % 28) + 1}</td>
                      <td className="p-3">
                        <div className={`px-2 py-1 border text-xs font-mono inline-block ${
                          status === 'ACTIVE' ? 'bg-neutral-600 text-white border-neutral-800' :
                          status === 'SUSPENDED' ? 'bg-neutral-500 text-white border-neutral-700' :
                          'bg-neutral-400 border-neutral-600'
                        }`}>
                          {status}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <WireframeButton label="View" variant="secondary" />
                          <WireframeButton label="Edit" variant="secondary" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </WireframeCard>

        {/* User Detail Panel */}
        <WireframeCard title="User Details - USR-1000">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-xs font-mono text-neutral-600 mb-2">Personal Information</div>
              <div className="space-y-1 text-xs font-mono">
                <div className="text-neutral-700">Name: Jane Customer</div>
                <div className="text-neutral-700">Email: jane@email.com</div>
                <div className="text-neutral-700">Phone: (555) 123-4567</div>
                <div className="text-neutral-700">Registration: 2026-01-15</div>
              </div>
            </div>
            <div>
              <div className="text-xs font-mono text-neutral-600 mb-2">Account Information</div>
              <div className="space-y-1 text-xs font-mono">
                <div className="text-neutral-700">User ID: USR-1000</div>
                <div className="text-neutral-700">Role: Customer</div>
                <div className="text-neutral-700">Status: Active</div>
                <div className="text-neutral-700">Last Login: 2026-03-07</div>
              </div>
            </div>
            <div>
              <div className="text-xs font-mono text-neutral-600 mb-2">Activity Summary</div>
              <div className="space-y-1 text-xs font-mono">
                <div className="text-neutral-700">Total Orders: 12</div>
                <div className="text-neutral-700">Prescriptions: 5</div>
                <div className="text-neutral-700">Total Spent: $XXX.XX</div>
                <div className="text-neutral-700">Last Order: 2026-03-05</div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t-2 border-neutral-300 pt-4">
            <div className="text-xs font-mono text-neutral-600 mb-2">Admin Actions</div>
            <div className="flex gap-4 mb-4">
              <WireframeButton label="Suspend Account" variant="danger" />
              <WireframeButton label="Reset Password" variant="secondary" />
              <WireframeButton label="Change Role" variant="secondary" />
              <WireframeButton label="View Activity Log" variant="secondary" />
            </div>
            
            <div className="text-xs font-mono text-neutral-600 mb-2">Admin Notes</div>
            <WireframeBox height="h-20" label="Add notes about this user..." />
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