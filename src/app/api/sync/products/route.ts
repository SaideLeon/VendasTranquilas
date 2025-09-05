// src/app/api/sync/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { Product } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const products = (await req.json()) as Product[];

  const results = await prisma.$transaction(async (tx) => {
    const upsertedProducts = [];
    for (const product of products) {
      const existingProduct = await tx.product.findUnique({
        where: { id: product.id },
      });

      if (existingProduct) {
        if (new Date(product.updatedAt) > new Date(existingProduct.updatedAt)) {
          const updatedProduct = await tx.product.update({
            where: { id: product.id },
            data: { ...product, userId },
          });
          upsertedProducts.push(updatedProduct);
        }
      } else {
        const newProduct = await tx.product.create({
          data: { ...product, userId },
        });
        upsertedProducts.push(newProduct);
      }
    }
    return upsertedProducts;
  });

  return NextResponse.json(results);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const since = searchParams.get('since');

  const products = await prisma.product.findMany({
    where: {
      userId,
      updatedAt: {
        gte: since ? new Date(since) : new Date(0),
      },
    },
  });

  return NextResponse.json(products);
}
