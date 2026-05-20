# DocuMind Frontend

React 18 + Vite dashboard for the DocuMind RAG platform.

## Prerequisites

- Node.js 20+
- DocuMind backend running (default `http://localhost:3001`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

Set `VITE_API_URL` to your backend URL (default `http://localhost:3001`).

3. **Hubot Sans font** — download `Hubot-Sans.woff2` from [github/hubot-sans](https://github.com/github/hubot-sans) and place it in `public/fonts/Hubot-Sans.woff2`. Public Sans loads from Google Fonts automatically.

4. Start the dev server:

```bash
npm run dev
```

Open http://localhost:5173

## Pages

- **Login / Register** — JWT auth, redirects to Documents on success
- **Documents** — upload PDF/TXT, list status with polling, delete documents
- **Query Playground** — ask questions against indexed docs, view tokens/cache/similarity
- **Analytics** — usage stats, quota bar, query chart, recent query table

## Design

Dark theme with indigo accent (`#6366f1`), Hubot Sans display font, Public Sans body font. Sidebar shows monthly query usage from `/api/auth/me`.
