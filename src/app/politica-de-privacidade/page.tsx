// src/app/politica-de-privacidade/page.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-800">
              Política de Privacidade - SIGEF
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none text-gray-700">
            <p className="text-sm text-center text-muted-foreground">Última atualização: 09 de Setembro de 2025</p>

            <h2 className="font-semibold text-xl mt-6">1. Introdução</h2>
            <p>
              A sua privacidade é fundamental para o SIGEF ("nós", "nosso"). Esta Política de Privacidade descreve como coletamos, usamos, processamos e divulgamos as suas informações, incluindo informações pessoais, em conjunto com o seu acesso e uso da nossa plataforma.
            </p>

            <h2 className="font-semibold text-xl mt-6">2. Informações que Coletamos</h2>
            <p>
              Coletamos três categorias principais de informações:
            </p>
            <ul>
              <li>
                <strong>Informações que Você nos Fornece:</strong>
                <ul>
                  <li><strong>Informações da Conta:</strong> Ao registar-se usando a sua conta Google, recebemos o seu nome, endereço de e-mail e foto de perfil.</li>
                  <li><strong>Dados Financeiros:</strong> Você fornece-nos diretamente os dados relativos ao seu negócio, incluindo detalhes de produtos (nome, valor, quantidade), registos de vendas e perdas, e informações sobre dívidas (descrição, valor, datas, contatos).</li>
                </ul>
              </li>
              <li>
                <strong>Informações Coletadas Automaticamente:</strong>
                <ul>
                  <li><strong>Dados de Uso:</strong> Coletamos informações sobre as suas interações com a plataforma, como as páginas que visita e as funcionalidades que utiliza.</li>
                  <li><strong>Cookies e Tecnologias Semelhantes:</strong> Usamos cookies para manter a sua sessão ativa e para entender como utiliza o nosso serviço.</li>
                </ul>
              </li>
            </ul>

            <h2 className="font-semibold text-xl mt-6">3. Como Usamos as Suas Informações</h2>
            <p>
              Utilizamos as suas informações para os seguintes fins:
            </p>
            <ul>
              <li><strong>Fornecer e Melhorar o Serviço:</strong> Para operar, manter, e melhorar as funcionalidades da plataforma, incluindo a autenticação de utilizadores e o processamento dos seus dados financeiros.</li>
              <li><strong>Análise de IA:</strong> Os seus dados de produtos, vendas e dívidas são processados pela nossa ferramenta de Inteligência Artificial para gerar as análises e recomendações financeiras que constituem uma funcionalidade central do SIGEF.</li>
              <li><strong>Comunicação:</strong> Podemos usar o seu endereço de e-mail para enviar informações importantes sobre o serviço, como atualizações dos termos, notificações de segurança ou informações sobre a sua conta.</li>
              <li><strong>Segurança:</strong> Para proteger a plataforma e os nossos utilizadores contra fraude, abuso e incidentes de segurança.</li>
            </ul>

            <h2 className="font-semibold text-xl mt-6">4. Partilha e Divulgação</h2>
            <p>
              <strong>Nós não vendemos os seus dados pessoais.</strong> A partilha de informações é limitada às seguintes circunstâncias:
            </p>
            <ul>
              <li><strong>Fornecedores de Serviços:</strong> Partilhamos informações com fornecedores de serviços de terceiros que nos ajudam a operar a plataforma, como provedores de alojamento (cloud) e a API de IA do Google. Estes fornecedores têm acesso às suas informações apenas para realizar tarefas em nosso nome e são obrigados a não as divulgar ou usar para outros fins.</li>
              <li><strong>Obrigações Legais:</strong> Podemos divulgar as suas informações se formos obrigados por lei, ou se acreditarmos de boa-fé que tal ação é necessária para cumprir com um processo legal.</li>
            </ul>

            <h2 className="font-semibold text-xl mt-6">5. Os Seus Direitos</h2>
            <p>
              Você tem o direito de aceder, corrigir ou excluir as suas informações pessoais. Como todos os dados financeiros são inseridos por si, pode corrigi-los ou excluí-los diretamente na plataforma. Você também pode exportar uma cópia completa dos seus dados a qualquer momento através da funcionalidade de exportação.
            </p>

            <h2 className="font-semibold text-xl mt-6">6. Segurança dos Dados</h2>
            <p>
              Estamos continuamente a implementar e atualizar medidas de segurança administrativas, técnicas e físicas para ajudar a proteger as suas informações contra acesso não autorizado, perda, destruição ou alteração. A autenticação é delegada ao Google para garantir um processo de login seguro.
            </p>

            <h2 className="font-semibold text-xl mt-6">7. Alterações a esta Política</h2>
            <p>
              Reservamo-nos o direito de modificar esta Política de Privacidade a qualquer momento. Se fizermos alterações, publicaremos a política revista na plataforma e atualizaremos a data da "Última atualização".
            </p>

            <h2 className="font-semibold text-xl mt-6">8. Contato</h2>
            <p>
              Se tiver alguma dúvida sobre esta Política de Privacidade, por favor, entre em contato connosco através do e-mail: <a href="mailto:suporte@sigef.com" className="text-teal-600 hover:underline">suporte@sigef.com</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
