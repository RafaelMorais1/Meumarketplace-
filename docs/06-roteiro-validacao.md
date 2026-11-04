# 06 - Roteiro de Teste Manual (Smoke Test)

Este documento é o guia prático para validação manual do MVP. Ao final da implementação, execute os passos abaixo sequencialmente para verificar o funcionamento do sistema em um navegador real.

---

## Pré-requisitos
1. Banco de dados rodando via `docker compose up -d`.
2. Aplicação iniciada via `npm run dev`.
3. Navegador aberto em `http://localhost:3000`.

---

## Checklist de Validação

| Passo | Ação do Testador | Resultado Esperado | Status |
| :---: | :--- | :--- | :---: |
| **01** | Acessar a página inicial (`/`) como visitante anônimo | - Catálogo público é renderizado.<br>- Barra de navegação exibe botões "Entrar" e "Cadastre-se".<br>- Não há botão de "Cadastrar Produto" visível. | [ ] |
| **02** | Clicar em "Cadastre-se" e criar conta com papel **Comprador** (`buyer`) | - Formulário aceita nome, e-mail, senha e seleção "Quero Comprar".<br>- Usuário é redirecionado logado para a página inicial com seu nome no cabeçalho. | [ ] |
| **03** | Tentar acessar manualmente a URL restrita de criação (`/dashboard/products/new`) como Comprador | - Acesso negado com mensagem clara de permissão insuficiente (403) ou redirecionamento amigável.<br>- Comprador não consegue enviar formulário de criação. | [ ] |
| **04** | Efetuar Logout | - Sessão encerrada.<br>- Cookie removido do navegador.<br>- Cabeçalho volta ao estado não autenticado ("Entrar"). | [ ] |
| **05** | Cadastrar um novo usuário com papel **Vendedor** (`seller`) | - Registro concluído com sucesso.<br>- Cabeçalho exibe atalho "Meus Produtos" ou "Novo Produto". | [ ] |
| **06** | Acessar `/dashboard/products/new` e cadastrar um produto "Teclado Mecânico RGB" com preço R$ 250,00 (25000 centavos) | - Produto é salvo com sucesso.<br>- Redirecionamento para a lista "Meus Produtos" com o item cadastrado. | [ ] |
| **07** | Acessar a página pública inicial (`/`) em aba anônima (sem login) | - O produto "Teclado Mecânico RGB" aparece na listagem pública com preço R$ 250,00.<br>- Clicar no produto abre a página de detalhes exibindo descrição e dados do vendedor. | [ ] |
| **08** | Testar busca pública: digitar "Teclado" no campo de pesquisa | - Apenas produtos contendo a palavra aparecem na listagem.<br>- Busca por termo inexistente ("XyZ999") exibe mensagem amigável de "Nenhum produto encontrado". | [ ] |
| **09** | Logar com o Vendedor e editar o preço do produto para R$ 230,00 | - Atualização concluída com sucesso.<br>- Novo preço reflete instantaneamente na página de detalhes e na listagem. | [ ] |
| **10** | Cadastrar um Segundo Vendedor em outra janela e tentar acessar a rota de edição do produto do Primeiro Vendedor | - Ação bloqueada com erro 403 Forbidden.<br>- O segundo vendedor só enxerga e gerencia seus próprios itens. | [ ] |
| **11** | Primeiro Vendedor remove o produto | - Produto é excluído da lista "Meus Produtos".<br>- Produto desaparece da busca e da listagem pública. | [ ] |

