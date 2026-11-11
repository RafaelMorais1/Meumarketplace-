
# Diretrizes e Regras do Projeto (Marketplace MVP)

## ⚠️ DIRETRIZ INEGOCIÁVEL: PROIBIÇÃO ABSOLUTA DE BYPASS EM TESTES

> **REGRA DE OURO DO PROJETO:**
> **NUNCA, EM HIPÓTESE ALGUMA, DÊ BYPASS, SUPRIMA OU IGNORE TESTES.**
>
> 1. **Execução Obrigatória de Cada Cenário:**
>    - Todo e qualquer teste automatizado (unitário, integração, segurança e ponta a ponta) deve ser executado de ponta a ponta.
>    - Nunca pule ou considere um teste executado sem rodar a ferramenta de testes e validar a saída real.
>
> 2. **Inspeção Detalhada e Verificação dos Resultados:**
>    - Sempre analise minuciosamente os logs de saída, mensagens de erro, asserções (`expect`) e códigos de retorno de cada cenário.
>    - Mesmo que um teste apresente erros ou falhas, examine a falha em detalhes para compreender o que quebrou.
>
> 3. **Investigação e Resolução da Causa Raiz:**
>    - Se um teste falhar, a causa raiz **DEVE ser investigada e corrigida na regra de negócio ou no adaptador** com integridade técnica.
>    - É estritamente proibido comentar testes que estejam falhando para "fazer o build passar".
>    - É estritamente proibido adicionar `.skip` em cenários que falharam para ocultar defeitos.
>    - É estritamente proibido afrouxar asserções para mascarar quebras de contrato.
>    - É estritamente proibido desativar linters, suprimir erros do compilador (`@ts-ignore` ou `any` indiscriminado) ou mascarar falhas de validação.
>
> *Esta diretriz é permanente e mandatória. Sempre que for executar testes, consulte e obedeça rigorosamente a esta regra.*

---

## 🌿 DIRETRIZ MANDATÓRIA DE BRANCHES E FLUXO DE VERSÕES

> **REGRA DE OURO DE VERSIONAMENTO:**
> **NUNCA, EM HIPÓTESE ALGUMA, FAÇA COMMITS DIRETAMENTE NA RAMO PRINCIPAL (`main` OU `master`).**
>
> 1. **Criação Obrigatória de Branches Específicas:**
>    - Toda e qualquer alteração — seja correção de bug, nova funcionalidade, refatoração, documentação ou ajuste de configuração — deve nascer em uma branch isolada e específica.
>
> 2. **Padrão Semântico de Nomenclatura de Branches:**
>    - `bugfix/<descricao-curta>` ou `fix/<descricao-curta>`: Para correção de falhas, defeitos e bugs.
>    - `feat/<descricao-curta>`: Para desenvolvimento de novas funcionalidades.
>    - `refactor/<descricao-curta>`: Para reestruturações de código sem mudança de comportamento.
>    - `docs/<descricao-curta>`: Para inclusão ou atualização de documentação.
>    - `chore/<descricao-curta>`: Para manutenção de ferramentas, dependências ou scripts.
>    - `test/<descricao-curta>`: Para adição ou ajustes exclusivos em suítes de teste.
>
> 3. **Controle Estrito de Versões e Integração via Pull Request (PR):**
>    - Nenhuma alteração sobe para a branch principal sem passar por Pull Request (PR).
>    - Todo PR deve ter pipeline de testes (CI) aprovado, validação de tipos e revisão.
>    - Essa rastreabilidade garante controle total do histórico, auditoria de versões lançadas e estabilidade contínua do ambiente de produção.
>
> *Esta diretriz é permanente e mandatória para todos os desenvolvedores e agentes de IA que atuarem neste projeto.*

