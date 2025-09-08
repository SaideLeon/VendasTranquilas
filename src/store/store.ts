import { create } from 'zustand';

interface CheckDbConnectionResponse {
    isConnected: boolean;
}
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, Sale, ReportData, Debt } from '@/types';
import { calculateUnitCost } from '@/types'; // Assuming this helper stays in types
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_CURRENCY_CODE } from '@/config/currencies';
import {
  getProducts as dbGetProducts,
  addProduct as dbAddProduct,
  updateProduct as dbUpdateProduct,
  deleteProduct as dbDeleteProduct,
  getSales as dbGetSales,
  addSale as dbAddSale,
  deleteSale as dbDeleteSale,
  getDebts as dbGetDebts,
  addDebt as dbAddDebt,
  updateDebt as dbUpdateDebt,
  deleteDebt as dbDeleteDebt,
} from '@/app/actions'; // Import DB actions

interface AppState {
  products: Product[];
  sales: Sale[];
  debts: Debt[]; // Added debts state
  lastSync: Date | null;
  isOnline: boolean;
  currency: string; // ISO 4217 currency code
  isDatabaseConnected: boolean; // Database connection status
  isLoading: boolean; // Loading state for async operations
  error: string | null; // To store potential errors

  // Core actions
  initializeData: () => Promise<void>; // Fetch initial data from DB
  setIsDatabaseConnected: (status: boolean) => void;
  setIsOnline: (status: boolean) => void;
  setCurrency: (currencyCode: string) => void;
  setError: (error: string | null) => void;

  // Product actions
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'userId' | 'user'>) => Promise<Product | null>;
  updateProduct: (product: Product) => Promise<Product | null>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductById: (productId: string) => Product | undefined; // Make sync

  // Sale actions
  addSale: (saleData: Omit<Sale, 'id' | 'profit' | 'productName' | 'createdAt' | 'userId' | 'user'>) => Promise<Sale | null>;
  deleteSale: (saleId: string) => Promise<void>;
  getSaleById: (saleId: string) => Sale | undefined; // Make sync

  // Debt actions
  addDebt: (debtData: Omit<Debt, 'id' | 'createdAt' | 'status' | 'amountPaid' | 'userId' | 'user'>) => Promise<Debt | null>;
  updateDebt: (debtId: string, updates: Partial<Omit<Debt, 'id' | 'createdAt' | 'userId' | 'user'>>) => Promise<Debt | null>;
  deleteDebt: (debtId: string) => Promise<void>;
  getDebtById: (debtId: string) => Debt | undefined; // Make sync

  // Reporting
  getSalesReportData: () => ReportData;

  // Store hydration/backup helpers (might not be needed with DB)
  setProducts: (products: Product[]) => void;
  setSales: (sales: Sale[]) => void;
  setDebts: (debts: Debt[]) => void;
  setLastSync: (date: Date | null) => void;

  // Sync function (placeholder or could trigger background tasks)
  syncData: () => Promise<void>;

  // DB Connection Check
  checkDatabaseConnection: () => Promise<void>; // Keep this separate
}


// Helper function to calculate reports
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
            isDatabaseConnected: false,
            isLoading: false,
            error: null,

            setError: (error) => set({ error }),

            setIsDatabaseConnected: (status) => set({ isDatabaseConnected: status }),

            setIsOnline: (status) => {
                set({ isOnline: status });
                if (status && get().isDatabaseConnected) {
                    console.log("Became online. Attempting to sync...");
                    get().syncData().catch(err => console.warn("Background sync failed:", err));
                } else if (!status) {
                    console.log("Became offline.");
                }
            },

            setCurrency: (currencyCode) => set({ currency: currencyCode }),

            initializeData: async () => {
                console.log("Initializing data from database...");
                set({ isLoading: true, error: null });
                try {
                    await get().checkDatabaseConnection(); // Check connection first
                    if (!get().isDatabaseConnected) {
                        throw new Error("Database not connected. Cannot initialize.");
                    }
                    const { products, sales, debts } = await getInitialData();
                    set({
                        products: products || [],
                        sales: sales || [],
                        debts: debts || [],
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
                 if (!get().isDatabaseConnected) {
                    set({ error: "Database not connected. Cannot add product." });
                    return null;
                 }
                set({ isLoading: true, error: null });
                try {
                    // Pass data to server action, which handles ID generation etc.
                    const savedProduct = await dbAddProduct(productData);

                    if (!savedProduct) throw new Error("Failed to save product to database.");

                    // Replace temp data with saved data from DB (especially if ID changed)
                    // Or just refetch all products for simplicity? Let's refetch for now.
                     await get().initializeData(); // Refetch to ensure consistency
                     set({ isLoading: false });
                    return savedProduct; // Return the product saved in DB
                } catch (error: any) {
                    console.error("Failed to add product:", error);
                    // Revert optimistic update if it failed (if implemented)
                     set({ isLoading: false, error: `Failed to add product: ${error.message}` });
                    return null;
                }
            },

            updateProduct: async (product) => {
                 if (!get().isDatabaseConnected) {
                     set({ error: "Database not connected. Cannot update product." });
                     return null;
                 }
                set({ isLoading: true, error: null });
                const originalProducts = get().products; // Backup for potential revert
                try {
                    // Optimistic UI update (optional)
                    // set((state) => ({
                    //   products: state.products.map((p) => (p.id === product.id ? product : p)),
                    // }));

                    const updatedProduct = await dbUpdateProduct(product);
                    if (!updatedProduct) throw new Error("Failed to update product in database.");

                    // Refetch for consistency
                    await get().initializeData();
                     set({ isLoading: false });
                    return updatedProduct;
                } catch (error: any) {
                    console.error("Failed to update product:", error);
                    // Revert optimistic update (if implemented)
                    // set({ products: originalProducts });
                     set({ isLoading: false, error: `Failed to update product: ${error.message}` });
                    return null;
                }
            },

            deleteProduct: async (productId) => {
                 if (!get().isDatabaseConnected) {
                     set({ error: "Database not connected. Cannot delete product." });
                     return;
                 }
                set({ isLoading: true, error: null });
                const originalProducts = get().products;
                const originalSales = get().sales;
                 const originalDebts = get().debts; // Also handle debts
                try {
                    // Optimistic UI update (optional)
                    // set((state) => ({
                    //     products: state.products.filter((p) => p.id !== productId),
                    //     sales: state.sales.filter((s) => s.productId !== productId), // Also remove related sales
                    //     debts: state.debts.filter(d => !d.relatedSaleId || !state.sales.find(s => s.id === d.relatedSaleId && s.productId === productId)), // Complex logic for related debts might be needed
                    // }));

                    await dbDeleteProduct(productId); // Assume this also handles related sales/debts in DB via cascade or triggers

                    // Refetch for consistency
                    await get().initializeData();
                    set({ isLoading: false });
                } catch (error: any) {
                    console.error("Failed to delete product:", error);
                    // Revert optimistic update (if implemented)
                    // set({ products: originalProducts, sales: originalSales, debts: originalDebts });
                     set({ isLoading: false, error: `Failed to delete product: ${error.message}` });
                }
            },

             // Use local state for immediate access, DB is source of truth
             getProductById: (productId) => get().products.find(p => p.id === productId),
             getSaleById: (saleId) => get().sales.find(s => s.id === saleId),
             getDebtById: (debtId) => get().debts.find(d => d.id === debtId),


            addSale: async (saleData) => {
                 if (!get().isDatabaseConnected) {
                     set({ error: "Database not connected. Cannot add sale." });
                     return null;
                 }
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
                    // Pass raw sale data to server action
                    const savedSale = await dbAddSale(saleData); // Server action calculates profit, gets product name, updates stock

                    if (!savedSale) throw new Error("Failed to save sale to database.");

                    // Refetch for consistency
                    await get().initializeData();
                     set({ isLoading: false });
                    return savedSale;
                } catch (error: any) {
                    console.error("Failed to add sale:", error);
                     set({ isLoading: false, error: `Failed to add sale: ${error.message}` });
                    return null;
                }
            },

            deleteSale: async (saleId) => {
                 if (!get().isDatabaseConnected) {
                     set({ error: "Database not connected. Cannot delete sale." });
                     return;
                 }
                set({ isLoading: true, error: null });
                 const saleToDelete = get().getSaleById(saleId);
                 if (!saleToDelete) {
                     set({ isLoading: false, error: "Sale not found." });
                     return;
                 }
                try {
                    // DB action should handle restoring product quantity
                    await dbDeleteSale(saleId);

                    // Refetch for consistency
                    await get().initializeData();
                    set({ isLoading: false });
                } catch (error: any) {
                    console.error("Failed to delete sale:", error);
                    set({ isLoading: false, error: `Failed to delete sale: ${error.message}` });
                }
            },

            // Debt Management with DB
            addDebt: async (debtData) => {
                 if (!get().isDatabaseConnected) {
                     set({ error: "Database not connected. Cannot add debt." });
                     return null;
                 }
                set({ isLoading: true, error: null });
                try {
                     // Pass raw data to server action
                    const savedDebt = await dbAddDebt(debtData);
                    if (!savedDebt) throw new Error("Failed to save debt to database.");

                    await get().initializeData(); // Refetch
                    set({ isLoading: false });
                    return savedDebt;
                } catch (error: any) {
                    console.error("Failed to add debt:", error);
                     set({ isLoading: false, error: `Failed to add debt: ${error.message}` });
                    return null;
                }
            },

            updateDebt: async (debtId, updates) => {
                 if (!get().isDatabaseConnected) {
                    set({ error: "Database not connected. Cannot update debt." });
                     return null;
                 }
                 const existingDebt = get().getDebtById(debtId);
                 if (!existingDebt) {
                     set({ error: "Debt not found." });
                     return null;
                 }

                set({ isLoading: true, error: null });
                try {
                     // Prepare update data, recalculating status if amountPaid changes
                     const finalUpdates = { ...updates };
                     if (updates.amountPaid !== undefined) {
                         const totalAmount = existingDebt.amount;
                         const newAmountPaid = updates.amountPaid;
                         if (newAmountPaid >= totalAmount) {
                             finalUpdates.status = 'PAID';
                             // Use existing paidAt if provided, otherwise set new one
                             finalUpdates.paidAt = updates.paidAt ?? new Date().toISOString();
                         } else if (newAmountPaid > 0) {
                             finalUpdates.status = 'PARTIALLY_PAID';
                             finalUpdates.paidAt = null; // Clear paidAt if only partially paid
                         } else {
                             finalUpdates.status = 'PENDING';
                             finalUpdates.paidAt = null; // Clear paidAt if back to pending
                         }
                     }


                    const updatedDebt = await dbUpdateDebt(debtId, finalUpdates);
                    if (!updatedDebt) throw new Error("Failed to update debt in database.");

                    await get().initializeData(); // Refetch
                    set({ isLoading: false });
                    return updatedDebt;
                } catch (error: any) {
                    console.error("Failed to update debt:", error);
                     set({ isLoading: false, error: `Failed to update debt: ${error.message}` });
                     return null;
                }
            },

            deleteDebt: async (debtId) => {
                 if (!get().isDatabaseConnected) {
                     set({ error: "Database not connected. Cannot delete debt." });
                     return;
                 }
                set({ isLoading: true, error: null });
                try {
                    await dbDeleteDebt(debtId);
                    await get().initializeData(); // Refetch
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

            // Setters for data loading (backup/import) - less critical with DB?
            setProducts: (products) => set({ products }),
            setSales: (sales) => set({ sales }),
            setDebts: (debts) => set({ debts }),
            setLastSync: (date) => set({ lastSync: date }),

            // SyncData: Placeholder or could trigger background jobs
            syncData: async () => {
                if (!get().isOnline || !get().isDatabaseConnected) {
                    console.log("Sync skipped: Offline or DB not connected.");
                    return;
                }
                console.log("Simulating background data sync/check...");
                // In a real app, this might check for pending operations or refresh data
                set({ lastSync: new Date() });
            },

             checkDatabaseConnection: async () => {
                 try {
                     const response = await fetch('/check-db', {
                         method: 'POST',
                         headers: {
                             'Content-Type': 'application/json',
                         },
                         body: JSON.stringify({}), // Send an empty body or relevant data if needed
                     });

                     const data: CheckDbConnectionResponse = await response.json();
                     const isConnected = data.isConnected;

                     set({ isDatabaseConnected: isConnected });
                      if (!isConnected) {
                          set({ error: "Database connection failed." });
                      } else {
                           // If connection is successful, clear previous connection error
                           if (get().error === "Database connection failed.") {
                               set({ error: null });
                           }
                      }
                 } catch (error: any) {
                     console.error("Database connection check failed:", error);
                     set({ isDatabaseConnected: false, error: `Database connection check failed: ${error.message}` });
                 }
             },

        }),
        {
            name: 'vendas-tranquilas-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // Keep localStorage as a fallback/cache
            // Persist only essential settings or minimal cache if DB is primary
            partialize: (state) => ({
                // products: state.products, // Maybe cache?
                // sales: state.sales,       // Maybe cache?
                // debts: state.debts,       // Maybe cache?
                lastSync: state.lastSync,
                currency: state.currency,
                // Don't persist isOnline, isDatabaseConnected, isLoading, error
            }),
             onRehydrateStorage: (state) => {
                console.log("Attempting to rehydrate state...");
                 return (rehydratedState, error) => {
                     if (error) {
                         console.error("Failed to rehydrate state from storage:", error);
                     } else if (rehydratedState) {
                        console.log("Rehydration successful (from localStorage).");
                         // Ensure default currency if missing
                         if (!rehydratedState.currency) {
                             rehydratedState.currency = DEFAULT_CURRENCY_CODE;
                         }
                         // Set initial online status based on browser
                         rehydratedState.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
                         // Trigger initial data load and connection check after rehydration
                         // Use setTimeout to avoid issues during initialization phase
                         setTimeout(() => {
                            console.log("Checking DB connection and initializing data post-rehydration...");
                            useStore.getState().checkDatabaseConnection().then(() => {
                                if(useStore.getState().isDatabaseConnected) {
                                    useStore.getState().initializeData();
                                } else {
                                    console.warn("Database not connected after rehydration, skipping initial data load from DB.");
                                     // Maybe load cached data from localStorage here if desired
                                     // set({ products: rehydratedState.products || [], sales: rehydratedState.sales || [], debts: rehydratedState.debts || [] });
                                }
                            });
                         }, 0);
                     } else {
                         console.log("No state found in storage for rehydration.");
                         // If no state, set defaults and trigger initial load
                          setTimeout(() => {
                              console.log("No stored state, checking DB connection and initializing data...");
                              useStore.getState().checkDatabaseConnection().then(() => {
                                  if (useStore.getState().isDatabaseConnected) {
                                      useStore.getState().initializeData();
                                  } else {
                                       console.warn("Database not connected, cannot initialize data.");
                                  }
                              });
                          }, 0);

                     }
                 }
             },
        } // End of persist options
    ) // End of persist call
); // End of create call


// Add event listeners for online/offline status
if (typeof window !== 'undefined') {
    const updateOnlineStatus = () => {
        useStore.getState().setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

     // Initial check
     // updateOnlineStatus(); // Initial check might happen too early, rely on rehydration logic
}

// Export UUID generator if needed elsewhere
export { uuidv4 };

dEventListener('offline', updateOnlineStatus);

     // Initial check
     // updateOnlineStatus(); // Initial check might happen too early, rely on rehydration logic
}

// Export UUID generator if needed elsewhere
export { uuidv4 };

