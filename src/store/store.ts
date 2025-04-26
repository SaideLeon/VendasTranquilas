import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, Sale, ReportData } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_CURRENCY_CODE } from '@/config/currencies';

interface AppState {
  products: Product[];
  sales: Sale[];
  lastSync: Date | null;
  isOnline: boolean;
  currency: string; // ISO 4217 currency code (e.g., 'BRL', 'USD')
  setIsOnline: (status: boolean) => void;
  setCurrency: (currencyCode: string) => void;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  getProductById: (productId: string) => Product | undefined;
  addSale: (saleData: Omit<Sale, 'id' | 'profit' | 'productName' | 'createdAt'>) => Sale | null;
  deleteSale: (saleId: string) => void;
  getSalesReportData: () => ReportData; // Report data structure might not need currency itself, but relies on values assumed to be in the selected currency
  setProducts: (products: Product[]) => void;
  setSales: (sales: Sale[]) => void;
  setLastSync: (date: Date | null) => void;
  // Simulate sync function
  syncData: () => Promise<void>;
}

// Helper function to calculate profit
// The calculation logic remains the same, regardless of currency.
const calculateProfit = (saleValue: number, acquisitionValue: number, quantitySold: number): number => {
    return saleValue - (acquisitionValue * quantitySold);
};

// Helper function to calculate reports
// Values are assumed to be in the globally selected currency.
const calculateReports = (products: Product[], sales: Sale[]): ReportData => {
    let totalInvestment = 0;
    products.forEach(p => totalInvestment += p.acquisitionValue * p.quantity);

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalLossValue = 0;
    const productProfits: { [key: string]: { name: string, profit: number, lossValue: number } } = {};

    products.forEach(p => {
        productProfits[p.id] = { name: p.name, profit: 0, lossValue: 0 };
    });


    sales.forEach(s => {
        totalRevenue += s.saleValue;
        totalProfit += s.profit;
        if (s.isLoss) {
             const product = products.find(p => p.id === s.productId);
             const lossAmount = product ? product.acquisitionValue * s.quantitySold : 0;
             totalLossValue += lossAmount;
             if (productProfits[s.productId]) {
                 productProfits[s.productId].lossValue += lossAmount;
             }
        }
        if (productProfits[s.productId]) {
            productProfits[s.productId].profit += s.profit;
        }
    });

    let mostProfitableProduct: { name: string; profit: number } | null = null;
    let highestLossProduct: { name: string; lossValue: number } | null = null;

    Object.values(productProfits).forEach(data => {
        // Find most profitable (must have positive profit)
        if (data.profit > 0 && (!mostProfitableProduct || data.profit > mostProfitableProduct.profit)) {
            mostProfitableProduct = { name: data.name, profit: data.profit };
        }
         // Find highest loss (must have positive loss value)
         if (data.lossValue > 0 && (!highestLossProduct || data.lossValue > highestLossProduct.lossValue)) {
             highestLossProduct = { name: data.name, lossValue: data.lossValue };
        }
    });


    return {
        totalProducts: products.length,
        totalSales: sales.length,
        totalInvestment,
        totalRevenue,
        totalProfit,
        totalLossValue,
        mostProfitableProduct,
        highestLossProduct,
    };
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: [],
      sales: [],
      lastSync: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true, // Initial online status
      currency: DEFAULT_CURRENCY_CODE, // Initialize with default currency

       setIsOnline: (status) => set({ isOnline: status }),
       setCurrency: (currencyCode) => set({ currency: currencyCode }),

      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ products: [...state.products, newProduct] }));
        // Attempt background sync after change
        get().syncData().catch(err => console.warn("Background sync failed:", err));
        return newProduct;
      },

      updateProduct: (updatedProduct) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          ),
        }));
         // Attempt background sync after change
        get().syncData().catch(err => console.warn("Background sync failed:", err));
      },

       deleteProduct: (productId) => {
         // Also delete related sales to maintain data integrity
         const productToDelete = get().products.find(p => p.id === productId);
         if (!productToDelete) return;

        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
          sales: state.sales.filter((s) => s.productId !== productId) // Remove sales related to the deleted product
        }));
         // Attempt background sync after change
        get().syncData().catch(err => console.warn("Background sync failed:", err));
      },

       getProductById: (productId) => {
           return get().products.find(p => p.id === productId);
       },


      addSale: (saleData) => {
        const product = get().getProductById(saleData.productId);
        if (!product) {
          console.error("Product not found for sale:", saleData.productId);
          // Potentially throw an error or return a specific status
          return null;
        }
        if (product.quantity < saleData.quantitySold && !saleData.isLoss) {
             console.error("Insufficient stock for sale:", saleData.productId, "Available:", product.quantity, "Requested:", saleData.quantitySold);
             // Optionally, prevent sale or handle insufficient stock scenario
             return null; // Indicate sale couldn't be added due to stock
        }


        const profit = calculateProfit(saleData.saleValue, product.acquisitionValue, saleData.quantitySold);
        const newSale: Sale = {
          ...saleData,
          id: uuidv4(),
          productName: product.name,
          profit: saleData.isLoss ? -(product.acquisitionValue * saleData.quantitySold) : profit, // If loss, profit is negative acquisition cost
          createdAt: new Date().toISOString(),
        };

        // Update product quantity
        const updatedProducts = get().products.map((p) =>
            p.id === saleData.productId
            ? { ...p, quantity: p.quantity - saleData.quantitySold }
            : p
        );


        set((state) => ({
            sales: [...state.sales, newSale],
            products: updatedProducts,
         }));
          // Attempt background sync after change
         get().syncData().catch(err => console.warn("Background sync failed:", err));
         return newSale;
      },

       deleteSale: (saleId) => {
         const saleToDelete = get().sales.find(s => s.id === saleId);
         if (!saleToDelete) return;

         // Restore product quantity when deleting a sale/loss record
         const updatedProducts = get().products.map(p =>
            p.id === saleToDelete.productId
                ? { ...p, quantity: p.quantity + saleToDelete.quantitySold }
                : p
         );


        set((state) => ({
          sales: state.sales.filter((s) => s.id !== saleId),
           products: updatedProducts,
        }));
         // Attempt background sync after change
        get().syncData().catch(err => console.warn("Background sync failed:", err));
      },

       getSalesReportData: () => {
           const { products, sales } = get();
           return calculateReports(products, sales);
       },

        // Load initial data or replace existing data
        setProducts: (products) => set({ products }),
        setSales: (sales) => set({ sales }),
        setLastSync: (date) => set({ lastSync: date }),

        // Simulate synchronization with Google Drive
        syncData: async () => {
            if (!get().isOnline) {
                console.log("Offline. Sync skipped.");
                // Consider queueing sync or notifying user
                return;
            }
            console.log("Simulating data synchronization...");
            // In a real app, replace this with actual backend/cloud API calls
            // to upload/download data. Include versioning/timestamp checks.
             try {
                 await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

                 // Simulate successful sync
                 console.log("Synchronization simulation complete.");
                 set({ lastSync: new Date() });
             } catch (error) {
                 console.error("Synchronization simulation failed:", error);
                 // Optionally, update UI to indicate sync failure
             }
        },

    }),
    {
      name: 'vendas-tranquilas-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
       // Persist products, sales, currency, and last sync time.
       partialize: (state) => ({
           products: state.products,
           sales: state.sales,
           lastSync: state.lastSync,
           currency: state.currency // Persist the selected currency
        }),
        onRehydrateStorage: () => (state, error) => {
            if (error) {
                console.error("Failed to rehydrate state from storage:", error);
            } else if (state) {
                 // Ensure currency is set, default if not found in storage
                 if (!state.currency) {
                    state.currency = DEFAULT_CURRENCY_CODE;
                 }
                // Check online status on load and maybe trigger sync
                const isOnlineNow = typeof navigator !== 'undefined' ? navigator.onLine : true;
                state.setIsOnline(isOnlineNow);
                // Optional: Auto-sync on load if online and maybe if sync is old
                 // if (isOnlineNow) {
                 //     // Check if lastSync is too old or null
                 //     const syncThreshold = 1000 * 60 * 60; // e.g., 1 hour
                 //     const shouldSync = !state.lastSync || (new Date().getTime() - new Date(state.lastSync).getTime() > syncThreshold);
                 //     if (shouldSync) {
                 //        console.log("Triggering sync on rehydration.");
                 //        state.syncData().catch(err => console.warn("Sync on rehydration failed:", err));
                 //     }
                 // }
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
             // Attempt sync when coming back online
             storeState.syncData().catch(err => console.warn("Background sync failed:", err));
         } else {
             console.log("Became offline.");
         }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

     // Set initial online status correctly after hydration
     // useStore.setState({ isOnline: navigator.onLine });
}

// Export UUID generator if needed elsewhere
export { uuidv4 };
