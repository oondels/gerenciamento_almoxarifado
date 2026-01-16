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

## Documentação da API

### Produtos

#### GET /api/products
Lista todos os produtos cadastrados.

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

## Tratamento de Erros

A API retorna erros no seguinte formato:

**Erro de validação (400):**
```json
{
  "message": "Erro na validação dos dados.",
  "details": [
    {
      "path": "name",
      "message": "O nome do produto é obrigatório."
    }
  ]
}
```

**Erro não encontrado (404):**
```json
{
  "message": "Produto não encontrado"
}
```

**Erro interno do servidor (500):**
```json
{
  "message": "Erro ao processar requisição",
  "error": "Descrição do erro"
}
```

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

ISC
