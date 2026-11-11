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
