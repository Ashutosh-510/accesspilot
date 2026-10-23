# AccessPilot

AccessPilot is an AI-assisted access-management application for administrators. It provides a React web interface and a TypeScript API for reviewing employees, application access, and access requests. An AI agent can use MCP tools to retrieve application data, and policy questions can use retrieval-augmented generation (RAG).

## Features

- Browse employee, application-access, and access-request information through the API.
- Ask the AccessPilot agent questions about requests, approvals, and access policies.
- Expose AccessPilot tools over the Model Context Protocol (MCP), using either stdio or HTTP.
- Retrieve policy context from Qdrant using Ollama embeddings.
- Analyze requests with Amazon Bedrock.
- Find an optional Amazon Bedrock AgentCore harness configuration in [`accesspilotAgentCore`](./accesspilotAgentCore/).

## Project layout

```text
.
├── frontend/             # React, TypeScript, and Vite web app
├── src/
│   ├── agent/            # Bedrock agent and MCP client
│   ├── db/               # PostgreSQL setup and seed utilities
│   ├── mcp/              # MCP servers and tool definitions
│   ├── rag/              # Policy documents, Qdrant, and retrieval
│   ├── routes/           # Fastify API routes
│   └── services/         # Access analysis and application services
├── prisma/               # Data models
└── accesspilotAgentCore/ # Optional AgentCore harness and CDK project
```

## Prerequisites

- Node.js and npm
- PostgreSQL, with a database schema matching [`prisma/schema.prisma`](./prisma/schema.prisma)
- AWS credentials with access to Amazon Bedrock and the configured `nvidia.nemotron-nano-12b-v2` model in `ap-south-1` for AI features
- Qdrant and Ollama with the `nomic-embed-text` model for policy retrieval

The web app and API can be run locally without deploying the optional AgentCore harness. Features that use the database, Bedrock, Qdrant, or Ollama require their respective services and credentials to be configured.

## Configuration

Copy the example environment file and set its values for your local environment:

```powershell
Copy-Item .env.example .env
```

Set `DATABASE_URL` in `.env` to your PostgreSQL connection string. The API also supports:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `PORT` | `3000` | Backend API port |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed frontend origin for CORS |
| `QDRANT_URL` | `http://localhost:6333` | Qdrant server URL |
| `QDRANT_COLLECTION` | `accesspilot-policies-ollama` | Qdrant collection for policy embeddings |

AWS credentials are resolved through the standard AWS SDK credential chain. Never commit `.env`, `.env.local`, AWS credentials, or other secrets.

## Run locally

Install backend dependencies from the project root:

```bash
npm install
```

Start the API in one terminal:

```bash
npm run dev
```

The API listens on `http://localhost:3000`. Start the Vite frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The frontend sends agent questions to the API at `http://localhost:3000/ask`.

### MCP servers

Start the stdio MCP server with:

```bash
npm run mcp
```

Or start the HTTP MCP server, which listens on port `8000` and exposes `http://localhost:8000/mcp`:

```bash
npm run mcp:http
```

The optional AgentCore harness in `accesspilotAgentCore/app/MyHarness/harness.json` is configured to use that local HTTP MCP endpoint.

## Build

Build the backend:

```bash
npm run build
```

Build the frontend:

```bash
cd frontend
npm run build
```

## API overview

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | API health message |
| `GET` | `/employees` | List employees |
| `GET` | `/employees/:id` | Get an employee |
| `GET` | `/employees/:id/access` | Get an employee's application access |
| `GET` | `/employees/:id/requests` | List an employee's access requests |
| `GET` | `/requests` | List access requests |
| `GET` | `/requests/:id` | Get an access request |
| `GET` | `/requests/:id/analysis` | Analyze an access request with Bedrock |
| `POST` | `/ask` | Ask the AccessPilot agent a question |

Example agent request:

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Show me the pending access requests.\"}"
```

## Security

Use environment variables for secrets, and use non-production data when trying the app. Do not commit credentials, local environment files, or sensitive employee and access-request data.
