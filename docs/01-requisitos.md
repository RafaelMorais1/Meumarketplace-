# 01 - Especificação de Requisitos e Regras de Negócio

Este documento estabelece o escopo formal do MVP (Minimum Viable Product) do Marketplace, com identificadores únicos para rastreabilidade de código, testes e documentação.

---

## 1. Requisitos Funcionais (RF)

| ID | Título | Descrição | Ator Principal | Critérios de Aceite |
| :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Cadastro de Usuário | Permitir que um novo visitante crie uma conta informando nome, e-mail válido, senha forte e seleção de papel (`buyer` ou `seller`). | Visitante | - E-mail deve ser único no sistema.<br>- Senha deve ter no mínimo 8 caracteres.<br>- Papel deve ser obrigatoriamente `buyer` ou `seller`.<br>- Senha deve ser salva criptografada. |
| **RF-02** | Autenticação (Login) | Autenticar usuário existente via e-mail e senha, gerando uma sessão segura HTTP-only. | Usuário Registrado | - Retornar erro amigável e genérico para credenciais inválidas (evitar enumeração de e-mails).<br>- Bloqueio temporário (rate-limit) após múltiplas tentativas consecutivas falhas.<br>- Criação de registro na tabela de sessões e envio de cookie seguro. |
| **RF-03** | Encerramento de Sessão (Logout) | Encerrar a sessão do usuário ativo, invalidando o token no banco e limpando o cookie do cliente. | Usuário Autenticado | - Sessão revogada no banco.<br>- Cookie expirado no navegador.<br>- Redirecionamento para a página inicial ou login. |
| **RF-04** | Obter Usuário Atual (Me) | Recuperar os dados públicos do perfil do usuário autenticado a partir do cookie de sessão. | Usuário Autenticado | - Se autenticado, retorna ID, nome, e-mail e papel (`role`).<br>- Senha e hash NUNCA são retornados.<br>- Se não autenticado, retorna nulo ou 401. |
| **RF-05** | Criação de Produto | Permitir que um usuário com papel `seller` cadastre um novo produto com título, descrição, preço (em centavos) e estoque inicial. | Vendedor (`seller`) | - Apenas usuários com papel `seller` podem executar a ação.<br>- Título obrigatório (mínimo 3 caracteres).<br>- Preço deve ser um inteiro positivo em centavos.<br>- Estoque deve ser um inteiro maior ou igual a 0.<br>- O produto fica vinculado ao ID do vendedor. |
| **RF-06** | Edição de Produto | Permitir que o vendedor atualize os dados de um produto existente que pertença a ele. | Vendedor (`seller`) | - O vendedor só pode editar produtos criados por ele mesmo.<br>- Validações de campos iguais às do cadastro.<br>- Retornar 403 Forbidden ou erro de negócio se tentar alterar produto de outro vendedor. |
| **RF-07** | Exclusão de Produto | Permitir que o vendedor remova um produto de seu catálogo. | Vendedor (`seller`) | - Apenas o proprietário do produto pode removê-lo.<br>- Retornar 403 se o produto pertencer a outro vendedor.<br>- Produto deixa de aparecer nas listagens públicas. |
| **RF-08** | Listagem de Produtos do Vendedor | Listar exclusivamente os produtos pertencentes ao vendedor autenticado na sua área administrativa ("Meus Produtos"). | Vendedor (`seller`) | - Retorna apenas produtos onde `seller_id == user.id`.<br>- Ordenados pelos mais recentes. |
| **RF-09** | Catálogo Público de Produtos | Permitir que qualquer visitante ou comprador liste produtos disponíveis com paginação e busca por título. | Visitante / Comprador | - Acesso público sem necessidade de login.<br>- Paginação configurável (ex: 10 itens por página).<br>- Busca simples insensível a maiúsculas/minúsculas (case-insensitive) por termo contido no título. |
| **RF-10** | Detalhes do Produto | Exibir as informações completas de um produto específico (título, descrição, preço formatado, estoque e nome do vendedor). | Visitante / Comprador | - Acesso público.<br>- Se o ID não existir, retornar 404 (Não Encontrado). |
| **RF-11** | Solicitação de Recuperação de Senha | Permitir que o usuário solicite redefinição de senha informando seu e-mail cadastrado. | Visitante / Usuário | - Proteção contra enumeração: a resposta exibida deve ser neutra ("Se o e-mail existir, você receberá as instruções").<br>- Geração de token criptograficamente seguro (256 bits).<br>- Token armazenado com hash SHA-256 no banco.<br>- Validade estrita de 15 a 30 minutos.<br>- Disparo de e-mail com link contendo o token puro. |
| **RF-12** | Redefinição de Senha com Token | Permitir a definição de uma nova senha a partir de um token de recuperação válido. | Visitante / Usuário | - Validação do hash do token e verificação de expiração e uso anterior.<br>- Nova senha deve seguir as regras de complexidade (RN-04).<br>- Token marcado como utilizado após sucesso.<br>- Revogação obrigatória de todas as sessões ativas do usuário (RN-08). |

---

## 2. Requisitos Não Funcionais (RNF)

| ID | Categoria | Descrição |
| :--- | :--- | :--- |
| **RNF-01** | **Segurança - Hashing** | Senhas devem ser armazenadas com hash criptográfico seguro utilizando o algoritmo **Argon2id**, resistente a ataques de força bruta com GPU/ASIC. |
| **RNF-02** | **Segurança - Sessão** | Tokens de sessão devem ser strings pseudoaleatórias criptograficamente seguras (256 bits), transmitidas via cookies com atributos `HttpOnly`, `SameSite=Lax` (ou `Strict`) e `Secure` (em produção). |
| **RNF-03** | **Segurança - Sanitização** | Nenhuma senha em texto puro, hash de senha ou token de sessão pode constar em logs da aplicação, mensagens de erro públicas ou retornos de API. |
| **RNF-04** | **Arquitetura - Desacoplamento** | A lógica de negócios (casos de uso) deve ser completamente agnóstica de framework web (Next.js), permitindo testes unitários puros sem dependências de HTTP/DOM. |
| **RNF-05** | **Performance - Banco de Dados** | Queries de busca e listagem devem ser indexadas: índice B-Tree em `users(email)`, `products(seller_id)` e índice de busca/trigrama ou B-Tree em `products(title)`. |
| **RNF-06** | **Integridade Financeira** | Preços de produtos devem ser armazenados como números inteiros representando a menor fração da moeda (centavos de BRL), evitando erros de arredondamento de ponto flutuante IEEE 754. |
| **RNF-07** | **Configuração & Startup** | Todas as variáveis de ambiente necessárias (banco, segredos, portas) devem ser estritamente validadas no momento da inicialização da aplicação (fail-fast com Zod). |
| **RNF-08** | **Reprodutibilidade** | O ambiente de desenvolvimento e banco de testes deve subir com um único comando via `docker compose up`. |

---

## 3. Regras de Negócio (RN)

- **RN-01 (Imutabilidade de Papel no MVP):** O papel (`role`) é definido no momento do registro do usuário (`buyer` ou `seller`) e não pode ser alterado diretamente pelo usuário comum no MVP.
- **RN-02 (Controle de Acesso por Papel - RBAC):**
  - Usuários não autenticados (`guest`): Leitura pública de produtos e acesso a login/cadastro.
  - Compradores (`buyer`): Mesmas permissões de `guest` + perfil autenticado. Tentativas de chamar rotas ou ações de criação/edição/remoção de produtos devem resultar em `403 Forbidden`.
  - Vendedores (`seller`): Podem criar produtos e têm autoridade total (CRUD) **apenas** sobre os produtos onde `product.seller_id == session.user_id`.
- **RN-03 (Isolamento entre Vendedores):** Um vendedor `A` sob hipótese alguma pode editar ou deletar produtos pertencentes ao vendedor `B`. Violações intencionais devem ser bloqueadas com `403 Forbidden` e registradas em log de segurança.
- **RN-04 (Formato de Senha):** Senhas devem conter no mínimo 8 caracteres, incluindo ao menos uma letra e um número.
- **RN-05 (Preço Mínimo de Produto):** O preço de um produto deve ser maior que zero (mínimo de R$ 0,50 ou 50 centavos).
- **RN-06 (Sessão Única ou Múltipla com Expiração):** Sessões expiram após 7 dias de inatividade ou 30 dias absolutos.
- **RN-07 (Ciclo de Vida e Uso Único do Token de Recuperação):**
  - O token de recuperação possui tempo de expiração curto (30 minutos).
  - Um token só pode ser utilizado uma única vez (`used_at IS NULL`).
  - Ao solicitar nova recuperação, tokens anteriores não utilizados do mesmo usuário são invalidados.
- **RN-08 (Revogação de Sessões após Redefinição):** Ao concluir a redefinição de senha com sucesso, todas as sessões ativas do usuário são imediatamente destruídas no banco de dados (`sessions`), exigindo novo login em todos os dispositivos.

---

## 4. Suposições e Decisões de Escopo Registradas

1. **Imagens de Produtos:** No escopo inicial do MVP, produtos aceitam um campo opcional `imageUrl` (string/URL válida). O upload multipart para buckets S3/Cloudinary fica para a fase 2 (Roadmap).
2. **Moeda:** Sistema monetário padronizado em Real Brasileiro (BRL), representado em centavos (`amountInCents`).
3. **Soft Delete vs Hard Delete:** Para o MVP, a exclusão de produtos será física (`DELETE FROM products WHERE id = ...`) para manter o ciclo simples, com a arquitetura preparada para `deleted_at` quando houver pedidos vinculados.

