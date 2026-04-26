import { useLocation } from 'react-router';
import { Sidebar } from './WireframeLayout';

export default function PharmacistSidebar() {
  const { pathname } = useLocation();
  const items = [
    { label: 'Dashboard', path: '/pharmacist/dashboard' },
    { label: 'Prescription Reviews', path: '/pharmacist/prescription-review' },
    { label: 'Orders', path: '/pharmacist/orders' },
    { label: 'Profile', path: '/pharmacist/profile' },
    { label: 'Logout', path: '/' },
  ].map((item) => ({ ...item, active: pathname.startsWith(item.path) }));

  return <Sidebar items={items} />;
}
