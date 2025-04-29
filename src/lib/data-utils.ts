import { useStore } from '@/store/store';
import type { Product, Sale, Debt } from '@/types'; // Add Debt type

interface ExportData {
  products: Product[];
  sales: Sale[];
  debts: Debt[]; // Add debts field
  exportedAt: string;
  version: number; // Simple versioning
}

const DATA_VERSION = 1; // Keep version consistent or increment if structure changes significantly

// Function to export data
export const handleExport = async () => {
  const { products, sales, debts } = useStore.getState(); // Get debts from store

  const dataToExport: ExportData = {
    products,
    sales,
    debts, // Include debts in the export object
    exportedAt: new Date().toISOString(),
    version: DATA_VERSION,
  };

  const jsonString = JSON.stringify(dataToExport, null, 2); // Pretty print JSON
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `dyfinzo_backup_${new Date().toISOString().split('T')[0]}.json`; // Filename e.g., vendas_tranquilas_backup_2023-10-27.json
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Clean up
};

// Function to import data
export const handleImport = async (
    file: File,
    setProducts: (products: Product[]) => void,
    setSales: (sales: Sale[]) => void,
    setDebts: (debts: Debt[]) => void, // Add setDebts function
    setLastSync: (date: Date | null) => void
    // merge: boolean = false // Option to merge instead of replace (more complex)
    ): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        if (!jsonString) {
          throw new Error("File is empty or could not be read.");
        }

        const importedData = JSON.parse(jsonString) as Partial<ExportData>; // Use partial for validation

        // Basic validation
        if (!importedData || typeof importedData !== 'object') {
            throw new Error("Invalid file format: Not a valid JSON object.");
        }
        if (!Array.isArray(importedData.products) || !Array.isArray(importedData.sales)) {
          throw new Error("Invalid file format: Missing 'products' or 'sales' array.");
        }
         // Validate debts array (optional, defaults to empty if missing)
         if (importedData.debts && !Array.isArray(importedData.debts)) {
             throw new Error("Invalid file format: 'debts' field must be an array if present.");
         }

         if (importedData.version !== DATA_VERSION) {
             console.warn(`Importing data from a different version (File: ${importedData.version}, App: ${DATA_VERSION}). Compatibility issues may arise.`);
             // Add more robust version handling/migration if needed
         }


        // TODO: Add more robust validation for each product, sale, and debt object structure if needed

        // Replace current data
        setProducts(importedData.products);
        setSales(importedData.sales);
        setDebts(importedData.debts || []); // Set debts, defaulting to empty array if not present
        setLastSync(null); // Reset sync status after import

        resolve();
      } catch (error) {
        console.error("Error processing imported file:", error);
        if (error instanceof SyntaxError) {
            reject(new Error("Invalid JSON file. Please check the file content."));
        } else if (error instanceof Error) {
             reject(error); // Forward validation errors
        } else {
             reject(new Error("An unknown error occurred during import."));
        }

      }
    };

    reader.onerror = (event) => {
      console.error("Error reading file:", event.target?.error);
      reject(new Error("Failed to read the selected file."));
    };

    reader.readAsText(file);
  });
};
