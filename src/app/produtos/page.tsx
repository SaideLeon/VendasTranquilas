// src/app/produtos/page.tsx
import { getProducts } from "@/app/actions";
import ProdutosClientPage from "./produtos-client-page";

export const dynamic = 'force-dynamic';

export default async function ProdutosPage() {
  // The middleware now protects this page, so the try/catch for redirection is no longer needed.
  // The `getProducts` action itself will throw an error if the user is not authenticated,
  // which will be caught by Next.js's error boundary.
  const products = await getProducts();
  return <ProdutosClientPage initialData={{ products }} />;
}
