'use server';

import { prisma } from '@/lib/prisma'; // Import Prisma client
import type { Product, Sale, Debt, DebtStatus } from '@/types';
import { calculateUnitCost } from '@/types'; // Assuming this helper stays in types
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// --- Helper to get User ID ---
async function getUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Unauthorized: User not logged in.');
  }
  return userId;
}

// --- Database Connection Check (using Prisma) ---
export async function checkDbConnection(): Promise<boolean> {
  try {
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
  const userId = await getUserId();
  try {
    const products = await prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return products.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      acquisitionValue: p.acquisitionValue,
      initialQuantity: p.initialQuantity ?? undefined,
    })) as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'userId'>): Promise<Product | null> {
  const userId = await getUserId();
  const newProductData = {
    ...productData,
    userId,
    initialQuantity: productData.initialQuantity ?? productData.quantity,
  };
  try {
    const inserted = await prisma.product.create({
      data: newProductData,
    });
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
  const userId = await getUserId();
  try {
    const updated = await prisma.product.update({
      where: { id: product.id, userId },
      data: {
        name: product.name,
        acquisitionValue: product.acquisitionValue,
        quantity: product.quantity,
        initialQuantity: product.initialQuantity,
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
  const userId = await getUserId();
  try {
    await prisma.product.delete({
      where: { id: productId, userId },
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : String(error)}`);
  }
}


// --- Sale Actions ---
export async function getSales(): Promise<Sale[]> {
  const userId = await getUserId();
  try {
    const sales = await prisma.sale.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return sales.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      saleValue: s.saleValue,
      profit: s.profit,
      lossReason: s.lossReason ?? undefined,
    })) as Sale[];
  } catch (error) {
    console.error("Error fetching sales:", error);
     throw new Error(`Failed to fetch sales: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addSale(saleData: Omit<Sale, 'id' | 'createdAt' | 'productName' | 'profit' | 'userId'>): Promise<Sale | null> {
    const userId = await getUserId();
    const product = await prisma.product.findUnique({
        where: { id: saleData.productId, userId },
    });

    if (!product) {
        throw new Error("Product not found for sale.");
    }
    if (product.quantity < saleData.quantitySold) {
        throw new Error("Insufficient stock for sale/loss.");
    }

    const { cost: unitCost } = calculateUnitCost(product as Product);
    const profit = saleData.isLoss
        ? -(unitCost * saleData.quantitySold)
        : saleData.saleValue - (unitCost * saleData.quantitySold);

    const newSaleData = {
        ...saleData,
        userId,
        productName: product.name,
        profit: profit,
    };

    try {
        const result = await prisma.$transaction(async (tx) => {
             const createdSale = await tx.sale.create({
                data: newSaleData,
            });
            await tx.product.update({
                where: { id: saleData.productId, userId },
                data: { quantity: { decrement: saleData.quantitySold } },
            });
            return createdSale;
        });

        return {
            ...result,
             createdAt: result.createdAt.toISOString(),
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
  const userId = await getUserId();
  const saleToDelete = await prisma.sale.findUnique({
    where: { id: saleId, userId },
    include: { product: true },
  });

  if (!saleToDelete) {
    throw new Error("Sale not found.");
  }

  if (!saleToDelete.product) {
     console.warn(`Product with ID ${saleToDelete.productId} not found for sale ${saleId}. Attempting to delete sale only.`);
      try {
         await prisma.sale.delete({ where: { id: saleId, userId } });
     } catch (error) {
         console.error("Error deleting sale (product was missing):", error);
         throw new Error(`Failed to delete sale: ${error instanceof Error ? error.message : String(error)}`);
     }
     return;
  }

  try {
     await prisma.$transaction(async (tx) => {
            await tx.sale.delete({ where: { id: saleId, userId } });
             await tx.product.update({
                 where: { id: saleToDelete.productId, userId },
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
  const userId = await getUserId();
  try {
    const debts = await prisma.debt.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
     return debts.map(d => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        dueDate: d.dueDate ? d.dueDate.toISOString() : null,
        paidAt: d.paidAt ? d.paidAt.toISOString() : null,
        amount: d.amount,
        amountPaid: d.amountPaid,
        status: d.status as DebtStatus,
        type: d.type as 'receivable' | 'payable',
        contactName: d.contactName ?? undefined,
        relatedSaleId: d.relatedSaleId ?? undefined,
    })) as Debt[];
  } catch (error) {
    console.error("Error fetching debts:", error);
    throw new Error(`Failed to fetch debts: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addDebt(debtData: Omit<Debt, 'id' | 'createdAt' | 'status' | 'amountPaid' | 'userId'>): Promise<Debt | null> {
   const userId = await getUserId();
   const newDebtData = {
        ...debtData,
        userId,
        status: 'PENDING' as DebtStatus,
        amountPaid: 0,
        dueDate: debtData.dueDate ? new Date(debtData.dueDate) : null,
        relatedSaleId: debtData.relatedSaleId || null,
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

export async function updateDebt(debtId: string, updates: Partial<Omit<Debt, 'id' | 'createdAt' | 'userId'>>): Promise<Debt | null> {
    const userId = await getUserId();
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

    delete prismaUpdates.id;
    delete prismaUpdates.createdAt;
    if (updates.status) {
        prismaUpdates.status = updates.status as DebtStatus;
    }
     if (updates.type) {
        prismaUpdates.type = updates.type as 'receivable' | 'payable';
    }

  try {
    const updated = await prisma.debt.update({
      where: { id: debtId, userId },
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
  const userId = await getUserId();
  try {
    await prisma.debt.delete({
      where: { id: debtId, userId },
    });
  } catch (error) {
    console.error("Error deleting debt:", error);
     throw new Error(`Failed to delete debt: ${error instanceof Error ? error.message : String(error)}`);
  }
}