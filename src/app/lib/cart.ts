import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CartItem = {
  medicineId: string;
  medicineName: string;
  sku: string;
  category: string | null;
  pricePerUnit: number;
  quantity: number;
  requiresPrescription: boolean;
  currentStock: number;
};

export type OrderStatus =
  | 'pending'
  | 'prescription_required'
  | 'approved'
  | 'dispensed'
  | 'shipped'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export type OrderItemRow = {
  id: string;
  order_id: string;
  medicine_id: string;
  medicine_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type OrderRow = {
  id: string;
  customer_id: string;
  prescription_id: string | null;
  delivery_address_text: string | null;
  pharmacist_notes: string | null;
  notes: string | null;
  status: OrderStatus;
  total_amount: number;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type OrderRecord = OrderRow & {
  customer_name: string;
  customer_email: string;
  reviewer_name: string | null;
  items: OrderItemRow[];
};

// ─── Local cart (localStorage) ────────────────────────────────────────────────

const CART_KEY = 'pharmasphere_cart';

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch { return []; }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart();
  const existing = cart.find((c) => c.medicineId === item.medicineId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + item.quantity, item.currentStock);
  } else {
    cart.push({ ...item });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(medicineId: string): CartItem[] {
  const cart = getCart().filter((c) => c.medicineId !== medicineId);
  saveCart(cart);
  return cart;
}

export function updateCartQty(medicineId: string, quantity: number): CartItem[] {
  const cart = getCart().map((c) =>
    c.medicineId === medicineId
      ? { ...c, quantity: Math.max(1, Math.min(quantity, c.currentStock)) }
      : c,
  );
  saveCart(cart);
  return cart;
}

export function cartRequiresPrescription(cart: CartItem[]): boolean {
  return cart.some((c) => c.requiresPrescription);
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.pricePerUnit * c.quantity, 0);
}

// ─── Medicine catalogue ───────────────────────────────────────────────────────

export type CatalogueMedicine = {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  pricePerUnit: number;
  currentStock: number;
  requiresPrescription: boolean;
  expiryDate: string | null;
};

export async function loadMedicineCatalogue(): Promise<CatalogueMedicine[]> {
  const { data, error } = await supabase
    .from('medicines')
    .select('id, sku, name, category, price, price_per_unit, requires_prescription, expiry_date, stock_quantity')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((m: any) => ({
    id: m.id,
    sku: m.sku,
    name: m.name,
    category: m.category,
    // use price_per_unit if set, fallback to price column
    pricePerUnit: Number(m.price_per_unit ?? m.price ?? 0),
    currentStock: Number(m.stock_quantity ?? 0),
    requiresPrescription: Boolean(m.requires_prescription),
    expiryDate: m.expiry_date,
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Not logged in.');
  return user.id;
}

async function attachOrderDetails(rows: OrderRow[]): Promise<OrderRecord[]> {
  if (rows.length === 0) return [];

  const userIds = Array.from(new Set(
    rows.flatMap((r) => [r.customer_id, r.reviewed_by].filter(Boolean) as string[])
  ));

  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email')
    .in('id', userIds);

  const userMap = new Map(
    (users ?? []).map((u: any) => [u.id as string, { full_name: u.full_name, email: u.email }])
  );

  const orderIds = rows.map((r) => r.id);
  const { data: itemRows } = await supabase
    .from('order_items')
    .select('id, order_id, medicine_id, medicine_name, quantity, unit_price, line_total')
    .in('order_id', orderIds);

  const itemMap = new Map<string, OrderItemRow[]>();
  for (const item of itemRows ?? []) {
    const list = itemMap.get(item.order_id) ?? [];
    list.push(item as OrderItemRow);
    itemMap.set(item.order_id, list);
  }

  return rows.map((row) => ({
    ...row,
    customer_name: userMap.get(row.customer_id)?.full_name || 'Unknown',
    customer_email: userMap.get(row.customer_id)?.email || '',
    reviewer_name: row.reviewed_by ? userMap.get(row.reviewed_by)?.full_name || null : null,
    items: itemMap.get(row.id) ?? [],
  }));
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function placeOrder({
  cart,
  prescriptionId,
}: {
  cart: CartItem[];
  prescriptionId?: string;
}): Promise<OrderRecord> {
  const userId = await getCurrentUserId();
  if (cart.length === 0) throw new Error('Your cart is empty.');

  const needsRx = cartRequiresPrescription(cart);
  const status: OrderStatus = needsRx ? 'prescription_required' : 'pending';

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      customer_id: userId,
      prescription_id: prescriptionId || null,
      status,
      total_amount: cartTotal(cart),
      delivery_address_text: null,
    })
    .select()
    .single();

  if (orderErr || !order) throw new Error(orderErr?.message || 'Could not create order.');

  const items = cart.map((c) => ({
    order_id: order.id,
    medicine_id: c.medicineId,
    medicine_name: c.medicineName,
    quantity: c.quantity,
    unit_price: c.pricePerUnit,
    line_total: c.pricePerUnit * c.quantity,
  }));

  const { error: itemsErr } = await supabase.from('order_items').insert(items);
  if (itemsErr) throw new Error(itemsErr.message);

  const [record] = await attachOrderDetails([order as OrderRow]);
  return record;
}

export async function loadCustomerOrders(): Promise<OrderRecord[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return attachOrderDetails((data ?? []) as OrderRow[]);
}

export async function loadAllOrdersForPharmacist(): Promise<OrderRecord[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return attachOrderDetails((data ?? []) as OrderRow[]);
}

export async function updateOrderStatus({
  orderId,
  status,
  notes,
}: {
  orderId: string;
  status: OrderStatus;
  notes?: string;
}): Promise<OrderRecord> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      pharmacist_notes: notes ?? null,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || 'Could not update order.');
  const [record] = await attachOrderDetails([data as OrderRow]);
  return record;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function orderStatusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: 'Pending Review',
    prescription_required: 'Prescription Required',
    approved: 'Approved',
    dispensed: 'Dispensed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  };
  return map[status] ?? status;
}

export function orderStatusBadgeClass(status: OrderStatus): string {
  if (status === 'approved' || status === 'dispensed' || status === 'delivered')
    return 'bg-neutral-700 text-white border-neutral-900';
  if (status === 'rejected' || status === 'cancelled')
    return 'bg-red-700 text-white border-red-900';
  if (status === 'prescription_required')
    return 'bg-amber-200 text-amber-900 border-amber-400';
  return 'bg-neutral-300 text-neutral-800 border-neutral-500';
}
