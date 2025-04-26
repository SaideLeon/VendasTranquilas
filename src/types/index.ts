export interface Product {
  id: string;
  name: string;
    acquisitionValue: number; // Total acquisition value for the initial quantity
    quantity: number; // Current quantity in stock
    initialQuantity?: number; // Original quantity when the product was first added or last major stock update
    // DEPRECATED: quantityInStock is replaced by quantity
    // quantityInStock: number;
  createdAt: string; // ISO string date
}

export interface ExportData {
    products: Product[];
    sales: Sale[];
    exportedAt: string;
    version: number; // Simple versioning
}

export interface Sale {
  id: string;
  productId: string;
  productName: string; // Denormalized for easier display
  quantitySold: number;
  saleValue: number; // Total value for this sale (quantity * unit price)
  isLoss: boolean;
  lossReason?: string;
  profit: number; // Calculated: saleValue - (unitCost * quantitySold)
  createdAt: string; // ISO string date
}

// Type for calculated unit cost, handling potential division by zero.
export type UnitCostResult = { cost: number; error?: string };


export interface ReportData {
  totalProducts: number;
  totalSales: number;
  totalInvestment: number; // Current value of stock based on initial unit cost
  totalRevenue: number;
  totalProfit: number;
  totalLossValue: number; // Sum of (unitCost * quantitySold) for sales marked as loss
  mostProfitableProduct: { name: string; profit: number } | null;
  highestLossProduct: { name: string; lossValue: number } | null;
}

// Helper function to calculate unit cost safely
export const calculateUnitCost = (product: Product | undefined): UnitCostResult => {
    if (!product) {
        return { cost: 0, error: "Product not found" };
    }
    const initialQty = product.initialQuantity ?? product.quantity; // Use initial if available, fallback to current
    if (initialQty <= 0) {
        // Avoid division by zero or nonsensical cost for 0 initial quantity
        // If acquisitionValue > 0, it implies an issue. If both are 0, unit cost is 0.
        return { cost: 0, error: product.acquisitionValue > 0 ? "Initial quantity is zero or invalid" : undefined };
    }
    return { cost: product.acquisitionValue / initialQty };
};
