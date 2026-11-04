# Aprendizado: Gestão de Segredos e Proteção contra Vazamento no GitHub

## A Regra de Ouro da Segurança
**Segredos, senhas e chaves de criptografia NUNCA devem entrar no controle de versão (Git).**

Uma vez que um segredo é commitado em um repositório (mesmo que privado ou mesmo que você delete o arquivo no commit seguinte), **ele permanece gravado para sempre no histórico do Git (`git log`)**. Se o repositório for público ou se tornar público acidentalmente, bots vasculham o histórico em segundos e roubam as credenciais.

---

## Como Estruturamos a Proteção no Nosso Projeto

### 1. Bloqueio Irrevogável no `.gitignore`
Configuramos uma regra que bloqueia qualquer variante de arquivo `.env`:
```gitignore
# Bloqueia todos os arquivos que começam com .env
.env
.env.*

# Abre exceção EXCLUSIVAMENTE para o arquivo de exemplo
!.env.example
```
- O arquivo `.env` (onde ficam as suas senhas reais e o `SESSION_SECRET`) **nunca é rastreado pelo Git**.
- O arquivo `.env.example` é o único versionado, contendo apenas chaves com valores fictícios/placeholders para orientar quem clonar o projeto.

### 2. Validação no Boot (`src/config/env.ts`)
A aplicação nunca assume senhas "hardcoded" como fallback. Se a variável não estiver presente no arquivo local do desenvolvedor ou nas variáveis de ambiente do servidor, o sistema sequer inicializa.

### 3. Sanitização de Saída (RNF-03)
- Nenhuma rota, Server Action ou função de log pode retornar `password_hash` ou tokens brutos.
- Nos testes unitários e de integração, criamos asserções explícitas garantindo que o objeto de usuário retornado para a UI ou API nunca contenha o campo de hash de senha.

### 4. Boas Práticas Adicionais para Produção
- **Pre-commit hooks (GitGuardian ou Gitleaks):** Ferramentas que analisam os arquivos antes de permitir o commit localmente, barrando a operação se detectarem padrões de senhas ou chaves de API.
- **Rotação de Segredos:** Se por qualquer motivo um segredo for exposto, a postura correta é revogá-lo imediatamente no provedor e emitir um novo, tratando o antigo como comprometido.

