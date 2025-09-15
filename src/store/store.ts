import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, Sale, ReportData, Debt } from '@/types';
import { calculateUnitCost } from '@/types';
import { DEFAULT_CURRENCY_CODE } from '@/config/currencies';
import { ProductAPI, SaleAPI, DebtAPI } from '@/lib/endpoints';

interface AppState {
  products: Product[];
  sales: Sale[];
  debts: Debt[];
  lastSync: Date | null;
  isOnline: boolean;
  currency: string;
  isLoading: boolean;
  error: string | null;

  // Core actions
  initializeData: () => Promise<void>;
  setIsOnline: (status: boolean) => void;
  setCurrency: (currencyCode: string) => void;
  setError: (error: string | null) => void;

  // Product actions
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'userId' | 'user'>) => Promise<Product | null>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductById: (productId: string) => Product | undefined;

  // Sale actions
  addSale: (saleData: Omit<Sale, 'id' | 'profit' | 'productName' | 'createdAt' | 'userId' | 'user'>) => Promise<Sale | null>;
  deleteSale: (saleId: string) => Promise<void>;
  getSaleById: (saleId: string) => Sale | undefined;

  // Debt actions
  addDebt: (debtData: Omit<Debt, 'id' | 'createdAt' | 'status' | 'amountPaid' | 'userId' | 'user'>) => Promise<Debt | null>;
  updateDebt: (debtId: string, updates: Partial<Omit<Debt, 'id' | 'createdAt' | 'userId' | 'user'>>) => Promise<Debt | null>;
  deleteDebt: (debtId: string) => Promise<void>;
  getDebtById: (debtId: string) => Debt | undefined;

  // Reporting
  getSalesReportData: () => ReportData;

  // Store hydration/backup helpers
  setProducts: (products: Product[]) => void;
  setSales: (sales: Sale[]) => void;
  setDebts: (debts: Debt[]) => void;
  setLastSync: (date: Date | null) => void;

  // Sync function
  syncData: () => Promise<void>;
}

// Helper function to calculate reports (remains client-side)
const calculateReports = (products: Product[], sales: Sale[], debts: Debt[]): ReportData => {
    const totalInvestment = products.reduce((total, product) => {
        const { cost: unitCost } = calculateUnitCost(product);
        const currentValue = unitCost * product.quantity;
        return total + currentValue;
    }, 0);

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalLossValue = 0;
    const productProfits: { [key: string]: { name: string, profit: number, lossValue: number } } = {};

    products.forEach(p => {
        productProfits[p.id] = { name: p.name, profit: 0, lossValue: 0 };
    });

    sales.forEach(s => {
        const product = products.find(p => p.id === s.productId);
        const { cost: unitCost } = calculateUnitCost(product);

        if (!s.isLoss) {
            totalRevenue += s.saleValue;
        }

        if (s.isLoss) {
            const lossAmount = unitCost * s.quantitySold;
            totalLossValue += lossAmount;
            totalProfit -= lossAmount;
            if (productProfits[s.productId]) {
                productProfits[s.productId].lossValue += lossAmount;
                productProfits[s.productId].profit -= lossAmount;
            }
        } else {
            const costOfGoodsSold = unitCost * s.quantitySold;
            const saleProfit = s.saleValue - costOfGoodsSold;
            totalProfit += saleProfit;
            if (productProfits[s.productId]) {
                productProfits[s.productId].profit += saleProfit;
            }
        }
    });

    let mostProfitableProduct: { name: string; profit: number } | null = null;
    let highestLossProduct: { name: string; lossValue: number } | null = null;

    Object.values(productProfits).forEach(data => {
        if (data.profit > 0 && (!mostProfitableProduct || data.profit > mostProfitableProduct.profit)) {
            mostProfitableProduct = { name: data.name, profit: data.profit };
        }
        if (data.lossValue > 0 && (!highestLossProduct || data.lossValue > highestLossProduct.lossValue)) {
            highestLossProduct = { name: data.name, lossValue: data.lossValue };
        }
    });

    const totalReceivablesPending = debts.reduce((sum, debt) => {
        if (debt.type === 'receivable' && debt.status !== 'paid') {
            return sum + (debt.amount - debt.amountPaid);
        }
        return sum;
    }, 0);

    const totalPayablesPending = debts.reduce((sum, debt) => {
        if (debt.type === 'payable' && debt.status !== 'paid') {
            return sum + (debt.amount - debt.amountPaid);
        }
        return sum;
    }, 0);

    return {
        totalProducts: products.length,
        totalSales: sales.length,
        totalInvestment,
        totalRevenue,
        totalProfit,
        totalLossValue,
        mostProfitableProduct,
        highestLossProduct,
        totalReceivablesPending,
        totalPayablesPending,
    };
};

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            products: [],
            sales: [],
            debts: [],
            lastSync: null,
            isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
            currency: DEFAULT_CURRENCY_CODE,
            isLoading: true, // Start with loading true
            error: null,

            setError: (error) => set({ error }),

            setIsOnline: (status) => {
                set({ isOnline: status });
                if (status) {
                    console.log("Became online. Attempting to sync...");
                    get().syncData().catch(err => console.warn("Background sync failed:", err));
                } else {
                    console.log("Became offline.");
                }
            },

            setCurrency: (currencyCode) => set({ currency: currencyCode }),

            initializeData: async () => {
                console.log("Initializing data from API...");
                set({ isLoading: true, error: null });
                try {
                    const [productsRes, salesRes, debtsRes] = await Promise.all([
                        ProductAPI.list(),
                        SaleAPI.list(),
                        DebtAPI.list()
                    ]);
                    set({
                        products: productsRes.data || [],
                        sales: salesRes.data || [],
                        debts: debtsRes.data || [],
                        isLoading: false,
                        lastSync: new Date(),
                    });
                     console.log("Data initialized successfully.");
                } catch (error: any) {
                    console.error("Failed to initialize data:", error);
                    set({ isLoading: false, error: `Failed to fetch initial data: ${error.message}` });
                }
            },

            addProduct: async (productData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await ProductAPI.create(productData);
                    await get().initializeData(); // Refresh data
                    set({ isLoading: false });
                    return response.data;
                } catch (error: any) {
                    console.error("Failed to add product:", error);
                     set({ isLoading: false, error: `Failed to add product: ${error.message}` });
                    return null;
                }
            },

            updateProduct: async (productId, productData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await ProductAPI.update(productId, productData);
                    await get().initializeData(); // Refresh data
                    set({ isLoading: false });
                    return response.data;
                } catch (error: any) {
                    console.error("Failed to update product:", error);
                     set({ isLoading: false, error: `Failed to update product: ${error.message}` });
                    return null;
                }
            },

            deleteProduct: async (productId) => {
                set({ isLoading: true, error: null });
                try {
                    await ProductAPI.remove(productId);
                    await get().initializeData(); // Refresh data
                    set({ isLoading: false });
                } catch (error: any) {
                    console.error("Failed to delete product:", error);
                     set({ isLoading: false, error: `Failed to delete product: ${error.message}` });
                }
            },

             getProductById: (productId) => get().products.find(p => p.id === productId),
             getSaleById: (saleId) => get().sales.find(s => s.id === saleId),
             getDebtById: (debtId) => get().debts.find(d => d.id === debtId),

            addSale: async (saleData) => {
                const product = get().getProductById(saleData.productId);
                if (!product) {
                    set({ error: "Product not found for sale." });
                    return null;
                }
                if (product.quantity < saleData.quantitySold) {
                    set({ error: "Insufficient stock for sale/loss." });
                    return null;
                }

                set({ isLoading: true, error: null });
                try {
                    const response = await SaleAPI.create(saleData);
                    await get().initializeData(); // Refresh data
                    set({ isLoading: false });
                    return response.data;
                } catch (error: any) {
                    console.error("Failed to add sale:", error);
                     set({ isLoading: false, error: `Failed to add sale: ${error.message}` });
                    return null;
                }
            },

            deleteSale: async (saleId) => {
                set({ isLoading: true, error: null });
                try {
                    await SaleAPI.remove(saleId);
                    await get().initializeData(); // Refresh data
                    set({ isLoading: false });
                } catch (error: any) {
                    console.error("Failed to delete sale:", error);
                    set({ isLoading: false, error: `Failed to delete sale: ${error.message}` });
                }
            },

            addDebt: async (debtData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await DebtAPI.create(debtData);
                    await get().initializeData(); // Refresh data
                    set({ isLoading: false });
                    return response.data;
                } catch (error: any) {
                    console.error("Failed to add debt:", error);
                     set({ isLoading: false, error: `Failed to add debt: ${error.message}` });
                    return null;
                }
            },

            updateDebt: async (debtId, updates) => {
                 const existingDebt = get().getDebtById(debtId);
                 if (!existingDebt) {
                     set({ error: "Debt not found." });
                     return null;
                 }

                set({ isLoading: true, error: null });
                try {
                     const finalUpdates = { ...updates };
                     if (updates.amountPaid !== undefined) {
                         const totalAmount = existingDebt.amount;
                         const newAmountPaid = updates.amountPaid;
                         if (newAmountPaid >= totalAmount) {
                             finalUpdates.status = 'PAID';
                             finalUpdates.paidAt = updates.paidAt ?? new Date().toISOString();
                         } else if (newAmountPaid > 0) {
                             finalUpdates.status = 'PARTIALLY_PAID';
                             finalUpdates.paidAt = null;
                         } else {
                             finalUpdates.status = 'PENDING';
                             finalUpdates.paidAt = null;
                         }
                     }

                    const response = await DebtAPI.update(debtId, finalUpdates);
                    await get().initializeData(); // Refresh data
                    set({ isLoading: false });
                    return response.data;
                } catch (error: any) {
                    console.error("Failed to update debt:", error);
                     set({ isLoading: false, error: `Failed to update debt: ${error.message}` });
                     return null;
                }
            },

            deleteDebt: async (debtId) => {
                set({ isLoading: true, error: null });
                try {
                    await DebtAPI.remove(debtId);
                    await get().initializeData(); // Refresh data
                    set({ isLoading: false });
                } catch (error: any) {
                    console.error("Failed to delete debt:", error);
                     set({ isLoading: false, error: `Failed to delete debt: ${error.message}` });
                }
            },

            getSalesReportData: () => {
                const { products, sales, debts } = get();
                return calculateReports(products, sales, debts);
            },

            setProducts: (products) => set({ products }),
            setSales: (sales) => set({ sales }),
            setDebts: (debts) => set({ debts }),
            setLastSync: (date) => set({ lastSync: date }),

            syncData: async () => {
                if (!get().isOnline) {
                    console.log("Sync skipped: Offline.");
                    return;
                }
                console.log("Checking for new data from server...");
                await get().initializeData();
            },
        }),
        {
            name: 'sigef-storage', // Renamed storage key
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                currency: state.currency,
            }),
             onRehydrateStorage: () => {
                 return (rehydratedState, error) => {
                     if (error) {
                         console.error("Failed to rehydrate state from storage:", error);
                     }
                     // The initializeData will be called from a component that uses authentication
                     // to ensure token is available.
                 }
             },
        }
    )
);

if (typeof window !== 'undefined') {
    const updateOnlineStatus = () => {
        useStore.getState().setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}
