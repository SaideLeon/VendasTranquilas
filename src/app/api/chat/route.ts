// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This is a placeholder for the real AI logic.
async function getAiResponse(message: string, userId: string): Promise<string> {
    // 1. Fetch user data
    const products = await prisma.product.findMany({ where: { userId } });
    const sales = await prisma.sale.findMany({ where: { userId } });
    const debts = await prisma.debt.findMany({ where: { userId } });

    // 2. Construct a prompt
    const dataContext = `
      Products: ${JSON.stringify(products, null, 2)}
      Sales: ${JSON.stringify(sales, null, 2)}
      Debts: ${JSON.stringify(debts, null, 2)}
    `;

    const prompt = `
      Based on the following user data, answer the user's question.
      User question: "${message}"
      Data:
      ${dataContext}
    `;

    // 3. Call AI service (e.g., Gemini)
    // const aiResponse = await callGemini(prompt);
    // For now, return a mock response.
    console.log("Generated prompt for AI:", prompt);

    return `This is a mocked AI response for the question: "${message}". The full implementation would involve an AI call. For example, if you asked about "Choco Eclairs", I would look through your products and sales to give you the information you requested.`;
}


export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message, conversationId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const aiResponseText = await getAiResponse(message, userId);

    const response = {
      response: aiResponseText,
      conversationId: conversationId || `conv_${Date.now()}`,
      sources: ["Dados do usuário"],
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[CHAT_POST_ERROR]', error);
    // Check for Prisma client initialization errors
    if (error.code === 'P2024') { // Timeout fetching a connection from the pool
        return NextResponse.json({ error: 'Database connection error.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
