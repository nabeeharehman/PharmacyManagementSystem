import { WireframeLayout, Sidebar, WireframeBox, WireframeButton, WireframeCard } from '../../components/WireframeLayout';

export default function AdminReports() {
  const sidebarItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Add Staff Accounts', path: '/admin/add-staff' },
    { label: 'Manage Users', path: '/admin/manage-users' },
    { label: 'Reports', path: '/admin/reports', active: true },
    { label: 'Logout', path: '/' },
  ];

  return (
    <WireframeLayout 
      sidebar={<Sidebar items={sidebarItems} />}
      title="System Reports"
    >
      <div className="space-y-6">
        {/* Report Categories */}
        <div className="grid grid-cols-3 gap-4">
          <WireframeCard title="User Reports">
            <div className="space-y-2">
              <WireframeButton label="User Registration Report" className="w-full" variant="secondary" />
              <WireframeButton label="User Activity Report" className="w-full" variant="secondary" />
              <WireframeButton label="User Demographics" className="w-full" variant="secondary" />
            </div>
          </WireframeCard>
          <WireframeCard title="Transaction Reports">
            <div className="space-y-2">
              <WireframeButton label="Sales Summary Report" className="w-full" variant="secondary" />
              <WireframeButton label="Revenue Analysis" className="w-full" variant="secondary" />
              <WireframeButton label="Payment Methods" className="w-full" variant="secondary" />
            </div>
          </WireframeCard>
          <WireframeCard title="Operational Reports">
            <div className="space-y-2">
              <WireframeButton label="Order Fulfillment" className="w-full" variant="secondary" />
              <WireframeButton label="Prescription Processing" className="w-full" variant="secondary" />
              <WireframeButton label="Pharmacist Performance" className="w-full" variant="secondary" />
            </div>
          </WireframeCard>
        </div>

        {/* Report Configuration */}
        <WireframeCard title="Generate Custom Report">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Report Type</div>
                <WireframeBox label="Select Report Type ▼" />
              </div>
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Date Range</div>
                <div className="grid grid-cols-2 gap-2">
                  <WireframeBox label="From Date" />
                  <WireframeBox label="To Date" />
                </div>
              </div>
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Group By</div>
                <WireframeBox label="Select Grouping ▼" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Filters</div>
                <WireframeBox label="Filter by User Role ▼" className="mb-2" />
                <WireframeBox label="Filter by Status ▼" />
              </div>
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Export Format</div>
                <div className="flex gap-2">
                  <WireframeButton label="PDF" variant="secondary" />
                  <WireframeButton label="Excel" variant="secondary" />
                  <WireframeButton label="CSV" variant="secondary" />
                </div>
              </div>
              <WireframeButton label="Generate Report" className="w-full" />
            </div>
          </div>
        </WireframeCard>

        {/* System Overview Dashboard */}
        <WireframeCard title="System Overview (Last 30 Days)">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="border-2 border-neutral-300 p-4 text-center">
              <div className="text-2xl font-mono text-neutral-800 mb-1">1,234</div>
              <div className="text-xs font-mono text-neutral-600">Total Users</div>
            </div>
            <div className="border-2 border-neutral-300 p-4 text-center">
              <div className="text-2xl font-mono text-neutral-800 mb-1">456</div>
              <div className="text-xs font-mono text-neutral-600">Total Orders</div>
            </div>
            <div className="border-2 border-neutral-300 p-4 text-center">
              <div className="text-2xl font-mono text-neutral-800 mb-1">$XX,XXX</div>
              <div className="text-xs font-mono text-neutral-600">Revenue</div>
            </div>
            <div className="border-2 border-neutral-300 p-4 text-center">
              <div className="text-2xl font-mono text-neutral-800 mb-1">89%</div>
              <div className="text-xs font-mono text-neutral-600">System Uptime</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <WireframeBox height="h-48" label="[Line Graph: User Growth Over Time]" />
            <WireframeBox height="h-48" label="[Bar Chart: Orders by Status]" />
          </div>
        </WireframeCard>

        {/* Sample Report Preview */}
        <WireframeCard title="Report Preview - User Activity Report">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-400">
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Date</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">New Users</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Active Users</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Orders Placed</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Prescriptions</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 7 }).map((_, index) => (
                  <tr key={index} className="border-b border-neutral-300">
                    <td className="p-3 text-xs font-mono text-neutral-700">2026-03-{(7 - index) < 10 ? '0' : ''}{7 - index}</td>
                    <td className="p-3 text-xs font-mono text-neutral-700">{15 + index * 3}</td>
                    <td className="p-3 text-xs font-mono text-neutral-700">{350 + index * 25}</td>
                    <td className="p-3 text-xs font-mono text-neutral-700">{45 + index * 8}</td>
                    <td className="p-3 text-xs font-mono text-neutral-700">{12 + index * 2}</td>
                    <td className="p-3 text-xs font-mono text-neutral-700">$X,XXX</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-4">
            <WireframeButton label="Export Full Report" />
            <WireframeButton label="Schedule Email" variant="secondary" />
            <WireframeButton label="Print" variant="secondary" />
          </div>
        </WireframeCard>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <WireframeCard title="Top Performing Medicines">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex justify-between text-xs font-mono border-b border-neutral-200 pb-1">
                  <span className="text-neutral-700">Medicine {item}</span>
                  <span className="text-neutral-600">{100 - item * 10} sold</span>
                </div>
              ))}
            </div>
          </WireframeCard>
          
          <WireframeCard title="Active Pharmacists">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex justify-between text-xs font-mono border-b border-neutral-200 pb-1">
                  <span className="text-neutral-700">Dr. Pharmacist {item}</span>
                  <span className="text-neutral-600">{50 - item * 5} reviews</span>
                </div>
              ))}
            </div>
          </WireframeCard>
          
          <WireframeCard title="System Alerts">
            <div className="space-y-2">
              {[
                { text: 'Low stock items: 23', status: 'warning' },
                { text: 'Pending approvals: 8', status: 'info' },
                { text: 'System backup: OK', status: 'success' },
                { text: 'Database size: 85%', status: 'warning' },
                { text: 'Active sessions: 234', status: 'info' },
              ].map((alert, index) => (
                <div key={index} className="text-xs font-mono text-neutral-700 border-b border-neutral-200 pb-1">
                  {alert.text}
                </div>
              ))}
            </div>
          </WireframeCard>
        </div>

        {/* Scheduled Reports */}
        <WireframeCard title="Scheduled Reports">
          <div className="space-y-2">
            {[
              { name: 'Daily Activity Summary', schedule: 'Every day at 8:00 AM', recipients: 'admin@pharmasphere.com' },
              { name: 'Weekly Revenue Report', schedule: 'Every Monday at 9:00 AM', recipients: 'admin@pharmasphere.com, finance@pharmasphere.com' },
              { name: 'Monthly User Growth', schedule: 'First day of month', recipients: 'management@pharmasphere.com' },
            ].map((report, index) => (
              <div key={index} className="border-2 border-neutral-300 p-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-mono text-neutral-800">{report.name}</div>
                  <div className="text-xs font-mono text-neutral-600">Schedule: {report.schedule}</div>
                  <div className="text-xs font-mono text-neutral-500">Recipients: {report.recipients}</div>
                </div>
                <div className="flex gap-2">
                  <WireframeButton label="Edit" variant="secondary" />
                  <WireframeButton label="Run Now" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <WireframeButton label="+ Create Scheduled Report" />
          </div>
        </WireframeCard>
      </div>
    </WireframeLayout>
  );
}