# Sistema de Gerenciamento de Almoxarifado

Sistema completo para controle de estoque de almoxarifado, desenvolvido com Node.js, TypeScript, Express e TypeORM. Permite o gerenciamento de produtos e suas movimentações (entradas, saídas, transferências e ajustes), mantendo histórico detalhado de todas as operações realizadas.

## Funcionalidades

- Cadastro, consulta, atualização e exclusão de produtos
- Registro de movimentações de estoque (entrada, saída, transferência e ajuste)
- Controle automático de quantidade em estoque
- Histórico completo de movimentações por produto
- Validação robusta de dados com Joi
- Rastreamento de localização de produtos no almoxarifado

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express.js
- TypeORM
- PostgreSQL
- Joi (validação de dados)

## Pré-requisitos

- Node.js (versão 14 ou superior)
- PostgreSQL
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/oondels/gerenciamento_almoxarifado.git
cd gerenciamento_almoxarifado
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto:
```env
NODE_ENV=development
PORT=9137

# Configurações do banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=almoxarifado

# Configurações de notificação (se aplicável)
NOTIFICATION_API=url_da_api_de_notificacao
NOTIFICATION_API_KEY=sua_chave_api
FRONTEND_URL=url_do_frontend
```

4. Execute as migrações do banco de dados:
```bash
npm run migration:run
```

5. Inicie o servidor em modo de desenvolvimento:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:9137`

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo de desenvolvimento com hot-reload
- `npm run build` - Compila o projeto TypeScript para JavaScript
- `npm run migration:generate` - Gera uma nova migration com base nas alterações das entidades
- `npm run migration:run` - Executa as migrations pendentes
- `npm run migration:revert` - Reverte a última migration executada

## Estrutura do Projeto

```
src/
├── config/          # Configurações (banco de dados, variáveis de ambiente)
├── controllers/     # Controladores das rotas
├── dtos/           # Schemas de validação com Joi
├── middlewares/    # Middlewares (validação)
├── migrations/     # Migrações do banco de dados
├── models/         # Entidades do TypeORM
├── routes/         # Definição das rotas
├── services/       # Lógica de negócio
├── types/          # Interfaces TypeScript
└── index.ts        # Arquivo principal da aplicação
```

Para uma documentação detalhada sobre a arquitetura do projeto, padrões de design utilizados, fluxo de dados e decisões arquiteturais, consulte [ARCHITECTURE.md](ARCHITECTURE.md).

## Documentação da API

### Postman Collection

Para facilitar o teste e uso da API, disponibilizamos uma collection completa do Postman com todos os endpoints documentados.

**Como usar:**

1. Abra o Postman
2. Clique em "Import"
3. Selecione o arquivo `postman_collection.json` na raiz do projeto
4. A collection será importada com todas as requisições organizadas

**Variáveis de ambiente:**
- `base_url`: URL base da API (padrão: `http://localhost:9137`)
- `product_id`: UUID de um produto para testes
- `movimentation_id`: UUID de uma movimentação para testes

A collection inclui:
- ✅ Health Check
- ✅ Todos os endpoints de Produtos (CRUD + Dashboard)
- ✅ Todos os endpoints de Movimentações (CRUD + Dashboard + Tipos)
- ✅ Exemplos de requisições para cada tipo de movimentação
- ✅ Descrições detalhadas de cada endpoint
- ✅ Query parameters documentados

### Produtos

#### GET /api/products
Lista todos os produtos cadastrados.

**Query Parameters (todos opcionais):**
- `category` (string) - Filtra produtos por categoria
- `stock_status` (string) - Filtra por status do estoque: `in_stock`, `out_stock`, `low_stock`
- `codigo` (string) - Filtra por código do produto
- `serial_number` (string) - Filtra por número de série
- `local_storage` (string) - Filtra por localização de armazenamento

**Exemplos de uso:**
```bash
# Listar todos os produtos
GET /api/products

# Filtrar por categoria
GET /api/products?category=Ferragens

# Filtrar produtos com estoque baixo
GET /api/products?stock_status=low_stock

# Combinar múltiplos filtros
GET /api/products?category=Ferragens&stock_status=in_stock
```

**Resposta de sucesso (200):**
```json
[
  {
    "id": "uuid",
    "name": "Nome do Produto",
    "category": "Categoria",
    "codigo": "COD123",
    "serial_number": "SN123456",
    "minimal_quantity": 10,
    "quantity": 50,
    "value": 29.99,
    "local_storage": "Prateleira A1",
    "created_at": "2026-01-16T10:00:00.000Z",
    "updated_at": "2026-01-16T10:00:00.000Z"
  }
]
```

#### GET /api/products/:id
Busca um produto específico por ID.

**Parâmetros:**
- `id` (UUID) - ID do produto

**Resposta de sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Nome do Produto",
  "category": "Categoria",
  "codigo": "COD123",
  "serial_number": "SN123456",
  "minimal_quantity": 10,
  "quantity": 50,
  "value": 29.99,
  "local_storage": "Prateleira A1",
  "created_at": "2026-01-16T10:00:00.000Z",
  "updated_at": "2026-01-16T10:00:00.000Z"
}
```

#### POST /api/products
Cria um novo produto.

**Corpo da requisição:**
```json
{
  "name": "Nome do Produto",
  "category": "Categoria",
  "codigo": "COD123",
  "serial_number": "SN123456",
  "minimal_quantity": 10,
  "quantity": 50,
  "value": 29.99,
  "local_storage": "Prateleira A1"
}
```

**Campos obrigatórios:**
- `name` (string, máx 255 caracteres) - Nome do produto
- `category` (string, máx 100 caracteres) - Categoria do produto

**Campos opcionais:**
- `codigo` (string, máx 50 caracteres) - Código único do produto
- `serial_number` (string, máx 100 caracteres) - Número de série
- `minimal_quantity` (number, inteiro >= 0) - Quantidade mínima em estoque (padrão: 0)
- `quantity` (number, inteiro >= 0) - Quantidade atual em estoque (padrão: 0)
- `value` (number, decimal) - Valor unitário do produto
- `local_storage` (string, máx 100 caracteres) - Localização no almoxarifado

**Resposta de sucesso (201):**
```json
{
  "id": "uuid",
  "name": "Nome do Produto",
  "category": "Categoria",
  "codigo": "COD123",
  "serial_number": "SN123456",
  "minimal_quantity": 10,
  "quantity": 50,
  "value": 29.99,
  "local_storage": "Prateleira A1",
  "created_at": "2026-01-16T10:00:00.000Z",
  "updated_at": "2026-01-16T10:00:00.000Z"
}
```

#### PATCH /api/products/:id
Atualiza um produto existente.

**Parâmetros:**
- `id` (UUID) - ID do produto

**Corpo da requisição:**
```json
{
  "name": "Novo Nome",
  "quantity": 75,
  "local_storage": "Prateleira B2"
}
```

**Campos (todos opcionais, mas pelo menos um deve ser fornecido):**
- `name` (string, máx 255 caracteres)
- `category` (string, máx 100 caracteres)
- `codigo` (string, máx 50 caracteres)
- `serial_number` (string, máx 100 caracteres)
- `minimal_quantity` (number, inteiro >= 0)
- `quantity` (number, inteiro >= 0)
- `value` (number, decimal)
- `local_storage` (string, máx 100 caracteres)

**Resposta de sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Novo Nome",
  "category": "Categoria",
  "codigo": "COD123",
  "serial_number": "SN123456",
  "minimal_quantity": 10,
  "quantity": 75,
  "value": 29.99,
  "local_storage": "Prateleira B2",
  "created_at": "2026-01-16T10:00:00.000Z",
  "updated_at": "2026-01-16T10:15:00.000Z"
}
```

#### GET /api/products/stats/dashboard
Retorna estatísticas e métricas agregadas do dashboard de produtos com suporte a filtros.

**Query Parameters (todos opcionais):**
- `category` (string) - Filtra produtos por categoria
- `stock_status` (string) - Filtra por status do estoque: `in_stock`, `out_stock`, `low_stock`
- `codigo` (string) - Filtra por código do produto
- `serial_number` (string) - Filtra por número de série
- `local_storage` (string) - Filtra por localização
- `year` (number) - Filtra produtos criados em um ano específico (>= 1900)
- `month` (number) - Filtra produtos criados em um mês específico (1-12)
- `start_date` (string ISO 8601) - Data de início do período (formato: YYYY-MM-DD)
- `end_date` (string ISO 8601) - Data de fim do período (formato: YYYY-MM-DD)

**Exemplos de uso:**
```bash
# Dashboard geral sem filtros
GET /api/products/stats/dashboard

# Filtrar por ano específico
GET /api/products/stats/dashboard?year=2026

# Filtrar por mês e ano
GET /api/products/stats/dashboard?year=2026&month=1

# Filtrar por período específico
GET /api/products/stats/dashboard?start_date=2026-01-01&end_date=2026-12-31

# Combinar filtros de data com filtros de produto
GET /api/products/stats/dashboard?category=Ferragens&stock_status=low_stock&year=2026

# Filtrar apenas a partir de uma data
GET /api/products/stats/dashboard?start_date=2026-06-01

# Filtrar até uma data específica
GET /api/products/stats/dashboard?end_date=2026-12-31
```

**Validações:**
- O mês deve estar entre 1 e 12
- O ano deve ser >= 1900
- As datas devem estar em formato válido
- A data de início deve ser anterior à data de fim quando ambas são fornecidas

**Resposta de sucesso (200):**
```json
{
  "success": true,
  "data": {
    "totalMaterials": 150,
    "totalQuantity": 5430,
    "totalStockValue": 125430.50,
    "lowStockProducts": 12,
    "outOfStockProducts": 5,
    "statsByCategory": [
      {
        "category": "Ferragens",
        "totalMaterials": 45,
        "totalQuantity": 1250,
        "totalValue": 25430.50
      },
      {
        "category": "Eletrônicos",
        "totalMaterials": 30,
        "totalQuantity": 800,
        "totalValue": 85000.00
      }
    ],
    "statsByLocation": [
      {
        "location": "Prateleira A1",
        "totalMaterials": 25,
        "totalQuantity": 600,
        "totalValue": 15000.00
      },
      {
        "location": "Prateleira B2",
        "totalMaterials": 30,
        "totalQuantity": 850,
        "totalValue": 22500.00
      },
      {
        "location": "Sem localização",
        "totalMaterials": 10,
        "totalQuantity": 150,
        "totalValue": 3500.00
      }
    ]
  },
  "filters": {
    "year": 2026,
    "category": "Ferragens"
  }
}
```

**Descrição dos campos da resposta:**
- `totalMaterials`: Total de produtos cadastrados (contagem de registros)
- `totalQuantity`: Soma de todas as quantidades em estoque
- `totalStockValue`: Valor total do estoque (quantidade × valor unitário)
- `lowStockProducts`: Produtos com estoque abaixo da quantidade mínima
- `outOfStockProducts`: Produtos com estoque zerado
- `statsByCategory`: Estatísticas agrupadas por categoria
- `statsByLocation`: Estatísticas agrupadas por localização

**Respostas de erro (400):**
```json
{
  "success": false,
  "message": "O mês deve estar entre 1 e 12"
}
```

```json
{
  "success": false,
  "message": "Ano inválido"
}
```

```json
{
  "success": false,
  "message": "Data de início inválida"
}
```

```json
{
  "success": false,
  "message": "Data de fim inválida"
}
```

```json
{
  "success": false,
  "message": "A data de início deve ser anterior à data de fim"
}
```

#### DELETE /api/products/:id
Remove um produto do sistema.

**Parâmetros:**
- `id` (UUID) - ID do produto

**Resposta de sucesso (200):**
```json
{
  "message": "Produto deletado com sucesso"
}
```

### Movimentações

#### GET /api/movimentations
Lista todas as movimentações registradas.

**Resposta de sucesso (200):**
```json
[
  {
    "id": "uuid",
    "type": "inbound",
    "product_id": "uuid",
    "movimented_by": 12345,
    "quantity": 20,
    "product_old_quantity": 50,
    "product_new_quantity": 70,
    "local_storage": "Prateleira A1",
    "product_old_local_storage": "Prateleira A1",
    "appointment": "Compra fornecedor XYZ",
    "created_at": "2026-01-16T10:00:00.000Z",
    "updated_at": "2026-01-16T10:00:00.000Z"
  }
]
```

#### GET /api/movimentations/:id
Busca uma movimentação específica por ID.

**Parâmetros:**
- `id` (UUID) - ID da movimentação

**Resposta de sucesso (200):**
```json
{
  "id": "uuid",
  "type": "inbound",
  "product_id": "uuid",
  "movimented_by": 12345,
  "quantity": 20,
  "product_old_quantity": 50,
  "product_new_quantity": 70,
  "local_storage": "Prateleira A1",
  "product_old_local_storage": "Prateleira A1",
  "appointment": "Compra fornecedor XYZ",
  "created_at": "2026-01-16T10:00:00.000Z",
  "updated_at": "2026-01-16T10:00:00.000Z"
}
```

#### GET /api/movimentations/product/:productId
Lista todas as movimentações de um produto específico.

**Parâmetros:**
- `productId` (UUID) - ID do produto

**Resposta de sucesso (200):**
```json
[
  {
    "id": "uuid",
    "type": "inbound",
    "product_id": "uuid",
    "movimented_by": 12345,
    "quantity": 20,
    "product_old_quantity": 50,
    "product_new_quantity": 70,
    "local_storage": "Prateleira A1",
    "product_old_local_storage": "Prateleira A1",
    "appointment": "Compra fornecedor XYZ",
    "created_at": "2026-01-16T10:00:00.000Z",
    "updated_at": "2026-01-16T10:00:00.000Z"
  }
]
```

#### GET /api/movimentations/dashboard
Retorna estatísticas e métricas do dashboard de movimentações com suporte a filtros de data.

**Query Parameters (todos opcionais):**
- `limit` (number) - Limita a quantidade de movimentações recentes retornadas (padrão: 10)
- `year` (number) - Filtra movimentações por ano (>= 1900)
- `month` (number) - Filtra movimentações por mês (1-12)
- `start_date` (string ISO 8601) - Data de início do período (formato: YYYY-MM-DD)
- `end_date` (string ISO 8601) - Data de fim do período (formato: YYYY-MM-DD)

**Exemplos de uso:**

```bash
# Dashboard geral sem filtros
GET /api/movimentations/dashboard

# Filtrar por ano específico
GET /api/movimentations/dashboard?year=2025

# Filtrar por mês e ano
GET /api/movimentations/dashboard?year=2025&month=12

# Filtrar por período específico
GET /api/movimentations/dashboard?start_date=2025-01-01&end_date=2025-12-31

# Combinar filtro de data com limite de resultados
GET /api/movimentations/dashboard?year=2025&month=1&limit=20

# Filtrar apenas a partir de uma data
GET /api/movimentations/dashboard?start_date=2025-06-01

# Filtrar até uma data específica
GET /api/movimentations/dashboard?end_date=2025-12-31
```

**Validações:**
- O mês deve estar entre 1 e 12
- O ano deve ser >= 1900
- As datas devem estar em formato válido
- A data de início deve ser anterior à data de fim quando ambas são fornecidas
- O limite deve ser um número positivo

**Resposta de sucesso (200):**
```json
{
  "success": true,
  "message": "Estatísticas do dashboard retornadas com sucesso",
  "data": {
    "totalMovimentations": 150,
    "movimentationsByType": {
      "inbound": 60,
      "outbound": 50,
      "adjustment": 20,
      "transfer": 20
    },
    "statsByType": [
      {
        "type": "inbound",
        "count": 60,
        "totalQuantity": 1200
      },
      {
        "type": "outbound",
        "count": 50,
        "totalQuantity": 850
      },
      {
        "type": "adjustment",
        "count": 20,
        "totalQuantity": 100
      },
      {
        "type": "transfer",
        "count": 20,
        "totalQuantity": 300
      }
    ],
    "recentMovimentations": [
      {
        "id": "uuid",
        "type": "inbound",
        "product_id": "uuid",
        "movimented_by": 12345,
        "quantity": 20,
        "product_old_quantity": 50,
        "product_new_quantity": 70,
        "local_storage": "Prateleira A1",
        "product_old_local_storage": "Prateleira A1",
        "appointment": "Compra fornecedor XYZ",
        "created_at": "2025-12-16T10:00:00.000Z",
        "updated_at": "2025-12-16T10:00:00.000Z",
        "product": {
          "id": "uuid",
          "name": "Parafuso M8",
          "category": "Ferragens"
        }
      }
    ]
  },
  "filters": {
    "year": 2025,
    "month": 12
  }
}
```

**Respostas de erro (400):**
```json
{
  "success": false,
  "message": "O mês deve estar entre 1 e 12"
}
```

```json
{
  "success": false,
  "message": "Ano inválido"
}
```

```json
{
  "success": false,
  "message": "Data de início inválida"
}
```

```json
{
  "success": false,
  "message": "Data de fim inválida"
}
```

```json
{
  "success": false,
  "message": "A data de início deve ser anterior à data de fim"
}
```

```json
{
  "success": false,
  "message": "O limite deve ser um número positivo"
}
```

#### POST /api/movimentations
Registra uma nova movimentação de produto.

**Corpo da requisição:**
```json
{
  "type": "inbound",
  "productId": "uuid",
  "responsibleUserId": 12345,
  "quantity": 20,
  "newLocation": "Prateleira B3",
  "notes": "Recebimento de compra"
}
```

**Campos obrigatórios:**
- `type` (string) - Tipo da movimentação. Valores permitidos:
  - `inbound` - Entrada de produtos
  - `outbound` - Saída de produtos
  - `transfer` - Transferência de localização
  - `adjustment` - Ajuste de estoque
- `productId` (UUID) - ID do produto
- `responsibleUserId` (number, inteiro positivo) - ID do usuário responsável pela movimentação
- `quantity` (number, inteiro positivo) - Quantidade movimentada

**Campos opcionais:**
- `newLocation` (string, máx 255 caracteres) - Nova localização do produto
- `notes` (string) - Observações sobre a movimentação

**Observações:**
- Para movimentações do tipo `outbound`, o sistema valida se há quantidade suficiente em estoque
- O sistema atualiza automaticamente a quantidade do produto após a movimentação
- Os campos `product_old_quantity`, `product_new_quantity` e `product_old_local_storage` são calculados automaticamente

**Resposta de sucesso (201):**
```json
{
  "id": "uuid",
  "type": "inbound",
  "product_id": "uuid",
  "movimented_by": 12345,
  "quantity": 20,
  "product_old_quantity": 50,
  "product_new_quantity": 70,
  "local_storage": "Prateleira B3",
  "product_old_local_storage": "Prateleira A1",
  "appointment": "Recebimento de compra",
  "created_at": "2026-01-16T10:00:00.000Z",
  "updated_at": "2026-01-16T10:00:00.000Z"
}
```

## Deployment para Produção

Esta seção descreve como preparar e fazer o deploy da aplicação em ambiente de produção.

### Pré-requisitos de Produção

- Servidor com Node.js 14+ instalado
- PostgreSQL 12+ em execução
- PM2 ou similar para gerenciamento de processos
- Nginx (opcional, para reverse proxy)
- Certificado SSL (recomendado)

### Preparação para Deploy

#### 1. Configuração do Ambiente de Produção

Crie um arquivo `.env.prod` na raiz do projeto com as configurações de produção:

```env
NODE_ENV=production
PORT=9137

# Database - Use credenciais seguras
DB_HOST=seu-servidor-postgres.com
DB_PORT=5432
DB_USER=usuario_producao
DB_PASSWORD=senha_forte_e_segura
DB_NAME=almoxarifado_prod

# APIs externas
NOTIFICATION_API=https://api.notificacoes.com
NOTIFICATION_API_KEY=sua_chave_api_producao
FRONTEND_URL=https://seu-dominio.com
```

#### 2. Build da Aplicação

Compile o código TypeScript para JavaScript:

```bash
npm run build
```

#### 3. Preparar o Banco de Dados

Execute as migrations no banco de produção:

```bash
NODE_ENV=production npm run migration:run
```

### Métodos de Deploy

#### Opção 1: Deploy Manual com PM2 (Recomendado)

**Instalar PM2 globalmente:**
```bash
npm install -g pm2
```

**Criar arquivo de configuração do PM2 (`ecosystem.config.js`):**
```javascript
module.exports = {
  apps: [{
    name: 'almoxarifado-api',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 9137
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

**Iniciar a aplicação:**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Opção 2: Deploy com Docker

**Criar `Dockerfile`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código compilado
COPY dist/ ./dist/
COPY src/migrations/ ./dist/migrations/

# Expor porta
EXPOSE 9137

# Comando de inicialização
CMD ["node", "dist/index.js"]
```

**Criar `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: almoxarifado
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    ports:
      - "9137:9137"
    environment:
      NODE_ENV: production
      PORT: 9137
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: almoxarifado
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

**Build e iniciar com Docker:**
```bash
# Build
npm run build
docker-compose build

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar
docker-compose down
```

#### Opção 3: Deploy em Cloud Providers

**Heroku:**
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Criar app
heroku create seu-app-almoxarifado

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variáveis de ambiente
heroku config:set NODE_ENV=production
heroku config:set PORT=9137

# Deploy
git push heroku main

# Executar migrations
heroku run npm run migration:run
```