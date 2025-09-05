// src/app/api/sync/sales/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { Sale } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const sales = (await req.json()) as Sale[];

  const results = await prisma.$transaction(async (tx) => {
    const upsertedSales = [];
    for (const sale of sales) {
      const existingSale = await tx.sale.findUnique({
        where: { id: sale.id },
      });

      if (existingSale) {
        if (new Date(sale.updatedAt) > new Date(existingSale.updatedAt)) {
          const updatedSale = await tx.sale.update({
            where: { id: sale.id },
            data: { ...sale, userId },
          });
          upsertedSales.push(updatedSale);
        }
      } else {
        const newSale = await tx.sale.create({
          data: { ...sale, userId },
        });
        upsertedSales.push(newSale);
      }
    }
    return upsertedSales;
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

  const sales = await prisma.sale.findMany({
    where: {
      userId,
      updatedAt: {
        gte: since ? new Date(since) : new Date(0),
      },
    },
  });

  return NextResponse.json(sales);
}
