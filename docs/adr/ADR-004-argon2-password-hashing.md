# ADR-004: Hashing de Senhas com Argon2id

## Status
Aceito

## Contexto
O sistema armazena credenciais locais de usuários (e-mail e senha). Senhas nunca devem ser salvas em texto puro. É indispensável utilizar uma função de derivação de chave (KDF) criptograficamente segura, com sal (salt) aleatório e custo computacional configurável, capaz de mitigar ataques de dicionário e força bruta acelerados por GPUs e ASICs.

## Decisão
Adotamos o **Argon2id** (variante híbrida recomendada pela OWASP e vencedora da *Password Hashing Competition*) através da biblioteca `argon2`.

## Alternativas Consideradas
1. **MD5 / SHA-256 / SHA-512 simples:**
   - *Motivo da Rejeição:* Funções de hash gerais desenhadas para velocidade, não para armazenamento de senhas. Uma GPU moderna consegue calcular bilhões de hashes SHA-256 por segundo, tornando ataques de força bruta triviais.
2. **Bcrypt:**
   - *Pontos Fortes:* Muito consagrado e seguro para ataques baseados em CPU.
   - *Motivo da Escolha do Argon2:* Bcrypt é limitado a 72 bytes de senha e sua proteção contra ataques massivos paralelos com memória dedicada (ASIC/FPGA) é inferior ao Argon2id, que foi desenhado especificamente para ser *memory-hard* (exigir consumo intensivo de RAM).
3. **PBKDF2:**
   - *Motivo da Rejeição:* Embora aprovado por padrões FIPS legados, é vulnerável a aceleração massiva por GPUs devido ao baixo consumo de memória.

## Consequências
### Positivas:
- **Resistência Estado-da-Arte:** Argon2id combina resistência a ataques de canal lateral baseados em cache (Argon2i) e resistência a ataques paralelos acelerados por hardware (Argon2d).
- **Parâmetros Ajustáveis:** Permite configurar custo de tempo (iterações), custo de memória (KB) e paralelismo de acordo com o poder do servidor.

### Negativas / Riscos Mitigados:
- **Uso de CPU/Memória:** Hashes deliberadamente lentos consomem recursos de CPU.
  - *Mitigação:* Calibrar os parâmetros de custo para gastar aproximadamente 100ms a 200ms por hash, e proteger a rota de login com rate-limiting para mitigar ataques de negação de serviço (DoS) por sobrecarga computacional.

