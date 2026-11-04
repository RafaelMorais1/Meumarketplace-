# ADR-001: Adoção do Monólito Modular com Next.js App Router

## Status
Aceito

## Contexto
Estamos iniciando o desenvolvimento de um marketplace web do zero com autenticação, perfis de usuário (`buyer` e `seller`) e catálogo de produtos. Precisamos escolher a arquitetura de base do sistema considerando:
1. Simplicidade operacional para desenvolvimento e deploy local.
2. Forte suporte a TypeScript ponta a ponta (compartilhamento de tipos e schemas Zod entre validação de formulários e backend).
3. Preparação para escalabilidade futura sem a complexidade prematura de microserviços.

## Decisão
Adotamos o **Next.js App Router estruturado como um Monólito Modular**.
A aplicação é dividida em módulos verticais de domínio (`src/modules/auth`, `src/modules/users`, `src/modules/products`). Cada módulo é composto por:
- `domain`: entidades e interfaces (portas).
- `application`: casos de uso independentes de framework.
- `infrastructure`: implementações concretas de repositórios e serviços externos.

A camada `src/app` do Next.js atua exclusivamente como camada de apresentação (adaptador primário), orquestrando Server Actions, páginas e rotas de API.

## Alternativas Consideradas
1. **Microserviços desde o D1:** Rejeitado devido ao custo excessivo de coordenação, latência de rede, necessidade de múltiplos deploys e ferramentas adicionais (Kubernetes, message brokers), injustificável para o MVP.
2. **Backend Express/Fastify separado + Frontend Vite/Next:** Proporciona separação estrita de processos, mas introduz duplicação de configurações, gerenciamento de múltiplos servidores locais e CORS, sem ganhos imediatos que superem a coesão do monólito modular com Next.js.
3. **Monólito Clássico sem Camadas:** Rejeitado porque misturar lógica de negócio em componentes React ou rotas inviabiliza testes unitários rápidos e cria alto acoplamento ("código espaguete").

## Consequências
### Positivas:
- **Alta testabilidade:** Regras de negócio puras em TypeScript, testáveis em milissegundos sem subir o framework web ou banco.
- **Tipagem de ponta a ponta:** Compartilhamento direto de schemas Zod e tipos de entidades entre cliente e servidor.
- **Evolução limpa:** Se um módulo (ex: `products`) precisar virar um microserviço, seus casos de uso e repositórios já estão isolados e desacoplados.

### Negativas / Riscos Mitigados:
- **Risco de vazamento de camadas:** Desenvolvedores podem ser tentados a chamar o banco diretamente dentro de componentes React Server Components (RSC).
  - *Mitigação:* Regra de arquitetura estrita: RSC e Server Actions interagem exclusivamente através dos casos de uso (`src/modules/*/application`).

