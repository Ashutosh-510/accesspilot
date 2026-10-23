# 🚀 AccessPilot

### AI-Powered Access Management Assistant using MCP, RAG & AWS Bedrock

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
accesspilot/
│
├── accesspilotAgentCore/
│
├── frontend/
│
├── knowledge/
│
├── migrations/
│
├── prisma/
│
├── src/
│   ├── agent/
│   │   └── accessPilotAgent.ts
│   │
│   ├── controller/
│   │
│   ├── data/
│   │
│   ├── db/
│   │
│   ├── mcp/
│   │   ├── server.ts
│   │   ├── server-http.ts
│   │   └── tools.ts
│   │
│   ├── models/
│   │
│   ├── rag/
│   │   ├── documents/
│   │   ├── indexPolicies.ts
│   │   └── ragService.ts
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   └── server.ts
│
├── .env.example
├── package.json
├── README.md
└── tsconfig.json
```

---

# 🚀 Getting Started

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

| Variable            | Default                       | Purpose                                 |
| ------------------- | ----------------------------- | --------------------------------------- |
| `DATABASE_URL`      | —                             | PostgreSQL connection string            |
| `PORT`              | `3000`                        | Backend API port                        |
| `FRONTEND_URL`      | `http://localhost:5173`       | Allowed frontend origin for CORS        |
| `QDRANT_URL`        | `http://localhost:6333`       | Qdrant server URL                       |
| `QDRANT_COLLECTION` | `accesspilot-policies-ollama` | Qdrant collection for policy embeddings |

AWS credentials are resolved through the standard AWS SDK credential chain. Never commit `.env`, `.env.local`, AWS credentials, or other secrets.

## Run locally

Install backend dependencies from the project root:

```bash
npm install
```

## 3. Configure environment variables

Create:

```text
.env
```

Example:

```env
AWS_REGION=ap-south-1

DATABASE_URL=your_postgresql_connection_string

QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=accesspilot-policies-ollama
```

Do not commit your `.env` file or AWS credentials.

---

# 🧠 Start Ollama

Install and run Ollama.

Pull the embedding model:

```bash
ollama pull nomic-embed-text
```

Make sure Ollama is running on:

```text
http://localhost:11434
```

---

# 🗄️ Start Qdrant

Using Docker:

```bash
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  qdrant/qdrant
```

Qdrant will be available at:

```text
http://localhost:6333
```

---

# 📚 Index Access Policies

Run:

```bash
npx tsx src/rag/indexPolicies.ts
```

The policy document is split into chunks, embedded using `nomic-embed-text`, and stored in Qdrant.

---

# ▶️ Start the Backend

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

Test:

```text
GET /
```

Expected response:

```json
{
  "message": "AccessPilot API is running"
}
```

---

# 💻 Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

---

# 🧪 Example Queries

Try asking AccessPilot:

```text
Show me the pending access requests.
```

```text
Why is REQ4322122 pending?
```

```text
What should I do when application-owner approval is pending?
```

```text
Check the pending Salesforce access request for employee 1024.
```

```text
Prioritize the pending access requests.
```

---

# 🔐 Security

AccessPilot is designed around controlled tool access rather than allowing the AI model to directly manipulate the database.

The agent interacts with application functionality through MCP tools.

Secrets should be provided through environment variables and should never be committed to GitHub.

---

# ☁️ AWS Bedrock & AgentCore

AWS Bedrock is used as the reasoning layer for the AccessPilot AI agent.

The project also includes an AWS AgentCore integration/preparation under:

```text
accesspilotAgentCore/
```

AgentCore deployment was tested during development, but deployment was restricted by an AWS Organizations service-control policy on the development account.

The core AccessPilot functionality therefore remains independently demonstrable through:

```bash
npm run build
```

Build the frontend:

```bash
cd frontend
npm run build
```

## API overview

| Method | Path                      | Description                            |
| ------ | ------------------------- | -------------------------------------- |
| `GET`  | `/`                       | API health message                     |
| `GET`  | `/employees`              | List employees                         |
| `GET`  | `/employees/:id`          | Get an employee                        |
| `GET`  | `/employees/:id/access`   | Get an employee's application access   |
| `GET`  | `/employees/:id/requests` | List an employee's access requests     |
| `GET`  | `/requests`               | List access requests                   |
| `GET`  | `/requests/:id`           | Get an access request                  |
| `GET`  | `/requests/:id/analysis`  | Analyze an access request with Bedrock |
| `POST` | `/ask`                    | Ask the AccessPilot agent a question   |

Example agent request:

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Show me the pending access requests.\"}"
```

## Security

Use environment variables for secrets, and use non-production data when trying the app. Do not commit credentials, local environment files, or sensitive employee and access-request data.
