export interface Product {
  id: string;
  name: string;
  acquisitionValue: number;
  quantity: number;
  createdAt: string; // ISO string date
}

export interface Sale {
  id: string;
  productId: string;
  productName: string; // Denormalized for easier display
  quantitySold: number;
  saleValue: number; // Total value for this sale (quantity * unit price)
  isLoss: boolean;
  lossReason?: string;
  profit: number; // Calculated: saleValue - (product.acquisitionValue * quantitySold)
  createdAt: string; // ISO string date
}

export interface ReportData {
  totalProducts: number;
  totalSales: number;
  totalInvestment: number;
  totalRevenue: number;
  totalProfit: number;
  totalLossValue: number; // Sum of (acquisitionValue * quantitySold) for sales marked as loss
  mostProfitableProduct: { name: string; profit: number } | null;
  highestLossProduct: { name: string; lossValue: number } | null;
}
