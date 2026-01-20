# Arquitetura do Sistema de Gerenciamento de Almoxarifado

## Visão Geral

Este documento descreve a arquitetura do Sistema de Gerenciamento de Almoxarifado, detalhando os padrões de design utilizados, estrutura de camadas, fluxo de dados e decisões arquiteturais.

## Índice

1. [Arquitetura em Camadas](#arquitetura-em-camadas)
2. [Padrões de Design](#padrões-de-design)
3. [Estrutura de Diretórios](#estrutura-de-diretórios)
4. [Fluxo de Dados](#fluxo-de-dados)
5. [Modelos de Dados](#modelos-de-dados)
6. [Decisões Arquiteturais](#decisões-arquiteturais)

## Arquitetura em Camadas

O sistema segue uma arquitetura em camadas (Layered Architecture) com separação clara de responsabilidades:

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│         (Routes, Controllers)           │
├─────────────────────────────────────────┤
│          Business Logic Layer           │
│             (Services)                  │
├─────────────────────────────────────────┤
│          Data Access Layer              │
│      (TypeORM Repositories)             │
├─────────────────────────────────────────┤
│            Database Layer               │
│            (PostgreSQL)                 │
└─────────────────────────────────────────┘
```

### 1. Presentation Layer (Camada de Apresentação)

**Responsabilidades:**
- Receber requisições HTTP
- Validar dados de entrada
- Delegar lógica de negócio para a camada de serviço
- Formatar respostas HTTP

**Componentes:**
- **Routes** (`src/routes/`): Define os endpoints da API e associa às funções dos controllers
- **Controllers** (`src/controllers/`): Manipula requisições e respostas HTTP
- **Middlewares** (`src/middlewares/`): Intercepta requisições para validação e transformação
- **DTOs** (`src/dtos/`): Schemas de validação com Joi

### 2. Business Logic Layer (Camada de Lógica de Negócio)

**Responsabilidades:**
- Implementar regras de negócio
- Orquestrar operações complexas
- Validar lógica de domínio
- Gerenciar transações

**Componentes:**
- **Services** (`src/services/`): Contém toda a lógica de negócio da aplicação

### 3. Data Access Layer (Camada de Acesso a Dados)

**Responsabilidades:**
- Abstrair acesso ao banco de dados
- Executar queries
- Gerenciar relacionamentos entre entidades

**Componentes:**
- **TypeORM Repositories**: Fornecidos automaticamente pelo TypeORM
- **Models** (`src/models/`): Entidades que representam tabelas do banco

### 4. Database Layer (Camada de Banco de Dados)

**Responsabilidades:**
- Armazenar dados persistentes
- Garantir integridade referencial
- Executar queries SQL

**Componentes:**
- **PostgreSQL**: Sistema de gerenciamento de banco de dados

## Padrões de Design

### 1. Dependency Injection (Injeção de Dependência)

Os controllers recebem services como dependências no construtor, facilitando testes e manutenção:

```typescript
export class ProductController {
  constructor(private productService: ProductService) {}
  
  async list(req: Request, res: Response): Promise<Response> {
    const products = await this.productService.findAll();
    return res.json(products);
  }
}
```

### 2. Repository Pattern

TypeORM implementa o padrão Repository para abstrair o acesso a dados:

```typescript
const productRepository = AppDataSource.getRepository(Product);
const productService = new ProductService(productRepository);
```

### 3. DTO (Data Transfer Object)

DTOs são usados para validar e transferir dados entre camadas:

```typescript
export interface CreateProductDTO {
  name: string;
  category: string;
  codigo?: string;
  // ...
}
```

### 4. Middleware Pattern

Middlewares são usados para interceptar requisições e aplicar validações:

```typescript
router.post('/', 
  validateRequest(createProductSchema, 'body'), 
  (req, res) => productController.create(req, res)
);
```

### 5. Factory Pattern

A criação de instâncias de services e controllers segue um padrão de factory:

```typescript
const productRepository = AppDataSource.getRepository(Product);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);
```

## Estrutura de Diretórios

```
src/
├── config/              # Configurações da aplicação
│   ├── database.ts      # Configuração do TypeORM
│   └── env.ts           # Validação de variáveis de ambiente
│
├── controllers/         # Controllers (Camada de Apresentação)
│   ├── ProductController.ts
│   └── MovimentationController.ts
│
├── dtos/               # Schemas de validação (Joi)
│   ├── product.dto.ts
│   ├── productQuery.dto.ts
│   └── movimentation.dto.ts
│
├── middlewares/        # Middlewares customizados
│   └── validate.middleware.ts
│
├── migrations/         # Migrations do banco de dados
│   └── [timestamp]-[nome].ts
│
├── models/            # Entidades do TypeORM
│   ├── Product.ts
│   └── Movimentation.ts
│
├── routes/            # Definição de rotas
│   ├── productRoutes.ts
│   └── movimentationRoutes.ts
│
├── services/          # Lógica de negócio
│   ├── ProductService.ts
│   └── MovimentationService.ts
│
├── types/             # Interfaces TypeScript
│   ├── ProductDTO.ts
│   └── MovimentationDTO.ts
│
└── index.ts           # Ponto de entrada da aplicação
```

## Fluxo de Dados

### Fluxo de Criação de Produto

```
Cliente HTTP
    │
    │ POST /api/products
    │ Body: { name, category, ... }
    ▼
┌───────────────────┐
│   productRoutes   │
│  (Route Handler)  │
└─────────┬─────────┘
          │
          │ validateRequest middleware
          ▼
┌───────────────────┐
│ ProductController │
│    create()       │
└─────────┬─────────┘
          │
          │ Chama service
          ▼
┌───────────────────┐
│  ProductService   │
│    create()       │
│ • Valida regras   │
│ • Verifica código │
│ • Cria produto    │
└─────────┬─────────┘
          │
          │ Usa repository
          ▼
┌───────────────────┐
│ TypeORM Repository│
│  (Data Access)    │
└─────────┬─────────┘
          │
          │ SQL INSERT
          ▼
┌───────────────────┐
│    PostgreSQL     │
└───────────────────┘
```

### Fluxo de Criação de Movimentação

```
Cliente HTTP
    │
    │ POST /api/movimentations
    │ Body: { type, product_id, quantity, ... }
    ▼
┌──────────────────────┐
│ movimentationRoutes  │
│   (Route Handler)    │
└──────────┬───────────┘
           │
           │ validateRequest middleware
           ▼
┌──────────────────────┐
│MovimentationController│
│      create()        │
└──────────┬───────────┘
           │
           │ Chama service
           ▼
┌──────────────────────┐
│MovimentationService  │
│      create()        │
│ • Valida tipo        │
│ • Busca produto      │
│ • Calcula quantidade │
│ • Cria movimentação  │
│ • Atualiza produto   │
└──────────┬───────────┘
           │
           │ Usa repositories
           ▼
┌──────────────────────┐
│TypeORM Repositories  │
│ • Movimentation      │
│ • Product            │
└──────────┬───────────┘
           │
           │ SQL INSERT + UPDATE
           ▼
┌──────────────────────┐
│     PostgreSQL       │
└──────────────────────┘
```

## Modelos de Dados

### Diagrama de Entidade-Relacionamento

```
┌─────────────────────────────────┐
│          PRODUTOS               │
├─────────────────────────────────┤
│ id (PK)                UUID     │
│ name                   VARCHAR  │
│ category               VARCHAR  │
│ codigo                 VARCHAR  │
│ serial_number          VARCHAR  │
│ minimal_quantity       INTEGER  │
│ quantity               INTEGER  │
│ value                  DECIMAL  │
│ local_storage          VARCHAR  │
│ created_at             TIMESTAMP│
│ updated_at             TIMESTAMP│
└───────────┬─────────────────────┘
            │
            │ 1:N
            │
┌───────────▼─────────────────────┐
│       MOVIMENTACAO              │
├─────────────────────────────────┤
│ id (PK)                UUID     │
│ type                   VARCHAR  │
│ product_id (FK)        UUID     │
│ movimented_by          BIGINT   │
│ quantity               INTEGER  │
│ product_old_quantity   INTEGER  │
│ product_new_quantity   INTEGER  │
│ local_storage          VARCHAR  │
│ product_old_local_storage VARCHAR│
│ appointment            TEXT     │
│ created_at             TIMESTAMP│
│ updated_at             TIMESTAMP│
└─────────────────────────────────┘
```

### Relacionamentos

- **Product → Movimentation**: Um produto pode ter várias movimentações (1:N)
- A relação é gerenciada pela chave estrangeira `product_id` na tabela `movimentacao`

### Entidade Product

```typescript
@Entity('produtos', { schema: 'almoxarifado' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  codigo?: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @OneToMany(() => Movimentation, (movimentation) => movimentation.product)
  movimentations: Movimentation[];
}
```

### Entidade Movimentation

```typescript
@Entity('movimentacao', { schema: 'almoxarifado' })
export class Movimentation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'inbound' | 'outbound' | 'transfer' | 'adjustment'

  @Column({ type: 'uuid' })
  product_id: string;

  @ManyToOne(() => Product, (product) => product.movimentations)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;
}
```

## Decisões Arquiteturais

### 1. TypeScript ao invés de JavaScript

**Razão:**
- Type safety previne muitos erros em tempo de compilação
- Melhor suporte de IDEs com autocomplete
- Facilita refatoração e manutenção
- Documentação implícita através dos tipos

### 2. TypeORM como ORM

**Razão:**
- Excelente integração com TypeScript
- Suporte a migrations versionadas
- Active Record e Data Mapper patterns
- Suporte robusto para relacionamentos
- Query Builder flexível

### 3. Joi para Validação

**Razão:**
- Schema-based validation
- Mensagens de erro customizáveis
- Validação declarativa e legível
- Fácil integração com Express

### 4. PostgreSQL como Banco de Dados

**Razão:**
- Banco relacional robusto e confiável
- Suporte a JSON para dados semi-estruturados
- Transações ACID
- Excelente performance
- Open source

### 5. Express como Framework Web

**Razão:**
- Framework minimalista e flexível
- Grande ecossistema de middlewares
- Amplamente utilizado e bem documentado
- Performance adequada para a aplicação

### 6. Arquitetura em Camadas

**Razão:**
- Separação clara de responsabilidades
- Facilita testes unitários
- Código mais manutenível
- Baixo acoplamento entre camadas
- Alta coesão dentro de cada camada

### 7. UUID como Identificadores

**Razão:**
- Identificadores únicos globalmente
- Previne ataques de enumeração
- Facilita mesclagem de dados de diferentes fontes
- Não expõe informações sobre quantidade de registros

### 8. Soft Delete não implementado

**Razão:**
- Simplicidade do sistema atual
- Requisitos não incluem auditoria completa
- Pode ser adicionado futuramente se necessário

### 9. Validação em Duas Camadas

**Validação em DTO (Joi):**
- Valida formato e tipos de dados
- Valida campos obrigatórios
- Sanitiza entrada

**Validação em Service:**
- Valida regras de negócio
- Verifica duplicações
- Valida relações entre entidades

### 10. Controle de Estoque Automático

**Razão:**
- Previne inconsistências
- Mantém histórico completo
- Reduz erros humanos
- Facilita auditoria

## Extensibilidade

### Adicionando um Novo Recurso

Para adicionar um novo recurso (ex: Fornecedores), siga estes passos:

1. **Criar Model** (`src/models/Supplier.ts`)
2. **Criar DTOs** (`src/types/SupplierDTO.ts`)
3. **Criar Schemas de Validação** (`src/dtos/supplier.dto.ts`)
4. **Criar Service** (`src/services/SupplierService.ts`)
5. **Criar Controller** (`src/controllers/SupplierController.ts`)
6. **Criar Routes** (`src/routes/supplierRoutes.ts`)
7. **Registrar Routes** em `src/index.ts`
8. **Gerar Migration** para o banco de dados

### Integrações Futuras

A arquitetura permite fácil integração com:

- **Sistema de Autenticação**: Adicionar middleware de autenticação
- **Sistema de Permissões**: Implementar RBAC (Role-Based Access Control)
- **Logs Estruturados**: Integrar Winston ou Pino
- **Cache**: Adicionar Redis para cache de consultas
- **Message Queue**: Integrar RabbitMQ ou AWS SQS para tarefas assíncronas
- **File Upload**: Adicionar suporte para upload de imagens de produtos
- **Notificações**: Implementar webhooks ou WebSockets para notificações em tempo real

## Considerações de Performance

### Otimizações Implementadas

1. **Índices no Banco de Dados**: Código único em produtos
2. **Query Ordenadas**: Uso de `orderBy` nas consultas
3. **Eager vs Lazy Loading**: Uso estratégico de `relations` nas queries

### Otimizações Futuras

1. **Paginação**: Implementar limit/offset para listagens grandes
2. **Cache**: Redis para estatísticas do dashboard
3. **Connection Pooling**: Configurar pool de conexões do TypeORM
4. **Query Optimization**: Analisar e otimizar queries complexas
5. **Compressão**: Habilitar gzip compression no Express

## Segurança

### Práticas Implementadas

1. **Validação de Entrada**: Joi valida todos os dados de entrada
2. **Prepared Statements**: TypeORM usa prepared statements (prevenção de SQL Injection)
3. **Variáveis de Ambiente**: Credenciais não hardcoded no código

### Melhorias de Segurança Futuras

1. **Autenticação JWT**: Implementar JWT para autenticação
2. **Rate Limiting**: Limitar requisições por IP
3. **CORS**: Configurar CORS adequadamente
4. **Helmet**: Adicionar headers de segurança
5. **Input Sanitization**: Sanitizar dados além da validação
6. **HTTPS**: Enforçar HTTPS em produção

## Testes

### Estrutura de Testes Recomendada

```
tests/
├── unit/
│   ├── services/
│   │   ├── ProductService.test.ts
│   │   └── MovimentationService.test.ts
│   └── controllers/
│       ├── ProductController.test.ts
│       └── MovimentationController.test.ts
├── integration/
│   ├── products.test.ts
│   └── movimentations.test.ts
└── e2e/
    └── api.test.ts
```

### Ferramentas Recomendadas

- **Jest**: Framework de testes
- **Supertest**: Testes de API HTTP
- **ts-jest**: Suporte TypeScript para Jest
- **@types/jest**: Tipos TypeScript para Jest

## Documentação Adicional

- [README.md](README.md) - Guia de início rápido e documentação da API
- [package.json](package.json) - Dependências e scripts
- [tsconfig.json](tsconfig.json) - Configuração do TypeScript

## Contribuindo

Ao contribuir com a arquitetura:

1. Mantenha a separação de camadas
2. Siga os padrões de design estabelecidos
3. Adicione validação em ambas as camadas (DTO e Service)
4. Documente decisões arquiteturais significativas
5. Atualize este documento quando a arquitetura mudar

## Conclusão

Esta arquitetura foi projetada para ser:

- **Manutenível**: Código organizado e bem estruturado
- **Testável**: Baixo acoplamento facilita testes
- **Escalável**: Fácil adicionar novos recursos
- **Segura**: Validações e boas práticas de segurança
- **Performática**: Otimizações onde necessário

A arquitetura em camadas com separação clara de responsabilidades permite que o sistema evolua de forma sustentável, mantendo a qualidade do código e facilitando a manutenção a longo prazo.
