# Processamento de NF-e — Teste Técnico Full Stack

Aplicação Full Stack desenvolvida para o teste técnico da **Mix Fiscal** (vaga Desenvolvedor Full Stack Pleno).

O sistema recebe arquivos XML de NF-e, extrai as informações fiscais, consulta uma API externa de clientes internos, classifica a operação como **compra**, **venda** ou **não identificada**, e envia notas sem vínculo para uma fila de processamento posterior.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Regras de negócio](#regras-de-negócio)
- [Arquitetura](#arquitetura)
- [Stack tecnológica](#stack-tecnológica)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Como executar](#como-executar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [API REST](#api-rest)
- [Interface web](#interface-web)
- [Testes automatizados](#testes-automatizados)
- [Massa de dados para teste](#massa-de-dados-para-teste)
- [Decisões técnicas](#decisões-técnicas)

---

## Funcionalidades

### Backend

- Upload de um ou múltiplos arquivos XML (`POST /xml/upload`)
- Validação de tipo e conteúdo dos arquivos
- Parse das informações: chave, emitente, destinatário, CNPJs, valor total e data de emissão
- Consulta à API externa de clientes internos (HTTP)
- Classificação automática: **COMPRA**, **VENDA** ou **NAO_IDENTIFICADO**
- Persistência em banco de dados
- Envio para fila (BullMQ + Redis) com fallback em SQLite quando Redis não está disponível
- Documentação Swagger/OpenAPI em `/docs`
- Prevenção de reprocessamento pela chave única da NF-e

### Frontend

- Tela de upload com seleção múltipla e feedback por arquivo
- Resumo consolidado por cliente interno (quantidade de compras e vendas)
- Listagem de XMLs sem vínculo com emitente, destinatário, CNPJs e motivo

---

## Regras de negócio

A classificação é feita comparando os CNPJs do XML com a lista de clientes internos retornada pela API externa:

| Condição | Operação | Significado |
|----------|----------|-------------|
| Destinatário é cliente interno | **COMPRA** (entrada) | A empresa recebeu a nota |
| Emitente é cliente interno *(e destinatário não)* | **VENDA** (saída) | A empresa emitiu a nota |
| Nenhum dos dois é cliente interno | **NAO_IDENTIFICADO** | Enviada para fila de processamento posterior |

> **Prioridade:** destinatário é verificado antes do emitente.

---

## Arquitetura

```
┌─────────────┐     multipart      ┌─────────────────┐
│   Frontend  │ ─────────────────► │     Backend     │
│  React/Vite │ ◄───────────────── │ Express + TS    │
│  :5173      │      JSON          │     :3001       │
└─────────────┘                    └────────┬────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
            ┌───────────────┐      ┌──────────────┐       ┌──────────────┐
            │ Mock Clientes │      │   SQLite     │       │ Redis/BullMQ │
            │    :3002      │      │  (nfe.db)    │       │    (fila)    │
            └───────────────┘      └──────────────┘       └──────────────┘
```

O serviço **mock-clientes-api** simula o sistema externo de clientes. O backend consome `GET /clientes` via HTTP — não lê o arquivo JSON diretamente no fluxo de processamento.

---

## Stack tecnológica

| Camada | Tecnologias |
|--------|-------------|
| Backend | Node.js, Express, TypeScript |
| Banco de dados | SQLite (better-sqlite3) |
| Fila | BullMQ + Redis (fallback: tabela `fila_processamento` no SQLite) |
| API mock | Express (clientes internos) |
| Frontend | React 19, Vite, TypeScript |
| Documentação API | Swagger UI (`/docs`) |
| Testes | Vitest (parser XML e classificação de operação) |
| Infra (opcional) | Docker Compose |

---

## Estrutura do repositório

```
.
├── backend/                    # API principal
│   ├── src/
│   │   ├── routes/             # Rotas HTTP
│   │   ├── services/           # Parse, classificação, fila, processamento
│   │   ├── repositories/       # Acesso ao SQLite
│   │   ├── db/                 # Configuração do banco
│   │   ├── swagger/            # OpenAPI
│   │   └── __tests__/          # Testes unitários
│   └── .env.example
├── mock-clientes-api/          # API externa simulada
├── frontend/                   # Interface React
│   └── src/
│       ├── components/
│       └── api.ts
├── xml_nfe_mock_v2_e_lista_clientes/   # 50 XMLs + clientes.json
├── docker-compose.yml
└── teste_tecnico_fullstack_nfe_pleno.md  # Enunciado do teste
```

---

## Pré-requisitos

- **Node.js** 20 ou superior
- **npm** 9+
- **Redis** (opcional — recomendado para fila com BullMQ)
- **Docker** e **Docker Compose** (opcional, para subir tudo de uma vez)

---

## Como executar

> Execute os serviços **na ordem abaixo**, cada um em um terminal separado, a partir da **raiz do projeto**.

### Opção 1 — Desenvolvimento local (recomendado para avaliação)

#### Terminal 1 — API de clientes (mock)

```bash
cd mock-clientes-api
npm install
npm run dev
```

Disponível em: http://localhost:3002/clientes

#### Terminal 2 — Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

- API: http://localhost:3001  
- Swagger: http://localhost:3001/docs  
- Health: http://localhost:3001/health  

#### Terminal 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Interface: http://localhost:5173

#### Redis (opcional)

```bash
docker run -d -p 6379:6379 --name redis-nfe redis:7-alpine
```

Sem Redis, a fila grava diretamente na tabela `fila_processamento` do SQLite.

---

### Opção 2 — Docker Compose

Na raiz do projeto:

```bash
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3001 |
| Swagger | http://localhost:3001/docs |
| Mock clientes | http://localhost:3002/clientes |

---

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3001` | Porta da API |
| `DATABASE_PATH` | `./data/nfe.db` | Caminho do SQLite |
| `CLIENTES_API_URL` | `http://localhost:3002/clientes` | URL da API de clientes |
| `REDIS_URL` | `redis://localhost:6379` | Conexão Redis para BullMQ |

### Frontend (`frontend/.env`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `VITE_API_URL` | `/api` | Base URL da API (proxy Vite em dev) |

Copie os arquivos `.env.example` antes de executar.

---

## API REST

### Upload de XML

```http
POST /xml/upload
Content-Type: multipart/form-data
```

Campo: `files` (um ou mais arquivos `.xml`)

**Exemplo:**

```bash
curl -X POST http://localhost:3001/xml/upload \
  -F "files=@xml_nfe_mock_v2_e_lista_clientes/xml_002.xml" \
  -F "files=@xml_nfe_mock_v2_e_lista_clientes/xml_003.xml"
```

**Resposta (201):**

```json
{
  "mensagem": "2 de 2 arquivo(s) processado(s)",
  "resultados": [
    { "arquivo": "xml_002.xml", "sucesso": true, "chave": "...", "operacao": "COMPRA" },
    { "arquivo": "xml_003.xml", "sucesso": true, "chave": "...", "operacao": "VENDA" }
  ]
}
```

### Resumo por cliente

```http
GET /resumo/clientes
```

```json
[
  { "cliente": "Comercial Nova Era", "compra": 3, "venda": 1 },
  { "cliente": "Empresa XPTO", "compra": 2, "venda": 0 }
]
```

### XMLs sem vínculo

```http
GET /resumo/sem-vinculo
```

```json
[
  {
    "chave": "...",
    "emitente": "Loja Independente",
    "emitenteCnpj": "77777777000107",
    "destinatario": "Fornecedor Beta",
    "destinatarioCnpj": "22222222000102",
    "motivo": "Nenhum CNPJ de emitente ou destinatário corresponde a cliente interno",
    "criadoEm": "2026-05-28 17:26:45"
  }
]
```

Documentação interativa completa: **http://localhost:3001/docs**

---

## Interface web

Após subir o frontend, acesse http://localhost:5173:

1. **Upload de XML** — selecione um ou vários arquivos e envie  
2. **Resumo por cliente** — tabela com totais de compra e venda  
3. **XMLs sem vínculo** — notas enviadas à fila com motivo da não identificação  

---

## Testes automatizados

```bash
cd backend
npm test
```

Cenários cobertos:

- Parse correto do XML e validação de estrutura inválida  
- Classificação: compra (destinatário interno), venda (emitente interno) e não identificado  

---

## Massa de dados para teste

Pasta: `xml_nfe_mock_v2_e_lista_clientes/`

| Arquivo | Resultado esperado |
|---------|-------------------|
| `xml_001.xml` | Não identificado (sem vínculo) |
| `xml_002.xml` | Compra (destinatário: Comercial Nova Era) |
| `xml_003.xml` | Venda (emitente: Distribuidora São Lucas) |

Clientes internos em `clientes.json` (5 empresas). Total de **50 XMLs** para testes em lote.

---

## Decisões técnicas

| Decisão | Motivo |
|---------|--------|
| **SQLite** | Simplicidade no escopo do teste; sem container extra de banco |
| **API mock separada** | Atende o requisito de integração HTTP com sistema externo |
| **Camadas (routes / services / repositories)** | Separação de responsabilidades e testabilidade |
| **BullMQ + fallback SQLite** | Fila assíncrona quando Redis existe; não quebra o dev local sem Redis |
| **`parseTagValue: false` no XML** | Evita que a chave numérica da NF-e seja convertida para notação científica |
| **Chave única no banco** | Idempotência — mesma NF-e não é processada duas vezes |
| **React + Vite** | Setup rápido, proxy nativo para API em desenvolvimento |

---

## Autor

**Guilherme Bragaia** — Teste técnico Mix Fiscal (Desenvolvedor Full Stack Pleno)
