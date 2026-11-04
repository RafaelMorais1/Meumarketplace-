# Aprendizado: Monólito Modular e Inversão de Dependência

## O que é um Monólito Modular?
Historicamente, as aplicações se dividem entre dois extremos:
1. **Monólito Espaguete:** Todo o código fica em um único projeto, mas sem barreiras. Componentes de interface chamam o banco de dados diretamente, controllers contêm milhares de linhas com regras de negócio misturadas, e alterar uma parte quebra outra sem aviso.
2. **Microserviços Prematuros:** A aplicação é quebrada em dezenas de pequenos serviços independentes desde o dia 1. O resultado costuma ser catastrófico para equipes no início: complexidade de rede, problemas com transações distribuídas, lentidão no desenvolvimento e alto custo de infraestrutura.

O **Monólito Modular** une o melhor dos dois mundos:
- Todo o código reside em um único repositório e executa em um único processo / container (fácil de rodar, fácil de debugar, deploy único).
- No entanto, o código é **estritamente organizado em módulos isolados por domínio** (`auth`, `users`, `products`), cada um com suas próprias fronteiras.

---

## As 3 Camadas de um Módulo

Em cada módulo do nosso projeto (`src/modules/*`), seguimos a seguinte divisão:

```text
src/modules/products/
├── domain/            # 1. O CORAÇÃO DO SISTEMA
├── application/       # 2. OS CASOS DE USO (ORQUESTRADORES)
└── infrastructure/    # 3. OS DETALHES DE TECNOLOGIA
```

### 1. Camada de Domínio (`domain/`)
- Contém os tipos e regras fundamentais que independem de qualquer tecnologia.
- Define as **Interfaces (Portas)**: por exemplo, `IProductRepository`. Ela diz *o que* precisa ser feito (`findById`, `save`, `delete`), mas não diz *como* (se usa Postgres, MySQL ou memória).

### 2. Camada de Aplicação (`application/`)
- Contém os **Casos de Uso** (ou Serviços de Aplicação): por exemplo, `CreateProductUseCase`.
- Cada caso de uso representa uma ação concreta que um usuário pode realizar no sistema.
- **Regra de Ouro:** O caso de uso nunca importa o Drizzle diretamente ou faz queries SQL. Ele recebe a interface `IProductRepository` via construtor (Injeção de Dependência).

### 3. Camada de Infraestrutura (`infrastructure/`)
- Contém os **Adaptadores**: a implementação concreta que se conecta ao mundo exterior.
- Aqui fica o `DrizzleProductRepository`, que sabe como escrever SQL, rodar queries no PostgreSQL e converter linhas de tabela em objetos de domínio.

---

## Por que a Inversão de Dependência (DIP) é Revolucionária para Testes?

Veja como instanciamos o caso de uso em produção:
```typescript
// Em produção:
const repository = new DrizzleProductRepository(db);
const createProduct = new CreateProductUseCase(repository);
```

E veja como instanciamos o MESMO caso de uso em um teste unitário:
```typescript
// No teste unitário:
const fakeRepository = new InMemoryProductRepository(); // Salva em um Array[]
const createProduct = new CreateProductUseCase(fakeRepository);

// O teste roda em 2 milissegundos, sem precisar subir banco de dados ou Docker!
```

Graças a esse desacoplamento, podemos testar 100% das regras de negócio (preço negativo, validação de papel de vendedor, título curto) de forma quase instantânea.

