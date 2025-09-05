// src/app/api/sync/debts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { Debt } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const debts = (await req.json()) as Debt[];

  const results = await prisma.$transaction(async (tx) => {
    const upsertedDebts = [];
    for (const debt of debts) {
      const existingDebt = await tx.debt.findUnique({
        where: { id: debt.id },
      });

      if (existingDebt) {
        if (new Date(debt.updatedAt) > new Date(existingDebt.updatedAt)) {
          const updatedDebt = await tx.debt.update({
            where: { id: debt.id },
            data: { ...debt, userId },
          });
          upsertedDebts.push(updatedDebt);
        }
      } else {
        const newDebt = await tx.debt.create({
          data: { ...debt, userId },
        });
        upsertedDebts.push(newDebt);
      }
    }
    return upsertedDebts;
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

  const debts = await prisma.debt.findMany({
    where: {
      userId,
      updatedAt: {
        gte: since ? new Date(since) : new Date(0),
      },
    },
  });

  return NextResponse.json(debts);
}
