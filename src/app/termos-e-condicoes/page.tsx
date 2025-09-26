// src/app/termos-e-condicoes/page.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function TermosECondicoesPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-800">
              Termos e Condições de Uso - SIGEF
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none text-gray-700">
            <p className="text-sm text-center text-muted-foreground">Última atualização: 09 de Setembro de 2025</p>

            <h2 className="font-semibold text-xl mt-6">1. Bem-vindo ao SIGEF!</h2>
            <p>
              Estes Termos e Condições ("Termos") regem o seu acesso e uso do nosso Sistema Intuitivo de Gestão Financeira ("SIGEF", "Serviço", "Plataforma"), um serviço oferecido para ajudar na gestão de produtos, vendas, dívidas e na obtenção de análises financeiras através de inteligência artificial. Ao aceder ou usar o nosso Serviço, você concorda em cumprir e estar vinculado a estes Termos. Se não concordar, não utilize a Plataforma.
            </p>

            <h2 className="font-semibold text-xl mt-6">2. Descrição do Serviço</h2>
            <p>
              O SIGEF é uma plataforma de software como serviço (SaaS) que permite aos usuários:
            </p>
            <ul>
              <li>Cadastrar e gerir o estoque de produtos, incluindo valor de aquisição e quantidades.</li>
              <li>Registar transações de vendas e perdas, com cálculo automático de lucros.</li>
              <li>Controlar dívidas a pagar e a receber, com datas de vencimento e status de pagamento.</li>
              <li>Utilizar uma ferramenta de análise baseada em Inteligência Artificial (IA) para gerar insights e relatórios sobre a saúde financeira do seu negócio.</li>
              <li>Importar e exportar os seus dados em formato JSON.</li>
            </ul>

            <h2 className="font-semibold text-xl mt-6">3. Contas de Usuário e Segurança</h2>
            <p>
              Para aceder à maioria das funcionalidades, é necessário criar uma conta utilizando o serviço de autenticação do Google. Você é responsável por manter a confidencialidade da sua conta e por todas as atividades que ocorram sob a mesma. Você concorda em notificar-nos imediatamente sobre qualquer uso não autorizado da sua conta. Nós não nos responsabilizamos por qualquer perda ou dano resultante do seu incumprimento desta obrigação de segurança.
            </p>

            <h2 className="font-semibold text-xl mt-6">4. Privacidade e Uso de Dados</h2>
            <p>
              A sua privacidade é de extrema importância para nós.
            </p>
            <ul>
              <li><strong>Coleta de Dados:</strong> Coletamos os dados que você insere na plataforma, como informações de produtos, vendas e dívidas. Também coletamos informações básicas do seu perfil Google (nome, e-mail, foto) para fins de autenticação e identificação na plataforma.</li>
              <li><strong>Uso dos Dados:</strong> Os seus dados financeiros (produtos, vendas, dívidas) são usados exclusivamente para fornecer os serviços descritos, incluindo a geração de relatórios e análises pela nossa ferramenta de IA. Não vendemos nem partilhamos os seus dados financeiros com terceiros para fins de marketing.</li>
              <li><strong>Segurança:</strong> Empregamos medidas de segurança padrão da indústria para proteger os seus dados. No entanto, nenhum método de transmissão pela Internet ou de armazenamento eletrónico é 100% seguro.</li>
            </ul>
            <p>
              Para mais detalhes, por favor, consulte a nossa <Link href="/politica-de-privacidade" className="text-teal-600 hover:underline">Política de Privacidade</Link>.
            </p>

            <h2 className="font-semibold text-xl mt-6">5. Análises Geradas por Inteligência Artificial (IA)</h2>
            <p>
              Uma das funcionalidades centrais do SIGEF é a análise financeira gerada por IA. É crucial que você entenda e concorde com o seguinte:
            </p>
            <blockquote className="border-l-4 border-teal-500 pl-4 italic my-4">
              "Esta análise é gerada por IA e baseada exclusivamente nos dados fornecidos (produtos, vendas, dívidas). É uma ferramenta de apoio e não substitui aconselhamento financeiro profissional."
            </blockquote>
            <p>
              As recomendações e insights são automáticos e não devem ser considerados como aconselhamento financeiro, legal ou fiscal. Você é o único responsável pelas decisões tomadas com base nas informações fornecidas pela plataforma.
            </p>

            <h2 className="font-semibold text-xl mt-6">6. Planos e Pagamentos</h2>
            <p>
              O SIGEF oferece diferentes planos de serviço (Gratuito, Profissional, Empresarial). As funcionalidades e limites de cada plano estão descritos na nossa página de Preços. Ao subscrever um plano pago, você concorda em pagar as taxas aplicáveis. As taxas são cobradas antecipadamente, de acordo com o ciclo de faturação (mensal ou anual).
            </p>

            <h2 className="font-semibold text-xl mt-6">7. Propriedade Intelectual</h2>
            <ul>
              <li><strong>Nosso Serviço:</strong> Nós detemos todos os direitos, títulos e interesses sobre o Serviço SIGEF, incluindo todo o software, design, e conteúdo (excluindo os seus dados).</li>
              <li><strong>Seus Dados:</strong> Você detém todos os direitos sobre os dados que insere na plataforma. Concede-nos apenas uma licença limitada para usar, processar e exibir os seus dados, conforme necessário para fornecer o Serviço a você.</li>
            </ul>

            <h2 className="font-semibold text-xl mt-6">8. Rescisão</h2>
            <p>
              Você pode deixar de usar o nosso Serviço e excluir a sua conta a qualquer momento. Nós reservamo-nos o direito de suspender ou encerrar a sua conta se você violar estes Termos, com ou sem aviso prévio.
            </p>

            <h2 className="font-semibold text-xl mt-6">9. Limitação de Responsabilidade</h2>
            <p>
              O Serviço é fornecido "COMO ESTÁ". Na máxima extensão permitida por lei, o SIGEF e os seus fornecedores isentam-se de todas as garantias, expressas ou implícitas. Em nenhuma circunstância seremos responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, ou por qualquer perda de lucros ou receitas, incorridos direta ou indiretamente.
            </p>

            <h2 className="font-semibold text-xl mt-6">10. Alterações aos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Se fizermos alterações, iremos notificá-lo publicando os Termos revistos na plataforma ou através de outros meios. O uso continuado do Serviço após a data de vigência dos Termos revistos constitui a sua aceitação dos mesmos.
            </p>

            <h2 className="font-semibold text-xl mt-6">11. Lei Aplicável</h2>
            <p>
              Estes Termos serão regidos e interpretados de acordo com as leis de Moçambique, sem consideração aos seus conflitos de disposições legais.
            </p>

            <h2 className="font-semibold text-xl mt-6">12. Contato</h2>
            <p>
              Se tiver alguma dúvida sobre estes Termos, por favor, entre em contato connosco através do e-mail: <a href="mailto:suporte@sigef.com" className="text-teal-600 hover:underline">suporte@sigef.com</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
