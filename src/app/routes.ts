import { createBrowserRouter } from "react-router";
import LoginScreen from "./screens/LoginScreen";
import RegistrationScreen from "./screens/RegistrationScreen";
import ForgotPassword from "./screens/ForgotPassword";
import ResetPassword from "./screens/ResetPassword";
import CustomerDashboard from "./screens/customer/CustomerDashboard";
import BrowseMedicines from "./screens/customer/BrowseMedicines";
import CustomerOrders from "./screens/customer/CustomerOrders";
import RoutineOrders from "./screens/customer/RoutineOrders";
import UploadPrescription from "./screens/customer/UploadPrescription";
import CustomerProfile from "./screens/customer/CustomerProfile";
import Cart from "./screens/customer/Cart";
import OrderConfirmation from "./screens/customer/OrderConfirmation";
import PharmacistDashboard from "./screens/pharmacist/PharmacistDashboard";
import PrescriptionReview from "./screens/pharmacist/PrescriptionReview";
import PharmacistOrders from "./screens/pharmacist/PharmacistOrders";
import PharmacistProfile from "./screens/pharmacist/PharmacistProfile";
import InventoryDashboard from "./screens/inventory/InventoryDashboard";
import ManageInventory from "./screens/inventory/ManageInventory";
import InventoryReports from "./screens/inventory/InventoryReports";
import AdminDashboard from "./screens/admin/AdminDashboard";
import AddStaff from "./screens/admin/AddStaff";
import ManageUsers from "./screens/admin/ManageUsers";
import AdminReports from "./screens/admin/AdminReports";
import OrdersPage from "./screens/shared/OrdersPage";

export const router = createBrowserRouter([
  // ── Auth ──────────────────────────────────────────────────────
  { path: "/",      Component: LoginScreen },
  { path: "/login", Component: LoginScreen },
  { path: "/register", Component: RegistrationScreen },
  { path: "/forgot-password", Component: ForgotPassword },
  { path: "/reset-password", Component: ResetPassword },

  // ── Customer ──────────────────────────────────────────────────
  { path: "/customer/dashboard",    Component: CustomerDashboard },

  // Both paths used in sidebars — alias keeps all nav links working
  { path: "/customer/browse",           Component: BrowseMedicines },
  { path: "/customer/browse-medicines", Component: BrowseMedicines },

  { path: "/customer/cart",              Component: Cart },
  { path: "/customer/order-confirmation",Component: OrderConfirmation },
  { path: "/customer/orders",            Component: CustomerOrders },
  { path: "/customer/routine-orders",    Component: RoutineOrders },

  // Both paths used in sidebars
  { path: "/customer/prescription",        Component: UploadPrescription },
  { path: "/customer/upload-prescription", Component: UploadPrescription },

  { path: "/customer/profile", Component: CustomerProfile },

  // ── Pharmacist ────────────────────────────────────────────────
  { path: "/pharmacist/dashboard",           Component: PharmacistDashboard },
  { path: "/pharmacist/prescription-review", Component: PrescriptionReview },
  { path: "/pharmacist/orders",              Component: PharmacistOrders },
  { path: "/pharmacist/profile",             Component: PharmacistProfile },

  // ── Inventory ─────────────────────────────────────────────────
  { path: "/inventory/dashboard", Component: InventoryDashboard },
  { path: "/inventory/manage",    Component: ManageInventory },
  { path: "/inventory/reports",   Component: InventoryReports },

  // ── Admin ─────────────────────────────────────────────────────
  { path: "/admin/dashboard",    Component: AdminDashboard },
  { path: "/admin/add-staff",    Component: AddStaff },
  { path: "/admin/manage-users", Component: ManageUsers },
  { path: "/admin/reports",      Component: AdminReports },

  // ── Shared ────────────────────────────────────────────────────
  { path: "/orders", Component: OrdersPage },
]);
