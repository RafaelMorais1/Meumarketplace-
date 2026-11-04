# Aprendizado: Por que Senhas Precisam do Argon2id e Não de Hashes Comuns

## O Erro Clássico: Hashes Rápidos (MD5, SHA-256)

Funções como SHA-256 ou MD5 foram inventadas para verificar integridade de arquivos e assinaturas de mensagens em altíssima velocidade. 
- Uma placa de vídeo gamer (GPU) moderna consegue calcular **mais de 10 bilhões de hashes SHA-256 por segundo**.
- Se um hacker vazar um banco de dados com senhas em SHA-256, ele consegue quebrar senhas comuns de 8 letras em poucos minutos usando tabelas de força bruta (Rainbow Tables).

Para senhas humanas, **velocidade é um defeito, não uma virtude**. Precisamos de uma função propositalmente lenta e cara de calcular.

---

## O que é um "Salt" (Sal Criptográfico)?

Se dois usuários diferentes usarem a mesma senha "123456", seus hashes seriam idênticos se não houvesse o sal.
- O **Salt** é uma sequência aleatória de bytes gerada a cada novo cadastro.
- O hash final é calculado misturando a senha com o sal: `hash = KDF(senha + salt)`.
- Isso garante que, mesmo que 1.000 usuários tenham a mesma senha, cada um terá um hash completamente diferente no banco de dados.

---

## Por que o Argon2id é Superior ao Bcrypt?

O **Bcrypt** é excelente e protegeu a internet por décadas. No entanto, o Bcrypt consome principalmente tempo de CPU, mas quase nenhuma memória RAM.
- Atacantes construíram chips dedicados (ASICs / FPGAs) que colocam centenas de núcleos de CPU em paralelo para quebrar Bcrypt com custo elétrico baixo.

É aqui que entra o **Argon2id** (vencedor do concurso mundial *Password Hashing Competition*):
- Ele é **Memory-Hard** (intensivo em memória). Para calcular um único hash, o algoritmo é configurado para exigir megabytes de memória RAM física (ex: 64 MB).
- Como placas de vídeo e chips ASIC têm limites estritos de largura de banda e memória, tentar quebrar milhões de senhas em paralelo com Argon2id se torna financeiramente inviável para o atacante.

### O "id" no Argon2id
- **Argon2d:** Otimizado contra ataques por GPU (resistência extrema a força bruta).
- **Argon2i:** Otimizado contra ataques de canal lateral baseados em cache de memória.
- **Argon2id:** A variante híbrida recomendada pela OWASP, que combina a segurança contra canais laterais no início e a resistência a hardware dedicado nas rodadas seguintes.

