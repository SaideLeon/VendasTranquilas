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
    debts: Debt[]; // Added debts to export
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

// Type for Debts (Receivables/Payables)
export type DebtType = 'receivable' | 'payable';
export type DebtStatus = 'pending' | 'paid' | 'partially_paid'; // Added partially_paid status

export interface Debt {
    id: string;
    type: DebtType; // 'receivable' or 'payable'
    description: string;
    amount: number;
    amountPaid: number; // Amount already paid/received
    dueDate?: string | null; // Optional ISO string date
    status: DebtStatus; // 'pending', 'paid', 'partially_paid'
    contactName?: string; // Optional contact person/entity
    createdAt: string; // ISO string date
    paidAt?: string | null; // Optional ISO string date when fully paid
    relatedSaleId?: string; // Optional: Link to the sale that generated this debt
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
  totalReceivablesPending: number; // Sum of pending receivable debt amounts
  totalPayablesPending: number; // Sum of pending payable debt amounts
}

// Helper function to calculate unit cost safely
export const calculateUnitCost = (product: Product | undefined): UnitCostResult => {
    if (!product) {
        return { cost: 0, error: "Product not found" };
    }
    // Use initialQuantity if available and positive, otherwise fallback to current quantity if positive
    const effectiveInitialQty = product.initialQuantity !== undefined && product.initialQuantity > 0
                                ? product.initialQuantity
                                : (product.quantity > 0 ? product.quantity : 0);

    if (effectiveInitialQty <= 0) {
        // Avoid division by zero or nonsensical cost for 0 initial quantity
        // If acquisitionValue > 0, it implies an issue. If both are 0, unit cost is 0.
        return { cost: 0, error: product.acquisitionValue > 0 ? "Initial quantity is zero or invalid" : undefined };
    }
    return { cost: product.acquisitionValue / effectiveInitialQty };
};
