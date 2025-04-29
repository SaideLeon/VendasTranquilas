'use server';

import { db, productsTable, salesTable, debtsTable } from '@/lib/db';
import type { Product, Sale, Debt } from '@/types';
import { calculateUnitCost } from '@/types'; // Assuming this helper stays in types
import { eq, sql as drizzleSql } from 'drizzle-orm';
import { sql } from '@vercel/postgres'; // For connection check

// --- Database Connection Check ---
export async function checkDbConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`; // Simple query to check connection
    console.log("Database connection successful.");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}


// --- Product Actions ---
export async function getProducts(): Promise<Product[]> {
  try {
    const products = await db.select().from(productsTable).orderBy(productsTable.createdAt);
    // Map result to Product type if needed (Drizzle should infer correctly here)
    return products.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(), // Ensure date is string
    })) as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product | null> {
  const newProduct: Product = {
    ...productData,
    id: crypto.randomUUID(), // Generate UUID
    createdAt: new Date().toISOString(),
    // Ensure initialQuantity is set correctly
    initialQuantity: productData.initialQuantity ?? productData.quantity,
  };
  try {
    const inserted = await db.insert(productsTable).values({
        ...newProduct,
        createdAt: new Date(newProduct.createdAt) // Convert back to Date for DB
    }).returning();

    if (!inserted || inserted.length === 0) {
        throw new Error("Insert operation returned no result.");
    }
    // Map result back to Product type
    return {
        ...inserted[0],
        createdAt: inserted[0].createdAt.toISOString(),
    } as Product;
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error(`Failed to add product: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateProduct(product: Product): Promise<Product | null> {
  try {
    const updated = await db.update(productsTable)
      .set({
        name: product.name,
        acquisitionValue: product.acquisitionValue,
        quantity: product.quantity,
        initialQuantity: product.initialQuantity,
        // Do not update createdAt
      })
      .where(eq(productsTable.id, product.id))
      .returning();

     if (!updated || updated.length === 0) {
        throw new Error("Update operation returned no result or product not found.");
    }
     return {
        ...updated[0],
        createdAt: updated[0].createdAt.toISOString(), // Ensure date is string
    } as Product;
  } catch (error) {
    console.error("Error updating product:", error);
     throw new Error(`Failed to update product: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    // Drizzle handles cascading deletes if set up in schema or DB
    await db.delete(productsTable).where(eq(productsTable.id, productId));
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : String(error)}`);
  }
}


// --- Sale Actions ---
export async function getSales(): Promise<Sale[]> {
  try {
    const sales = await db.select().from(salesTable).orderBy(salesTable.createdAt);
     return sales.map(s => ({
        ...s,
        createdAt: s.createdAt.toISOString(), // Ensure date is string
    })) as Sale[];
  } catch (error) {
    console.error("Error fetching sales:", error);
     throw new Error(`Failed to fetch sales: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addSale(saleData: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale | null> {
    const product = await db.select().from(productsTable).where(eq(productsTable.id, saleData.productId)).limit(1);

    if (!product || product.length === 0) {
        throw new Error("Product not found for sale.");
    }
    if (product[0].quantity < saleData.quantitySold) {
        throw new Error("Insufficient stock for sale/loss.");
    }

    const { cost: unitCost } = calculateUnitCost(product[0] as Product);
    const profit = saleData.isLoss
        ? -(unitCost * saleData.quantitySold)
        : saleData.saleValue - (unitCost * saleData.quantitySold);

    const newSale: Sale = {
        ...saleData,
        id: crypto.randomUUID(),
        productName: product[0].name,
        profit: profit,
        createdAt: new Date().toISOString(),
    };

    try {
        // Use a transaction to ensure atomicity
        await db.transaction(async (tx) => {
            // 1. Insert the sale
            await tx.insert(salesTable).values({
                ...newSale,
                createdAt: new Date(newSale.createdAt) // Convert to Date for DB
            });

            // 2. Update product quantity
            await tx.update(productsTable)
                .set({ quantity: product[0].quantity - saleData.quantitySold })
                .where(eq(productsTable.id, saleData.productId));
        });

         // Fetch the newly inserted sale to return it
        const insertedSale = await db.select().from(salesTable).where(eq(salesTable.id, newSale.id)).limit(1);

         if (!insertedSale || insertedSale.length === 0) {
            throw new Error("Failed to fetch the newly added sale."); // Should not happen if transaction succeeded
        }

         return {
             ...insertedSale[0],
             createdAt: insertedSale[0].createdAt.toISOString(), // Ensure date is string
         } as Sale;

    } catch (error) {
        console.error("Error adding sale and updating product quantity:", error);
        throw new Error(`Failed to add sale: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function deleteSale(saleId: string): Promise<void> {
  const saleToDelete = await db.select().from(salesTable).where(eq(salesTable.id, saleId)).limit(1);

  if (!saleToDelete || saleToDelete.length === 0) {
    throw new Error("Sale not found.");
  }

  const product = await db.select().from(productsTable).where(eq(productsTable.id, saleToDelete[0].productId)).limit(1);

  if (!product || product.length === 0) {
    // This indicates data inconsistency, but proceed with sale deletion attempt
    console.warn(`Product with ID ${saleToDelete[0].productId} not found for sale ${saleId}. Attempting to delete sale only.`);
  }

  try {
     await db.transaction(async (tx) => {
            // 1. Delete the sale
            await tx.delete(salesTable).where(eq(salesTable.id, saleId));

            // 2. Restore product quantity (if product exists)
            if (product && product.length > 0) {
                 await tx.update(productsTable)
                .set({ quantity: product[0].quantity + saleToDelete[0].quantitySold })
                .where(eq(productsTable.id, saleToDelete[0].productId));
            }
     });
  } catch (error) {
    console.error("Error deleting sale and restoring product quantity:", error);
     throw new Error(`Failed to delete sale: ${error instanceof Error ? error.message : String(error)}`);
  }
}


// --- Debt Actions ---
export async function getDebts(): Promise<Debt[]> {
  try {
    const debts = await db.select().from(debtsTable).orderBy(debtsTable.createdAt);
     return debts.map(d => ({
        ...d,
        createdAt: d.createdAt.toISOString(), // Ensure date is string
        dueDate: d.dueDate ? d.dueDate.toISOString() : null,
        paidAt: d.paidAt ? d.paidAt.toISOString() : null,
    })) as Debt[];
  } catch (error) {
    console.error("Error fetching debts:", error);
    throw new Error(`Failed to fetch debts: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addDebt(debtData: Omit<Debt, 'id' | 'createdAt'>): Promise<Debt | null> {
   const newDebt: Debt = {
        ...debtData,
        id: crypto.randomUUID(),
        status: 'pending',
        amountPaid: 0,
        createdAt: new Date().toISOString(),
    };
  try {
    const inserted = await db.insert(debtsTable).values({
        ...newDebt,
        createdAt: new Date(newDebt.createdAt), // Convert to Date
        dueDate: newDebt.dueDate ? new Date(newDebt.dueDate) : null,
    }).returning();

     if (!inserted || inserted.length === 0) {
        throw new Error("Insert operation returned no result.");
    }

     return {
        ...inserted[0],
        createdAt: inserted[0].createdAt.toISOString(), // Ensure date is string
        dueDate: inserted[0].dueDate ? inserted[0].dueDate.toISOString() : null,
        paidAt: inserted[0].paidAt ? inserted[0].paidAt.toISOString() : null,
    } as Debt;
  } catch (error) {
    console.error("Error adding debt:", error);
    throw new Error(`Failed to add debt: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateDebt(debtId: string, updates: Partial<Omit<Debt, 'id' | 'createdAt'>>): Promise<Debt | null> {
    // Convert date strings back to Date objects for DB update
    const dbUpdates: Record<string, any> = { ...updates };
    if (updates.dueDate) {
        dbUpdates.dueDate = new Date(updates.dueDate);
    }
     if (updates.paidAt) {
        dbUpdates.paidAt = new Date(updates.paidAt);
    }
    // Remove id and createdAt if present in updates object
    delete dbUpdates.id;
    delete dbUpdates.createdAt;

  try {
    const updated = await db.update(debtsTable)
      .set(dbUpdates)
      .where(eq(debtsTable.id, debtId))
      .returning();

     if (!updated || updated.length === 0) {
        throw new Error("Update operation returned no result or debt not found.");
    }

     return {
        ...updated[0],
        createdAt: updated[0].createdAt.toISOString(), // Ensure date is string
        dueDate: updated[0].dueDate ? updated[0].dueDate.toISOString() : null,
        paidAt: updated[0].paidAt ? updated[0].paidAt.toISOString() : null,
    } as Debt;
  } catch (error) {
    console.error("Error updating debt:", error);
     throw new Error(`Failed to update debt: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function deleteDebt(debtId: string): Promise<void> {
  try {
    await db.delete(debtsTable).where(eq(debtsTable.id, debtId));
  } catch (error) {
    console.error("Error deleting debt:", error);
     throw new Error(`Failed to delete debt: ${error instanceof Error ? error.message : String(error)}`);
  }
}
