import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, Sale, ReportData } from '@/types';
import { calculateUnitCost } from '@/types'; // Import the helper
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
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'initialQuantity'>) => Product; // Form doesn't submit initialQuantity
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

// Helper function to calculate reports
// Values are assumed to be in the globally selected currency.
const calculateReports = (products: Product[], sales: Sale[]): ReportData => {
    // Calculate total investment based on current stock and unit cost
    const totalInvestment = products.reduce((total, product) => {
        const { cost: unitCost } = calculateUnitCost(product);
        const currentValue = unitCost * product.quantity; // Current value = unit cost * current quantity
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

         totalRevenue += s.saleValue; // Revenue is simply the sum of sale values

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


    return {
        totalProducts: products.length,
        totalSales: sales.length,
        totalInvestment, // Based on current stock value using unit cost
        totalRevenue,
        totalProfit, // Net profit after considering COGS and losses
        totalLossValue, // Total cost of items marked as loss
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
        // When adding a new product, the initialQuantity is the quantity provided in the form
        const newProduct: Product = {
          ...productData,
          id: uuidv4(),
          initialQuantity: productData.quantity, // Set initialQuantity on creation
          // quantityInStock is deprecated, use quantity
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ products: [...state.products, newProduct] }));
        get().syncData().catch(err => console.warn("Background sync failed:", err));
        return newProduct;
      },

      updateProduct: (updatedProduct) => {
        // When updating, initialQuantity generally shouldn't change unless it's a major stock correction.
        // The current logic assumes updates modify name, acquisitionValue, or current quantity.
        // If acquisitionValue or quantity changes, unit cost is recalculated implicitly.
        set((state) => ({
          products: state.products.map((p) =>
            p.id === updatedProduct.id ? { ...updatedProduct } : p // Just spread the updated product
         ),
        }));
        get().syncData().catch(err => console.warn("Background sync failed:", err));
      },

       deleteProduct: (productId) => {
         const productToDelete = get().products.find(p => p.id === productId);
         if (!productToDelete) return;

        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
          sales: state.sales.filter((s) => s.productId !== productId) // Remove sales related to the deleted product
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
        if (product.quantity < saleData.quantitySold && !saleData.isLoss) {
             console.error("Insufficient stock for sale:", saleData.productId, "Available:", product.quantity, "Requested:", saleData.quantitySold);
             return null; // Indicate sale couldn't be added due to stock
        }

         const { cost: unitCost } = calculateUnitCost(product); // Calculate unit cost

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
        }));
         get().syncData().catch(err => console.warn("Background sync failed:", err));
      },

       getSalesReportData: () => {
           const { products, sales } = get();
           // The calculateReports function now uses the updated logic internally
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
                 if (!state.currency) {
                    state.currency = DEFAULT_CURRENCY_CODE;
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
