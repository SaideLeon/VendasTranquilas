// src/app/produtos/page.tsx
import { getProducts } from "@/app/actions";
import ProdutosClientPage from "./produtos-client-page";
import { redirect } from 'next/navigation';

export default async function ProdutosPage() {
  try {
    const products = await getProducts();
    return <ProdutosClientPage initialData={{ products }} />;
  } catch (error) {
    redirect('/login');
  }
}
