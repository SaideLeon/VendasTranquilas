'use server';

import { prisma } from '@/lib/prisma'; // Import Prisma client
import type { Product, Sale, Debt, DebtStatus } from '@/types';
import { calculateUnitCost } from '@/types'; // Assuming this helper stays in types
import { sql } from '@vercel/postgres'; // Keep for connection check if needed, though Prisma has its own check

// --- Database Connection Check (using Prisma) ---
export async function checkDbConnection(): Promise<boolean> {
  try {
    // Prisma's way to check connection: try a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection successful (via Prisma).");
    return true;
  } catch (error) {
    console.error("Database connection failed (via Prisma):", error);
    return false;
  }
}


// --- Product Actions ---
export async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
    });
    // Map Prisma result to your Product type (handle Date to string conversion)
    return products.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      acquisitionValue: p.acquisitionValue, // Ensure type compatibility if needed
      initialQuantity: p.initialQuantity ?? undefined, // Handle null from DB
    })) as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product | null> {
  const newProductData = {
    ...productData,
    // Prisma typically handles ID generation if using autoincrement or cuid/uuid defaults
    // If you need manual UUID: id: crypto.randomUUID(), ensure schema supports it
    // createdAt is handled by Prisma's default
    initialQuantity: productData.initialQuantity ?? productData.quantity,
  };
  try {
    const inserted = await prisma.product.create({
      data: newProductData,
    });

    // Map result back to Product type
    return {
      ...inserted,
      createdAt: inserted.createdAt.toISOString(),
      acquisitionValue: inserted.acquisitionValue,
      initialQuantity: inserted.initialQuantity ?? undefined,
    } as Product;
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error(`Failed to add product: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateProduct(product: Product): Promise<Product | null> {
  try {
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        acquisitionValue: product.acquisitionValue,
        quantity: product.quantity,
        initialQuantity: product.initialQuantity,
        // Do not update createdAt
      },
    });

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      acquisitionValue: updated.acquisitionValue,
      initialQuantity: updated.initialQuantity ?? undefined,
    } as Product;
  } catch (error) {
    console.error("Error updating product:", error);
     throw new Error(`Failed to update product: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    // Prisma handles cascading deletes based on your schema definition
    // Use a transaction if you need to delete related sales/debts manually before deleting the product
    await prisma.product.delete({
      where: { id: productId },
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : String(error)}`);
  }
}


// --- Sale Actions ---
export async function getSales(): Promise<Sale[]> {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return sales.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      saleValue: s.saleValue, // Ensure type compatibility
      profit: s.profit,
      lossReason: s.lossReason ?? undefined,
    })) as Sale[];
  } catch (error) {
    console.error("Error fetching sales:", error);
     throw new Error(`Failed to fetch sales: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addSale(saleData: Omit<Sale, 'id' | 'createdAt' | 'productName' | 'profit'>): Promise<Sale | null> {
    const product = await prisma.product.findUnique({
        where: { id: saleData.productId },
    });

    if (!product) {
        throw new Error("Product not found for sale.");
    }
    if (product.quantity < saleData.quantitySold) {
        throw new Error("Insufficient stock for sale/loss.");
    }

    const { cost: unitCost } = calculateUnitCost(product as Product); // Cast to Product type
    const profit = saleData.isLoss
        ? -(unitCost * saleData.quantitySold)
        : saleData.saleValue - (unitCost * saleData.quantitySold);

    const newSaleData = {
        ...saleData,
        productName: product.name, // Get product name
        profit: profit,
        // id and createdAt handled by Prisma/DB
    };

    try {
        // Use Prisma transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the sale
             const createdSale = await tx.sale.create({
                data: newSaleData,
            });

            // 2. Update product quantity
            const updatedProduct = await tx.product.update({
                where: { id: saleData.productId },
                data: { quantity: { decrement: saleData.quantitySold } },
            });

             if (!updatedProduct) {
                throw new Error("Failed to update product quantity."); // Should not happen if product exists
             }

            return createdSale;
        });


        return {
            ...result,
             createdAt: result.createdAt.toISOString(), // Ensure date is string
             saleValue: result.saleValue,
             profit: result.profit,
             lossReason: result.lossReason ?? undefined,
        } as Sale;

    } catch (error) {
        console.error("Error adding sale and updating product quantity:", error);
        throw new Error(`Failed to add sale: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function deleteSale(saleId: string): Promise<void> {
  const saleToDelete = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { product: true }, // Include product to get quantitySold and productId
  });

  if (!saleToDelete) {
    throw new Error("Sale not found.");
  }

  if (!saleToDelete.product) {
     // This indicates data inconsistency, but proceed with sale deletion attempt
     console.warn(`Product with ID ${saleToDelete.productId} not found for sale ${saleId}. Attempting to delete sale only.`);
      try {
         await prisma.sale.delete({ where: { id: saleId } });
     } catch (error) {
         console.error("Error deleting sale (product was missing):", error);
         throw new Error(`Failed to delete sale: ${error instanceof Error ? error.message : String(error)}`);
     }
     return;
  }

  try {
     // Use Prisma transaction
     await prisma.$transaction(async (tx) => {
            // 1. Delete the sale
            await tx.sale.delete({ where: { id: saleId } });

            // 2. Restore product quantity
             await tx.product.update({
                 where: { id: saleToDelete.productId },
                 data: { quantity: { increment: saleToDelete.quantitySold } },
             });
     });
  } catch (error) {
    console.error("Error deleting sale and restoring product quantity:", error);
     throw new Error(`Failed to delete sale: ${error instanceof Error ? error.message : String(error)}`);
  }
}


// --- Debt Actions ---
export async function getDebts(): Promise<Debt[]> {
  try {
    const debts = await prisma.debt.findMany({
      orderBy: { createdAt: 'asc' },
    });
     return debts.map(d => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        dueDate: d.dueDate ? d.dueDate.toISOString() : null,
        paidAt: d.paidAt ? d.paidAt.toISOString() : null,
        amount: d.amount, // Ensure type compatibility
        amountPaid: d.amountPaid,
        status: d.status as DebtStatus, // Cast status to DebtStatus enum/type
        type: d.type as 'receivable' | 'payable',
        contactName: d.contactName ?? undefined,
        relatedSaleId: d.relatedSaleId ?? undefined,
    })) as Debt[];
  } catch (error) {
    console.error("Error fetching debts:", error);
    throw new Error(`Failed to fetch debts: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addDebt(debtData: Omit<Debt, 'id' | 'createdAt' | 'status' | 'amountPaid'>): Promise<Debt | null> {
   const newDebtData = {
        ...debtData,
        status: 'pending' as DebtStatus, // Default status
        amountPaid: 0, // Default amount paid
        // id and createdAt handled by Prisma/DB
        dueDate: debtData.dueDate ? new Date(debtData.dueDate) : null, // Convert string to Date for Prisma
        relatedSaleId: debtData.relatedSaleId || null, // Ensure null if undefined/empty
    };
  try {
    const inserted = await prisma.debt.create({
      data: newDebtData,
    });

    return {
        ...inserted,
        createdAt: inserted.createdAt.toISOString(),
        dueDate: inserted.dueDate ? inserted.dueDate.toISOString() : null,
        paidAt: inserted.paidAt ? inserted.paidAt.toISOString() : null,
        amount: inserted.amount,
        amountPaid: inserted.amountPaid,
        status: inserted.status as DebtStatus,
        type: inserted.type as 'receivable' | 'payable',
        contactName: inserted.contactName ?? undefined,
        relatedSaleId: inserted.relatedSaleId ?? undefined,
    } as Debt;
  } catch (error) {
    console.error("Error adding debt:", error);
    throw new Error(`Failed to add debt: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateDebt(debtId: string, updates: Partial<Omit<Debt, 'id' | 'createdAt'>>): Promise<Debt | null> {
    // Convert date strings back to Date objects for Prisma update
    const prismaUpdates: Record<string, any> = { ...updates };

    if (updates.dueDate) {
        prismaUpdates.dueDate = new Date(updates.dueDate);
    } else if (updates.dueDate === null) {
        prismaUpdates.dueDate = null;
    }

    if (updates.paidAt) {
        prismaUpdates.paidAt = new Date(updates.paidAt);
     } else if (updates.paidAt === null) {
         prismaUpdates.paidAt = null;
     }

    // Remove fields not directly updatable or handled by Prisma
    delete prismaUpdates.id;
    delete prismaUpdates.createdAt;
    // If status is being updated, ensure it's the correct enum type
    if (updates.status) {
        prismaUpdates.status = updates.status as DebtStatus;
    }
     if (updates.type) {
        prismaUpdates.type = updates.type as 'receivable' | 'payable';
    }


  try {
    const updated = await prisma.debt.update({
      where: { id: debtId },
      data: prismaUpdates,
    });

    return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
        paidAt: updated.paidAt ? updated.paidAt.toISOString() : null,
        amount: updated.amount,
        amountPaid: updated.amountPaid,
        status: updated.status as DebtStatus,
        type: updated.type as 'receivable' | 'payable',
        contactName: updated.contactName ?? undefined,
        relatedSaleId: updated.relatedSaleId ?? undefined,
    } as Debt;
  } catch (error) {
    console.error("Error updating debt:", error);
     throw new Error(`Failed to update debt: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function deleteDebt(debtId: string): Promise<void> {
  try {
    await prisma.debt.delete({
      where: { id: debtId },
    });
  } catch (error) {
    console.error("Error deleting debt:", error);
     throw new Error(`Failed to delete debt: ${error instanceof Error ? error.message : String(error)}`);
  }
}
