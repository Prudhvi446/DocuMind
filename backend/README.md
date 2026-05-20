# DocuMind Backend

Multi-tenant RAG API built with Node.js, Express, Prisma, PostgreSQL (pgvector), Redis, BullMQ, and Google Gemini.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ with [pgvector](https://github.com/pgvector/pgvector) extension
- Redis 7+

## Setup

1. Copy environment file and fill in values:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Run database migrations (creates tables, vector extension, and IVFFlat index):

```bash
npx prisma migrate dev
```

4. Start the API:

```bash
node src/index.js
```

5. In a **separate terminal**, start the embedding worker:

```bash
node src/workers/embedding.worker.js
```

## Architecture

Tenants authenticate via JWT. Document uploads are stored on disk temporarily, queued in BullMQ, then processed by a worker that parses PDF/TXT files, splits text into chunks, embeds them with Gemini `text-embedding-004`, and stores vectors in PostgreSQL via pgvector. Query requests embed the question, run cosine similarity search scoped by `tenantId`, optionally generate an answer with `gemini-2.0-flash`, and cache responses in Redis. Monthly query limits are enforced per tenant in middleware.

Search the codebase for **SWAP MODEL HERE** to update embedding or generation models when newer Gemini versions are available.

## API Endpoints

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/auth/register` | No | `{ email, password, name }` | `201` `{ token, tenant }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ token, tenant }` |
| GET | `/api/auth/me` | Yes | — | `{ id, email, name, queryLimit, monthlyCount, queryCount, createdAt }` |
| POST | `/api/documents/upload` | Yes | `multipart/form-data` field `file` | `202` `{ documentId, status }` |
| GET | `/api/documents` | Yes | — | `[{ id, filename, status, createdAt, chunkCount }]` |
| DELETE | `/api/documents/:id` | Yes | — | `{ message }` |
| POST | `/api/query` | Yes | `{ question }` | `{ answer, cached, belowThreshold, tokensUsed, similarityScore }` |
| GET | `/api/analytics` | Yes | — | Analytics object (see spec) |

## Example curl Commands

**Register**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"Acme Corp"}'
```

**Login**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Me** (replace `TOKEN`)

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

**Upload document**

```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@./sample.pdf"
```

**List documents**

```bash
curl http://localhost:3001/api/documents \
  -H "Authorization: Bearer TOKEN"
```

**Delete document**

```bash
curl -X DELETE http://localhost:3001/api/documents/DOCUMENT_ID \
  -H "Authorization: Bearer TOKEN"
```

**Query**

```bash
curl -X POST http://localhost:3001/api/query \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"How do I reset my password?"}'
```

**Analytics**

```bash
curl http://localhost:3001/api/analytics \
  -H "Authorization: Bearer TOKEN"
```
