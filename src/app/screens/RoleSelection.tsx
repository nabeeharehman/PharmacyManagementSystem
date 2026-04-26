import { useNavigate } from 'react-router';
import { WireframeButton, WireframeCard } from '../components/WireframeLayout';

export default function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Customer',
      description: 'Browse medicines, upload prescriptions, place orders',
      path: '/customer/dashboard',
      screens: ['Dashboard', 'Upload Prescription', 'Browse Medicines', 'Cart', 'Order Confirmation']
    },
    {
      title: 'Pharmacist',
      description: 'Review prescriptions, approve orders, manage pharmacy operations',
      path: '/pharmacist/dashboard',
      screens: ['Dashboard', 'Prescription Review', 'Orders', 'Profile']
    },
    {
      title: 'Inventory Manager',
      description: 'Manage stock, track inventory, handle restocking',
      path: '/inventory/dashboard',
      screens: ['Dashboard', 'Manage Inventory', 'Stock Alerts', 'Reports']
    },
    {
      title: 'Administrator',
      description: 'Approve pharmacists, manage users, view system reports',
      path: '/admin/dashboard',
      screens: ['Dashboard', 'Approve Pharmacists', 'Manage Users', 'Reports']
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-3xl font-mono text-neutral-800 mb-2">PharmaSphere</div>
          <div className="text-lg font-mono text-neutral-600 mb-1">Pharmacy Management System</div>
        </div>

        <div className="mb-8 text-center">
          <WireframeButton 
            label="View Login Screen"
            onClick={() => navigate('/login')}
            variant="secondary"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {roles.map((role, index) => (
            <WireframeCard key={index} title={role.title}>
              <div className="space-y-4">
                <div className="text-xs font-mono text-neutral-600">
                  {role.description}
                </div>
                
                <div>
                  <div className="text-xs font-mono text-neutral-700 mb-2">Available Screens:</div>
                  <div className="space-y-1">
                    {role.screens.map((screen, idx) => (
                      <div key={idx} className="text-xs font-mono text-neutral-600 pl-2">
                        • {screen}
                      </div>
                    ))}
                  </div>
                </div>

                <WireframeButton 
                  label={`View ${role.title} Interface`}
                  className="w-full"
                  onClick={() => navigate(role.path)}
                />
              </div>
            </WireframeCard>
          ))}
        </div>

        <div className="mt-8 border-2 border-neutral-400 bg-white p-6">
          <div className="text-sm font-mono text-neutral-700 mb-2">Wireframe Features:</div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs font-mono text-neutral-600">
            <div>• Low-fidelity grayscale design</div>
            <div>• Dashboard layouts with sidebar navigation</div>
            <div>• User authentication flows</div>
            <div>• Prescription management workflows</div>
            <div>• Inventory tracking and alerts</div>
            <div>• Order management system</div>
            <div>• Admin approval processes</div>
            <div>• Fully navigable interface</div>
          </div>
        </div>
      </div>
    </div>
  );
}
