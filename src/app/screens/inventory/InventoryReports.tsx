import { WireframeLayout, Sidebar, WireframeBox, WireframeButton, WireframeCard } from '../../components/WireframeLayout';

export default function InventoryReports() {
  const sidebarItems = [
    { label: 'Dashboard', path: '/inventory/dashboard' },
    { label: 'Manage Inventory', path: '/inventory/manage' },
    { label: 'Reports', path: '/inventory/reports', active: true },
    { label: 'Logout', path: '/' },
  ];

  return (
    <WireframeLayout 
      sidebar={<Sidebar items={sidebarItems} />}
      title="Inventory Reports"
    >
      <div className="space-y-6">
        {/* Report Type Selection */}
        <WireframeCard title="Generate Report">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-mono text-neutral-700 mb-2">Report Type</div>
              <div className="space-y-2">
                {[
                  'Stock Level Report',
                  'Expiry Date Report',
                  'Low Stock Alert Report',
                  'Restock History Report',
                  'Medicine Movement Report',
                  'Supplier Report'
                ].map((type, index) => (
                  <div key={index} className="border-2 border-neutral-400 p-3 flex justify-between items-center">
                    <div className="text-xs font-mono text-neutral-700">{type}</div>
                    <WireframeButton label="Generate" variant="secondary" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Date Range</div>
                <div className="grid grid-cols-2 gap-2">
                  <WireframeBox label="From Date" />
                  <WireframeBox label="To Date" />
                </div>
              </div>
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Filter by Category</div>
                <WireframeBox label="All Categories ▼" />
              </div>
              <div>
                <div className="text-xs font-mono text-neutral-700 mb-1">Export Format</div>
                <div className="flex gap-2">
                  <WireframeButton label="PDF" variant="secondary" />
                  <WireframeButton label="Excel" variant="secondary" />
                  <WireframeButton label="CSV" variant="secondary" />
                </div>
              </div>
            </div>
          </div>
        </WireframeCard>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-4 gap-4">
          <WireframeCard title="Total Stock Value">
            <div className="text-2xl font-mono text-neutral-800 text-center">$XXX,XXX</div>
          </WireframeCard>
          <WireframeCard title="Items in Stock">
            <div className="text-2xl font-mono text-neutral-800 text-center">456</div>
          </WireframeCard>
          <WireframeCard title="Restocked (Month)">
            <div className="text-2xl font-mono text-neutral-800 text-center">89</div>
          </WireframeCard>
          <WireframeCard title="Items Sold (Month)">
            <div className="text-2xl font-mono text-neutral-800 text-center">1,234</div>
          </WireframeCard>
        </div>

        {/* Sample Report Preview - Stock Level */}
        <WireframeCard title="Report Preview - Stock Level Report (2026-03-01 to 2026-03-07)">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-400">
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Medicine Name</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">SKU</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Category</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Current Stock</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Min. Required</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Max. Capacity</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, index) => {
                  const stock = index < 3 ? 20 + index * 5 : 150 + index * 20;
                  const min = 50;
                  const status = stock < min ? 'LOW' : stock > 200 ? 'OVERSTOCKED' : 'NORMAL';
                  
                  return (
                    <tr key={index} className="border-b border-neutral-300">
                      <td className="p-3 text-xs font-mono text-neutral-700">Medicine {index + 1}</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">MED-00{index + 1}</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">
                        {index % 3 === 0 ? 'Pain Relief' : index % 3 === 1 ? 'Antibiotics' : 'Vitamins'}
                      </td>
                      <td className="p-3 text-xs font-mono text-neutral-700">{stock}</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">{min}</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">500</td>
                      <td className="p-3">
                        <div className={`px-2 py-1 border text-xs font-mono inline-block ${
                          status === 'LOW' ? 'bg-neutral-500 text-white border-neutral-700' :
                          status === 'OVERSTOCKED' ? 'bg-neutral-400 border-neutral-600' :
                          'bg-neutral-300 border-neutral-500'
                        }`}>
                          {status}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-4">
            <WireframeButton label="Export PDF" />
            <WireframeButton label="Export Excel" variant="secondary" />
            <WireframeButton label="Print" variant="secondary" />
          </div>
        </WireframeCard>

        {/* Graphical Report Preview */}
        <WireframeCard title="Stock Trend Analysis">
          <WireframeBox height="h-64" label="[Line Graph: Stock Levels Over Time]" className="mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <WireframeBox height="h-32" label="[Bar Chart: Category Distribution]" />
            <WireframeBox height="h-32" label="[Pie Chart: Stock Status]" />
            <WireframeBox height="h-32" label="[Bar Chart: Top 10 Medicines]" />
          </div>
        </WireframeCard>

        {/* Scheduled Reports */}
        <WireframeCard title="Scheduled Reports">
          <div className="space-y-2">
            {[
              { name: 'Daily Stock Alert', frequency: 'Daily at 9:00 AM', status: 'ACTIVE' },
              { name: 'Weekly Inventory Summary', frequency: 'Every Monday', status: 'ACTIVE' },
              { name: 'Monthly Expiry Report', frequency: 'First day of month', status: 'ACTIVE' },
            ].map((report, index) => (
              <div key={index} className="border-2 border-neutral-300 p-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-mono text-neutral-800">{report.name}</div>
                  <div className="text-xs font-mono text-neutral-600">Frequency: {report.frequency}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-neutral-600 text-white border-2 border-neutral-800 text-xs font-mono">
                    {report.status}
                  </div>
                  <WireframeButton label="Edit" variant="secondary" />
                  <WireframeButton label="Disable" variant="danger" />
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