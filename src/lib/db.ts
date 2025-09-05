// src/lib/db.ts
import Dexie, { Table } from 'dexie';
import { Product, Sale, Debt } from '@/types';

export interface ProductWithPending extends Product {
  pending?: boolean;
  deleted?: boolean;
}

export interface SaleWithPending extends Sale {
  pending?: boolean;
  deleted?: boolean;
}

export interface DebtWithPending extends Debt {
  pending?: boolean;
  deleted?: boolean;
}

export class MySubclassedDexie extends Dexie {
  products!: Table<ProductWithPending>;
  sales!: Table<SaleWithPending>;
  debts!: Table<DebtWithPending>;

  constructor() {
    super('sigefDatabase');
    this.version(2).stores({
      products: '++id, name, userId, pending',
      sales: '++id, productId, productName, userId, pending',
      debts: '++id, type, status, userId, pending',
    });
  }
}

export const db = new MySubclassedDexie();
