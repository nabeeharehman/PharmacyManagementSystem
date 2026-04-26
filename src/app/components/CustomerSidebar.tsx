import { useLocation } from 'react-router';
import { Sidebar } from './WireframeLayout';

export default function CustomerSidebar() {
  const { pathname } = useLocation();
  const items = [
    { label: 'Dashboard', path: '/customer/dashboard' },
    { label: 'Browse Medicines', path: '/customer/browse' },
    { label: 'Cart', path: '/customer/cart' },
    { label: 'My Orders', path: '/customer/orders' },
    { label: 'Upload Prescription', path: '/customer/prescription' },
    { label: 'Routine Orders', path: '/customer/routine-orders' },
    { label: 'My Profile', path: '/customer/profile' },
    { label: 'Logout', path: '/' },
  ].map((item) => ({ ...item, active: pathname.startsWith(item.path) }));

  return <Sidebar items={items} />;
}
