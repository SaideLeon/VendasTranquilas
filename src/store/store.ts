import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, Sale, ReportData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  products: Product[];
  sales: Sale[];
  lastSync: Date | null;
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  getProductById: (productId: string) => Product | undefined;
  addSale: (saleData: Omit<Sale, 'id' | 'profit' | 'productName' | 'createdAt'>) => Sale | null;
  deleteSale: (saleId: string) => void;
  getSalesReportData: () => ReportData;
  setProducts: (products: Product[]) => void;
  setSales: (sales: Sale[]) => void;
  setLastSync: (date: Date | null) => void;
  // Simulate sync function
  syncData: () => Promise<void>;
}

// Helper function to calculate profit
const calculateProfit = (saleValue: number, acquisitionValue: number, quantitySold: number): number => {
    return saleValue - (acquisitionValue * quantitySold);
};

// Helper function to calculate reports
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
        if (!mostProfitableProduct || data.profit > mostProfitableProduct.profit) {
            if (data.profit > 0) { // Only consider profitable products
              mostProfitableProduct = { name: data.name, profit: data.profit };
            }
        }
         if (!highestLossProduct || data.lossValue > highestLossProduct.lossValue) {
            if(data.lossValue > 0) { // Only consider products with losses
             highestLossProduct = { name: data.name, lossValue: data.lossValue };
            }
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

       setIsOnline: (status) => set({ isOnline: status }),

      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ products: [...state.products, newProduct] }));
        return newProduct;
      },

      updateProduct: (updatedProduct) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          ),
        }));
      },

       deleteProduct: (productId) => {
         // Also delete related sales to maintain data integrity
         const productToDelete = get().products.find(p => p.id === productId);
         if (!productToDelete) return;

        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
          sales: state.sales.filter((s) => s.productId !== productId) // Remove sales related to the deleted product
        }));
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

        // Update product quantity only if it's not a loss/write-off
        let updatedProducts = get().products;
        if (!saleData.isLoss) {
            updatedProducts = get().products.map((p) =>
                p.id === saleData.productId
                ? { ...p, quantity: p.quantity - saleData.quantitySold }
                : p
            );
        } else {
           // If it IS a loss, decrease quantity anyway because the product is gone
            updatedProducts = get().products.map((p) =>
                p.id === saleData.productId
                ? { ...p, quantity: p.quantity - saleData.quantitySold }
                : p
            );
        }


        set((state) => ({
            sales: [...state.sales, newSale],
            products: updatedProducts,
         }));
         return newSale;
      },

       deleteSale: (saleId) => {
         const saleToDelete = get().sales.find(s => s.id === saleId);
         if (!saleToDelete) return;

         // Restore product quantity if the sale wasn't a loss
         let updatedProducts = get().products;
         if (!saleToDelete.isLoss) {
            updatedProducts = get().products.map(p =>
                p.id === saleToDelete.productId
                    ? { ...p, quantity: p.quantity + saleToDelete.quantitySold }
                    : p
            );
         } else {
              // If it was a loss, restore quantity too, as deleting the loss record means it didn't happen
             updatedProducts = get().products.map(p =>
                p.id === saleToDelete.productId
                    ? { ...p, quantity: p.quantity + saleToDelete.quantitySold }
                    : p
            );
         }


        set((state) => ({
          sales: state.sales.filter((s) => s.id !== saleId),
           products: updatedProducts,
        }));
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
                return;
            }
            console.log("Simulating data synchronization with Google Drive...");
            // In a real app, replace this with actual Google Drive API calls
            // to upload/download data.
             await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

             // Simulate fetching latest data (in reality, you'd compare timestamps/versions)
             // For this simulation, we assume the local data is the source of truth to upload.
             const currentProducts = get().products;
             const currentSales = get().sales;

             console.log("Data to upload:", { products: currentProducts, sales: currentSales });

             // Simulate successful upload
             console.log("Synchronization simulation complete.");
             set({ lastSync: new Date() });
        },

    }),
    {
      name: 'vendas-tranquilas-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
       // Only persist products and sales. Sync status is transient.
       partialize: (state) => ({ products: state.products, sales: state.sales, lastSync: state.lastSync }),
        // Rehydrate hook to potentially merge server data if needed on load
        // onRehydrateStorage: () => (state, error) => {
        //     if (error) {
        //         console.error("Failed to rehydrate state from storage:", error);
        //     } else if (state) {
        //         // Check online status on load and maybe trigger sync
        //         const isOnlineNow = typeof navigator !== 'undefined' ? navigator.onLine : true;
        //         state.setIsOnline(isOnlineNow);
        //         if (isOnlineNow) {
        //             // Optional: Automatically trigger sync on load if online
        //             // state.syncData();
        //         }
        //         console.log("Hydration finished");
        //     }
        // }
    }
  )
);

// Add event listeners for online/offline status
if (typeof window !== 'undefined') {
    const updateOnlineStatus = () => {
        const storeState = useStore.getState();
        storeState.setIsOnline(navigator.onLine);
         if (navigator.onLine) {
            console.log("Became online. Attempting to sync...");
             // Attempt sync when coming back online
             storeState.syncData();
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
