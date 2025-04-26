# Vendas Tranquilas

Aplicação web para controle simplificado de produtos, vendas e perdas, com foco em funcionamento offline e sincronização simulada.

## Funcionalidades

*   **Gerenciamento de Produtos:** Cadastro, edição, exclusão e busca de produtos com nome, valor de aquisição e quantidade em estoque.
*   **Registro de Vendas e Perdas:** Registre vendas selecionando produtos, informando quantidade e valor. Marque transações como perda (com motivo) para controle de prejuízos.
*   **Relatórios:** Visualize métricas chave como totais, investimento, faturamento, lucro/prejuízo líquido, e identifique produtos mais rentáveis ou com maior perda.
*   **Funcionamento Offline:** Os dados são armazenados localmente no navegador (localStorage), permitindo o uso da aplicação mesmo sem conexão com a internet.
*   **Sincronização (Simulada):** Detecta automaticamente o status da conexão e simula uma sincronização de dados quando online.
*   **Importar/Exportar:** Faça backup dos seus dados exportando para um arquivo JSON ou importe dados de um backup anterior.

## Como Usar

1.  **Acesse a Aplicação:** Abra o link da aplicação no seu navegador web.
2.  **Cadastre Produtos:** Vá para a aba "Produtos" (`/produtos`) e adicione seus itens, informando nome, custo de aquisição e estoque inicial.
3.  **Registre Vendas/Perdas:** Na aba "Vendas" (`/vendas`), selecione o produto, informe a quantidade e o valor da venda. Se for uma perda (produto danificado, vencido, etc.), marque a opção "Registrar como Prejuízo / Perda" e descreva o motivo.
4.  **Consulte Relatórios:** Acesse a aba "Relatórios" (`/relatorios`) para ver as estatísticas atualizadas do seu negócio.
5.  **Importar/Exportar:** Use os botões no cabeçalho (ícone de nuvem) para baixar um backup (JSON) ou carregar dados de um arquivo de backup.
6.  **Sincronização:** O ícone de Wi-Fi no cabeçalho indica o status da conexão. A sincronização (simulada) é tentada automaticamente ao ficar online ou ao realizar alterações.

## Tecnologias Utilizadas

*   Next.js (App Router)
*   React
*   TypeScript
*   Tailwind CSS
*   Shadcn/ui (Component Library)
*   Zustand (State Management)
*   Zod (Validation)
*   date-fns (Date Formatting)
*   uuid (Unique ID Generation)
*   Lucide React (Icons)

## Desenvolvimento Local

1.  **Clone o repositório:**
    ```bash
    git clone <url_do_repositorio>
    cd vendas-tranquilas
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    # ou yarn install
    ```
3.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    # ou yarn dev
    ```
4.  Abra [`http://localhost:9002`](http://localhost:9002) (ou a porta configurada) no seu navegador.