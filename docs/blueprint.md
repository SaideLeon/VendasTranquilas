# **App Name**: Vendas Tranquilas

## Core Features:

- Product Registration: Input form to register products with name, acquisition value, and quantity.
- Sales Recording: Interface for registering sales, selecting products from stock, and recording sales data like quantity and sales price. Includes an option to record losses with a reason.
- Reports Dashboard: Display basic reports showing total products, total sales, total investment, total revenue, total profit, and total losses.

## Style Guidelines:

- Primary color: Soft green (#C8E6C9) to represent growth and sales.
- Secondary color: Light gray (#F5F5F5) for backgrounds to provide a clean look.
- Accent: Teal (#4DB6AC) for interactive elements and call-to-action buttons.
- Clean and organized layout with clear sections for product management, sales recording, and reports.
- Use simple, consistent icons to represent different products and actions.

## Original User Request:
A aplicação de controle de produtos e vendas foi concluída com sucesso! Vou explicar as principais funcionalidades implementadas:

## Funcionalidades principais:

### 1. Gerenciamento de produtos
- Cadastro de produtos com nome, valor de aquisição e quantidade
- Listagem de produtos cadastrados com opções para editar e excluir
- Busca de produtos por nome

### 2. Registro de vendas
- Seleção de produtos disponíveis em estoque
- Entrada de dados como quantidade vendida e valor de venda
- Opção para registrar prejuízo/perda com campo para motivo
- Cálculo automático de lucro por venda

### 3. Relatórios e estatísticas
- Total de produtos e vendas
- Investimento total (custo de aquisição dos produtos)
- Faturamento total (soma de todas as vendas)
- Lucro total
- Prejuízos totais
- Produto mais rentável
- Produto com maior prejuízo

### 4. Sincronização online/offline
- Funciona offline armazenando dados no localStorage
- Detecta automaticamente quando está online para sincronizar
- Simula sincronização com Google Drive (em uma implementação real, seria usado a API do Google Drive)

### 5. Exportação e importação
- Exportação de dados para arquivo JSON
- Importação de dados com opção de substituir ou mesclar

## Como usar:

1. Abra a aplicação em um navegador web
2. Na aba "Produtos", cadastre seus produtos com valor de aquisição
3. Na aba "Vendas", registre as vendas selecionando o produto e informando o valor de venda
4. Marque se houve prejuízo quando necessário
5. Consulte relatórios na aba "Relatórios"
6. Quando estiver online, os dados serão sincronizados automaticamente

A aplicação é completamente funcional no navegador e usa armazenamento local para funcionar offline. Quando você estiver online, ela simulará a sincronização com o Google Drive (na implementação real, isso seria feito usando a API do Google Drive conforme conversamos anteriormente).
  