# ADR-005: Armazenamento Criptográfico de Tokens de Recuperação de Senha (SHA-256) e Proteção Anti-Enumeração

## Status
Aceito

## Contexto
A funcionalidade de recuperação de conta e redefinição de senha (RF-11 e RF-12) é um dos alvos mais frequentes de ataques em sistemas web (Account Takeover, User Enumeration e vazamento de banco de dados).

Precisamos definir:
1. Como gerar e armazenar os tokens de redefinição de senha com segurança de nível sênior.
2. Como lidar com mensagens de resposta para evitar ataques de enumeração de contas (descobrir quais e-mails têm conta no sistema).
3. O que acontece com sessões ativas quando uma senha é redefinida (ex: conta comprometida).

## Decisão
Adotamos os seguintes padrões de segurança e arquitetura alinhados às recomendações do **OWASP ASVS (Application Security Verification Standard)** e **NIST SP 800-63B**:

1. **Tokens de Alta Entropia com Hash em Repouso (SHA-256):**
   - O token gerado para o link é uma string pseudoaleatória segura de 256 bits gerada via `crypto.randomBytes(32).toString('hex')`.
   - O token puro trafega **exclusivamente** no link de e-mail enviado ao usuário (`/reset-password?token=XYZ`).
   - O banco de dados **NUNCA** armazena o token puro. Armazenamos apenas `SHA-256(token)`.
   - *Justificativa:* Se o banco de dados sofrer um dump indevido ou vazamento, o invasor não consegue derivar os tokens e sequestrar contas.

2. **Proteção Anti-Enumeração de Usuários (Silent Enumeration Defense):**
   - Na rota/ação de solicitação (`POST /api/auth/forgot-password` ou Server Action), a resposta exibida para o usuário final é sempre idêntica: *"Se houver uma conta associada a este e-mail, enviamos as instruções de recuperação."*
   - O tempo de resposta deve ser mitigado contra análise de temporização (timing attacks), executando o mesmo fluxo assíncrono.

3. **Ciclo de Vida Curto e Uso Único:**
   - Validade máxima de **30 minutos**.
   - Coluna `used_at`: uma vez consumido para trocar a senha, o token torna-se imediatamente nulo/inútil.
   - Qualquer solicitação posterior de recuperação pelo mesmo usuário invalida tokens anteriores não utilizados.

4. **Revogação Total de Sessões Ativas (Session Invalidation):**
   - Ao alterar a senha com sucesso, o caso de uso executa `sessionRepository.deleteAllByUserId(user.id)`.
   - *Justificativa:* Se a troca de senha decorre de uma invasão ou roubo de credenciais, o atacante com sessão aberta é expulso imediatamente de todos os navegadores.

5. **Desacoplamento do Serviço de E-mail (Porta/Driver):**
   - Interface `EmailService` com método `sendPasswordResetEmail(email, resetLink)`.
   - Em ambiente local e de testes: `ConsoleEmailService` / `InMemoryEmailService` (imprime o link no console do terminal para testes manuais rápidos e testes unitários sem dependência externa).
   - Em produção: driver de SMTP ou API transacional (Resend/SES).

## Consequências
### Positivas:
- **Resistência a vazamento de banco:** Um snapshot comprometido do banco não permite resetar senhas de terceiros.
- **Privacidade do usuário:** Invasores não conseguem confirmar se um e-mail é cliente através do formulário de recuperação.
- **Segurança pós-incidente:** Sessões comprometidas são purgadas após o reset da senha.

### Negativas / Complexidade Mitigada:
- Exige uma coluna `used_at` e hashing SHA-256 antes da consulta no banco (custo de CPU desprezível para SHA-256).
- Em desenvolvimento local, como não há provedor de email real configurado por padrão, o desenvolvedor consulta o link no console/terminal, o que é didático e transparente.

