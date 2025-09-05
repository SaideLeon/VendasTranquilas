// src/hooks/use-sync.ts
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SaleWithPending, ProductWithPending, DebtWithPending } from '@/lib/db';
import { useStore } from '@/store/store';

async function syncSales(sales: SaleWithPending[]) {
  const response = await fetch('/api/sync/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sales.map(({ pending, ...rest }) => rest)),
  });
  if (!response.ok) {
    throw new Error('Failed to sync sales');
  }
  const syncedSales = await response.json();
  await db.sales.bulkPut(syncedSales);
  await db.sales.where('id').anyOf(syncedSales.map(s => s.id)).modify({ pending: false });
}

async function syncProducts(products: ProductWithPending[]) {
  const response = await fetch('/api/sync/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(products.map(({ pending, ...rest }) => rest)),
  });
  if (!response.ok) {
    throw new Error('Failed to sync products');
  }
  const syncedProducts = await response.json();
  await db.products.bulkPut(syncedProducts);
  await db.products.where('id').anyOf(syncedProducts.map(p => p.id)).modify({ pending: false });
}

async function syncDebts(debts: DebtWithPending[]) {
  const response = await fetch('/api/sync/debts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(debts.map(({ pending, ...rest }) => rest)),
  });
  if (!response.ok) {
    throw new Error('Failed to sync debts');
  }
  const syncedDebts = await response.json();
  await db.debts.bulkPut(syncedDebts);
  await db.debts.where('id').anyOf(syncedDebts.map(d => d.id)).modify({ pending: false });
}

export function useSync() {
  const { isOnline, setLastSync, lastSync } = useStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const pendingSales = useLiveQuery(() => db.sales.where('pending').equals(true).toArray(), []);
  const pendingProducts = useLiveQuery(() => db.products.where('pending').equals(true).toArray(), []);
  const pendingDebts = useLiveQuery(() => db.debts.where('pending').equals(true).toArray(), []);

  useEffect(() => {
    if (isOnline && !isSyncing) {
      sync();
    }
  }, [isOnline, pendingSales, pendingProducts, pendingDebts]);

  async function sync() {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      // 1. Sync pending changes to the server
      if (pendingSales && pendingSales.length > 0) {
        await syncSales(pendingSales);
      }
      if (pendingProducts && pendingProducts.length > 0) {
        await syncProducts(pendingProducts);
      }
      if (pendingDebts && pendingDebts.length > 0) {
        await syncDebts(pendingDebts);
      }

      // 2. Fetch changes from the server
      await fetchChanges();

      setLastSync(new Date());
    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      setIsSyncing(false);
    }
  }

  async function fetchChanges() {
    const lastSyncTime = lastSync?.toISOString() || new Date(0).toISOString();
    
    const [salesRes, productsRes, debtsRes] = await Promise.all([
      fetch(`/api/sync/sales?since=${lastSyncTime}`),
      fetch(`/api/sync/products?since=${lastSyncTime}`),
      fetch(`/api/sync/debts?since=${lastSyncTime}`),
    ]);

    if (!salesRes.ok || !productsRes.ok || !debtsRes.ok) {
      throw new Error('Failed to fetch changes from server');
    }

    const [sales, products, debts] = await Promise.all([
      salesRes.json(),
      productsRes.json(),
      debtsRes.json(),
    ]);

    await db.sales.bulkPut(sales);
    await db.products.bulkPut(products);
    await db.debts.bulkPut(debts);
  }

  return { isSyncing };
}