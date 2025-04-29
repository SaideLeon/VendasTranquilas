// src/lib/db.ts
import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { pgTable, serial, text, integer, doublePrecision, boolean, timestamp } from 'drizzle-orm/pg-core';

// Define Drizzle schemas matching your types

export const productsTable = pgTable('products', {
  id: text('id').primaryKey(), // Using text for UUID compatibility
  name: text('name').notNull(),
  acquisitionValue: doublePrecision('acquisition_value').notNull(),
  quantity: integer('quantity').notNull(),
  initialQuantity: integer('initial_quantity'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const salesTable = pgTable('sales', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => productsTable.id, { onDelete: 'cascade' }).notNull(),
  productName: text('product_name').notNull(), // Denormalized
  quantitySold: integer('quantity_sold').notNull(),
  saleValue: doublePrecision('sale_value').notNull(),
  isLoss: boolean('is_loss').default(false).notNull(),
  lossReason: text('loss_reason'),
  profit: doublePrecision('profit').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const debtsTable = pgTable('debts', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['receivable', 'payable'] }).notNull(),
  description: text('description').notNull(),
  amount: doublePrecision('amount').notNull(),
  amountPaid: doublePrecision('amount_paid').default(0).notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }),
  status: text('status', { enum: ['pending', 'paid', 'partially_paid'] }).default('pending').notNull(),
  contactName: text('contact_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  relatedSaleId: text('related_sale_id').references(() => salesTable.id, { onDelete: 'set null' }), // Optional link, set null if sale deleted
});

// Connect to Vercel Postgres
export const db = drizzle(sql);

// Example of how to use Drizzle with Vercel Postgres sql tag
// const users = await db.select().from(usersTable);

// You can also directly use the sql tag for raw queries if needed
// export { sql };
