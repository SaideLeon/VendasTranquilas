// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-utils';

// This is a placeholder for the real AI logic which should happen in a dedicated backend service.
async function getAiResponse(message: string, userId: string): Promise<string> {
    console.log(`Generating AI response for user ${userId} for message: "${message}"`);

    // In a real scenario, this would call a backend service that has access to the database and the AI model.
    // That service would be responsible for fetching data and generating a proper response.

    // Returning a mocked response as Prisma is not allowed here.
    const mockResponse = `This is a mocked AI response for your question: "${message}". The backend service that handles the AI logic and database access is not implemented in this environment.`;
    
    // The example response from the prompt
    const exampleResponse = `Para te ajudar com o custo do "Choco Eclairs", preciso de mais informações. Você gostaria de saber:

*   **O valor de aquisição do produto?** (Quanto você pagou por ele para ter em estoque)
*   **O valor de venda do produto?** (Quanto os clientes pagaram por ele)
*   **O lucro obtido com as vendas do produto?**

(This is a static example response, as database access is not available here).`;

    if (message.toLowerCase().includes('choco')) {
        return exampleResponse;
    }

    return mockResponse;
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
      sources: ["Dados do usuário (mocked)"],
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[CHAT_POST_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
