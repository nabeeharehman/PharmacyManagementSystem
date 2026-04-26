import { supabase } from './supabase';

export type MedicineRow = {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  min_stock_level: number;
  expiry_date: string | null;
  batch_number: string | null;
  current_stock: number;
};

type MedicineBaseRow = Omit<MedicineRow, 'current_stock'>;

type InventoryTransactionRow = {
  medicine_id: string;
  quantity_change: number | null;
  previous_stock: number | null;
  new_stock: number | null;
  created_at?: string | null;
};

function buildStockMap(transactions: InventoryTransactionRow[]) {
  const grouped = new Map<string, InventoryTransactionRow[]>();

  transactions.forEach((transaction) => {
    if (!grouped.has(transaction.medicine_id)) {
      grouped.set(transaction.medicine_id, []);
    }

    grouped.get(transaction.medicine_id)!.push(transaction);
  });

  const stockMap = new Map<string, number>();

  grouped.forEach((medicineTransactions, medicineId) => {
    const sortedTransactions = [...medicineTransactions].sort((left, right) => {
      const leftTime = new Date(left.created_at ?? 0).getTime();
      const rightTime = new Date(right.created_at ?? 0).getTime();
      return rightTime - leftTime;
    });

    const latestWithNewStock = sortedTransactions.find(
      (transaction) => typeof transaction.new_stock === 'number',
    );

    if (latestWithNewStock && typeof latestWithNewStock.new_stock === 'number') {
      stockMap.set(medicineId, latestWithNewStock.new_stock);
      return;
    }

    const derivedStock = medicineTransactions.reduce(
      (total, transaction) => total + (transaction.quantity_change ?? 0),
      0,
    );
    stockMap.set(medicineId, derivedStock);
  });

  return stockMap;
}

export async function loadMedicineInventory() {
  const { data: medicines, error: medicinesError } = await supabase
    .from('medicines')
    .select('id, sku, name, category, min_stock_level, expiry_date, batch_number')
    .order('created_at', { ascending: false });

  if (medicinesError) {
    throw medicinesError;
  }

  const { data: transactions, error: transactionsError } = await supabase
    .from('inventory_transactions')
    .select('medicine_id, quantity_change, previous_stock, new_stock, created_at');

  if (transactionsError) {
    throw transactionsError;
  }

  const stockMap = buildStockMap((transactions ?? []) as InventoryTransactionRow[]);

  return ((medicines ?? []) as MedicineBaseRow[]).map((medicine) => ({
    ...medicine,
    current_stock: stockMap.get(medicine.id) ?? 0,
  }));
}

export async function createInventoryTransaction({
  medicineId,
  quantityChange,
  previousStock,
  newStock,
  transactionType,
}: {
  medicineId: string;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  transactionType: string;
}) {
  const { error } = await supabase.from('inventory_transactions').insert({
    medicine_id: medicineId,
    transaction_type: transactionType,
    quantity_change: quantityChange,
    previous_stock: previousStock,
    new_stock: newStock,
  });

  if (error) {
    throw error;
  }
}
