import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, Sale, ReportData, Debt, DebtType, DebtStatus } from '@/types'; // Import Debt types
import { calculateUnitCost } from '@/types'; // Import the helper
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_CURRENCY_CODE } from '@/config/currencies';

interface AppState {
  products: Product[];
  sales: Sale[];
  debts: Debt[]; // Added debts state
  lastSync: Date | null;
  isOnline: boolean;
  currency: string; // ISO 4217 currency code (e.g., 'BRL', 'USD')
  setIsOnline: (status: boolean) => void;
  setCurrency: (currencyCode: string) => void;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => Product; // Adjusted onSubmit in form handles initialQuantity
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  getProductById: (productId: string) => Product | undefined;
  addSale: (saleData: Omit<Sale, 'id' | 'profit' | 'productName' | 'createdAt'>) => Sale | null;
  deleteSale: (saleId: string) => void;
  addDebt: (debtData: Omit<Debt, 'id' | 'createdAt' | 'status' | 'amountPaid'>) => Debt; // Add new debt
  updateDebt: (debtId: string, updates: Partial<Omit<Debt, 'id' | 'createdAt'>>) => void; // Update debt (status, amountPaid, etc.)
  deleteDebt: (debtId: string) => void; // Delete debt
  getDebtById: (debtId: string) => Debt | undefined;
  getSalesReportData: () => ReportData; // Report data structure might not need currency itself, but relies on values assumed to be in the selected currency
  setProducts: (products: Product[]) => void;
  setSales: (sales: Sale[]) => void;
  setDebts: (debts: Debt[]) => void; // Setter for import/export
  setLastSync: (date: Date | null) => void;
  // Simulate sync function
  syncData: () => Promise<void>;
}

// Helper function to calculate reports
// Values are assumed to be in the globally selected currency.
const calculateReports = (products: Product[], sales: Sale[], debts: Debt[]): ReportData => { // Add debts parameter
    // Calculate total investment based on current stock and unit cost
    const totalInvestment = products.reduce((total, product) => {
        const { cost: unitCost } = calculateUnitCost(product);
        // Use current quantity for stock value calculation
        const currentValue = unitCost * product.quantity;
        return total + currentValue;
    }, 0);

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalLossValue = 0;
    const productProfits: { [key: string]: { name: string, profit: number, lossValue: number } } = {};

    // Initialize product profits/losses map
    products.forEach(p => {
        productProfits[p.id] = { name: p.name, profit: 0, lossValue: 0 };
    });

    // Calculate revenue, profit, and loss from sales records
    sales.forEach(s => {
         const product = products.find(p => p.id === s.productId);
         const { cost: unitCost } = calculateUnitCost(product); // Get unit cost

         // Revenue only counts for non-loss sales
         if (!s.isLoss) {
             totalRevenue += s.saleValue;
         }

         // Profit calculation considers unit cost
         if (s.isLoss) {
             const lossAmount = unitCost * s.quantitySold; // Loss value is based on unit cost
             totalLossValue += lossAmount;
             totalProfit -= lossAmount; // Losses reduce total profit
             if (productProfits[s.productId]) {
                 productProfits[s.productId].lossValue += lossAmount;
                 productProfits[s.productId].profit -= lossAmount; // Loss reduces product-specific profit
             }
         } else {
             // Profit from a normal sale = sale value - cost of goods sold
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
        // Find most profitable (must have positive profit)
        if (data.profit > 0 && (!mostProfitableProduct || data.profit > mostProfitableProduct.profit)) {
            mostProfitableProduct = { name: data.name, profit: data.profit };
        }
         // Find highest loss (must have positive loss value accumulated)
         if (data.lossValue > 0 && (!highestLossProduct || data.lossValue > highestLossProduct.lossValue)) {
             highestLossProduct = { name: data.name, lossValue: data.lossValue };
        }
    });

     // Calculate pending debts
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
        totalInvestment, // Based on current stock value using unit cost
        totalRevenue,
        totalProfit, // Net profit after considering COGS and losses
        totalLossValue, // Total cost of items marked as loss
        mostProfitableProduct,
        highestLossProduct,
        totalReceivablesPending, // Added
        totalPayablesPending, // Added
    };
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: [],
      sales: [],
      debts: [], // Initialize debts state
      lastSync: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true, // Initial online status
      currency: DEFAULT_CURRENCY_CODE, // Initialize with default currency

       setIsOnline: (status) => set({ isOnline: status }),
       setCurrency: (currencyCode) => set({ currency: currencyCode }),

      addProduct: (productData) => {
        // Expects { name, acquisitionValue, quantity }
        // The `initialQuantity` is set based on the `quantity` provided for a *new* product.
        const newProduct: Product = {
            id: uuidv4(),
            name: productData.name,
            acquisitionValue: productData.acquisitionValue,
            quantity: productData.quantity, // Current quantity is the initial quantity
            initialQuantity: productData.quantity, // Set initialQuantity explicitly
            createdAt: new Date().toISOString(),
        };
        set((state) => ({ products: [...state.products, newProduct] }));
        get().syncData().catch(err => console.warn("Background sync failed:", err));
        return newProduct;
    },

      updateProduct: (updatedProduct) => {
        // When updating, acquisitionValue or quantity might change.
        // initialQuantity should typically NOT be changed here unless it's a specific correction.
        // The calculateUnitCost function will use initialQuantity if available.
        set((state) => ({
          products: state.products.map((p) =>
            p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p // Merge updates, preserving existing initialQuantity
         ),
        }));
        get().syncData().catch(err => console.warn("Background sync failed:", err));
      },

       deleteProduct: (productId) => {
         const productToDelete = get().products.find(p => p.id === productId);
         if (!productToDelete) return;

        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
          sales: state.sales.filter((s) => s.productId !== productId), // Remove sales related to the deleted product
          // Consider how to handle debts related to deleted products (e.g., archive or delete?)
          // For simplicity, we'll leave debts for now. A real app might need more complex logic.
        }));
         get().syncData().catch(err => console.warn("Background sync failed:", err));
      },

       getProductById: (productId) => {
           return get().products.find(p => p.id === productId);
       },


      addSale: (saleData) => {
        const product = get().getProductById(saleData.productId);
        if (!product) {
          console.error("Product not found for sale:", saleData.productId);
          return null;
        }
        // Check against current quantity (product.quantity)
        if (product.quantity < saleData.quantitySold) { // Strict check: cannot sell/lose more than available
             console.error("Insufficient stock for sale/loss:", saleData.productId, "Available:", product.quantity, "Requested:", saleData.quantitySold);
             // Throw an error or return null to indicate failure
             throw new Error("Quantidade em estoque insuficiente.");
             // return null;
        }

         const { cost: unitCost } = calculateUnitCost(product); // Calculate unit cost using the helper

         // Calculate profit based on unit cost
         const profit = saleData.isLoss
             ? -(unitCost * saleData.quantitySold) // If loss, profit is negative unit cost * quantity
             : saleData.saleValue - (unitCost * saleData.quantitySold); // Profit = Sale Value - Cost of Goods Sold

        const newSale: Sale = {
          ...saleData,
          id: uuidv4(),
          productName: product.name,
          profit: profit, // Use the calculated profit
          createdAt: new Date().toISOString(),
        };

         // Update product's current quantity
         const updatedProducts = get().products.map(p =>
             p.id === saleData.productId
                 ? { ...p, quantity: p.quantity - saleData.quantitySold } // Update current quantity
                 : p
         );


        set((state) => ({
            sales: [...state.sales, newSale],
            products: updatedProducts,
         }));
         get().syncData().catch(err => console.warn("Background sync failed:", err));
         return newSale;
      },

       deleteSale: (saleId) => {
         const saleToDelete = get().sales.find(s => s.id === saleId);
         if (!saleToDelete) return;

         // Restore product's current quantity when deleting a sale/loss record
         const updatedProducts = get().products.map(p =>
             p.id === saleToDelete.productId
                 ? { ...p, quantity: p.quantity + saleToDelete.quantitySold } // Adjust current quantity back
                 : p
         );


        set((state) => ({
          sales: state.sales.filter((s) => s.id !== saleId),
           products: updatedProducts,
           // Consider cascade delete/update for related debts if a sale is deleted
           // debts: state.debts.filter(d => d.relatedSaleId !== saleId) // Example: delete related debts
        }));
         get().syncData().catch(err => console.warn("Background sync failed:", err));
      },

       // --- Debt Management ---
      addDebt: (debtData) => {
          const newDebt: Debt = {
              ...debtData,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              status: 'pending', // New debts start as pending
              amountPaid: 0, // New debts start with 0 paid
          };
          set((state) => ({ debts: [...state.debts, newDebt] }));
          get().syncData().catch(err => console.warn("Background sync failed:", err));
          return newDebt;
      },

      updateDebt: (debtId, updates) => {
          set((state) => ({
              debts: state.debts.map((debt) => {
                  if (debt.id === debtId) {
                      const updatedDebt = { ...debt, ...updates };
                      // Auto-update status based on amount paid
                      if (updatedDebt.amountPaid >= updatedDebt.amount) {
                          updatedDebt.status = 'paid';
                          updatedDebt.paidAt = updatedDebt.paidAt ?? new Date().toISOString(); // Set paidAt if not already set
                      } else if (updatedDebt.amountPaid > 0) {
                          updatedDebt.status = 'partially_paid';
                          updatedDebt.paidAt = null; // Ensure paidAt is null if only partially paid
                      } else {
                          updatedDebt.status = 'pending';
                           updatedDebt.paidAt = null; // Ensure paidAt is null if pending
                      }
                      return updatedDebt;
                  }
                  return debt;
              }),
          }));
          get().syncData().catch(err => console.warn("Background sync failed:", err));
      },

      deleteDebt: (debtId) => {
          set((state) => ({
              debts: state.debts.filter((d) => d.id !== debtId),
          }));
           get().syncData().catch(err => console.warn("Background sync failed:", err));
      },

      getDebtById: (debtId) => {
          return get().debts.find(d => d.id === debtId);
      },
       // -----------------------

       getSalesReportData: () => {
           const { products, sales, debts } = get(); // Include debts
           // Pass debts to the calculation function
           return calculateReports(products, sales, debts);
       },

        // Load initial data or replace existing data
        setProducts: (products) => set({ products }),
        setSales: (sales) => set({ sales }),
        setDebts: (debts) => set({ debts }), // Setter for debts
        setLastSync: (date) => set({ lastSync: date }),

        // Simulate synchronization with Google Drive
        syncData: async () => {
            if (!get().isOnline) {
                console.log("Offline. Sync skipped.");
                return;
            }
            console.log("Simulating data synchronization...");
             try {
                 await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
                 console.log("Synchronization simulation complete.");
                 set({ lastSync: new Date() });
             } catch (error) {
                 console.error("Synchronization simulation failed:", error);
             }
        },

    }),
    {
      name: 'vendas-tranquilas-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
       // Persist products, sales, debts, currency, and last sync time.
       partialize: (state) => ({
           products: state.products,
           sales: state.sales,
           debts: state.debts, // Persist debts
           lastSync: state.lastSync,
           currency: state.currency // Persist the selected currency
        }),
        onRehydrateStorage: () => (state, error) => {
            if (error) {
                console.error("Failed to rehydrate state from storage:", error);
            } else if (state) {
                 if (!state.currency) {
                    state.currency = DEFAULT_CURRENCY_CODE;
                 }
                 // Ensure debts is an array on rehydration
                 if (!Array.isArray(state.debts)) {
                    state.debts = [];
                 }
                const isOnlineNow = typeof navigator !== 'undefined' ? navigator.onLine : true;
                state.setIsOnline(isOnlineNow);
                console.log("Hydration finished. Current currency:", state.currency);
            }
        }
    }
  )
);

// Add event listeners for online/offline status
if (typeof window !== 'undefined') {
    const updateOnlineStatus = () => {
        const storeState = useStore.getState();
        const currentlyOnline = navigator.onLine;
        storeState.setIsOnline(currentlyOnline);
         if (currentlyOnline) {
            console.log("Became online. Attempting background sync...");
             storeState.syncData().catch(err => console.warn("Background sync failed:", err));
         } else {
             console.log("Became offline.");
         }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

// Export UUID generator if needed elsewhere
export { uuidv4 };
