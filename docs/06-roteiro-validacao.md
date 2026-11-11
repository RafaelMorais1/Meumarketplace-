# 06 - Roteiro de Teste Manual (Smoke Test)

Este documento é o guia prático e passo a passo para homologação manual do MVP pelo mentorando/avaliador.
Ao executar cada passo no navegador, assinale `[x]` para aprovar ou reporte qualquer divergência.

---

## 🛠️ Pré-requisitos para Iniciar
1. Banco de dados PostgreSQL ativo (`docker compose up -d`).
2. Migrações executadas (`npm run db:migrate`).
3. Servidor de desenvolvimento rodando (`npm run dev`).
4. Navegador aberto em `http://localhost:3000`.

---

## 📋 Checklist de Validação Manual

| Passo | Ação do Testador | Dados de Teste | Resultado Esperado | Validação |
| :---: | :--- | :--- | :--- | :---: |
| **01** | Acessar a página inicial (`/`) como visitante anônimo | N/A | - O catálogo público carrega normalmente.<br>- A barra de navegação superior exibe os botões **"Entrar"** e **"Cadastre-se"**.<br>- **NÃO** exibe nenhum link de "Meus Produtos". | [ ] ✅ / ❌ |
| **02** | Clicar em "Cadastre-se" e criar conta com papel **Comprador** (`buyer`) | **Nome:** Ana Compradora<br>**E-mail:** ana@compradora.com<br>**Senha:** SenhaForte123<br>**Papel:** "Quero Comprar" | - O formulário valida os campos.<br>- Login automático imediato.<br>- Redirecionamento para a página inicial exibindo "Ana Compradora" e badge **"Comprador"** no topo. | [ ] ✅ / ❌ |
| **03** | Tentar acessar manualmente no navegador a URL restrita de criação de produtos | Digitar na barra de endereços:<br>`http://localhost:3000/dashboard/products/new` | - O sistema bloqueia a ação imediatamente.<br>- Exibe a tela amigável de **"Acesso Negado (403)"** explicando que compradores não podem anunciar produtos (RN-02). | [ ] ✅ / ❌ |
| **04** | Clicar no botão "Sair" (Logout) no cabeçalho | N/A | - A sessão é encerrada no banco e o cookie removido.<br>- Redirecionamento para `/login`.<br>- A barra superior volta a exibir "Entrar" e "Cadastre-se". | [ ] ✅ / ❌ |
| **05** | Cadastrar um novo usuário com papel **Vendedor** (`seller`) | **Nome:** Marcos Vendedor<br>**E-mail:** marcos@loja.com<br>**Senha:** SenhaForte123<br>**Papel:** "Quero Vender" | - Conta criada com sucesso.<br>- Redirecionamento para a Home exibindo badge **"Vendedor"** e o atalho **"Meus Produtos (Vendedor)"**. | [x] ✅ Aprovado |
| **06** | Acessar `/dashboard/products/new` e cadastrar o primeiro produto | **Título:** Teclado Mecânico RGB Switch Blue<br>**Descrição:** Teclado gamer mecânico com layout ABNT2 e switches azuis.<br>**Preço:** 249,90<br>**Estoque:** 10 | - Produto salvo com sucesso.<br>- Redirecionamento para a tabela de "Meus Produtos" exibindo o produto com preço **R$ 249,90** e estoque 10. | [x] ✅ Aprovado |
| **07** | Abrir uma **Janela Anônima** (sem login) e acessar `http://localhost:3000` | N/A | - O produto aparece na grade pública de produtos com o preço formatado e o nome do vendedor. | [x] ✅ Aprovado |
| **08** | Testar o detalhe do produto na janela anônima | Clicar no card do produto | - Abre a rota `/products/[id]`.<br>- Exibe título, descrição completa, estoque disponível, dados do vendedor e botão "Comprar Agora (Simulação)". | [x] ✅ Aprovado |
| **09** | Testar o campo de busca na página inicial | Digitar palavra do título na barra de pesquisa e clicar em "Buscar" | - A listagem filtra e exibe apenas o produto correspondente.<br>- Busca por termo inexistente exibe mensagem clara: *"Nenhum produto encontrado"*. | [x] ✅ Aprovado |
| **10** | Na janela logada como Marcos Vendedor, editar o produto | Clicar em "Editar" no produto e alterar o preço para **219,90** | - Alteração salva com sucesso.<br>- Preço reflete instantaneamente na tabela e no catálogo público como **R$ 219,90**. | [ ] ✅ / ❌ |
| **11** | Criar um **Segundo Vendedor** (`vendedor2@loja.com`) em outra janela e tentar editar o produto do Marcos | Acessar a URL de edição do produto do Marcos com a conta do Vendedor 2 | - Bloqueado com **403 Forbidden** (RN-03: isolamento estrito entre vendedores). O Vendedor 2 só enxerga e altera seus próprios produtos. | [ ] ✅ / ❌ |
| **12** | Na conta do Marcos Vendedor, excluir o produto | Clicar em "Excluir" | - Produto removido da lista do vendedor.<br>- Produto desaparece imediatamente do catálogo público e das buscas. | [ ] ✅ / ❌ |
