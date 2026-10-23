# 🚀 AccessPilot

### AI-Powered Access Management Assistant using MCP, RAG & AWS Bedrock

AccessPilot is an AI-powered enterprise access-management assistant designed to help administrators understand, analyze, and prioritize employee application-access requests.

Instead of manually checking access trackers, approval statuses, and policy documents, administrators can interact with AccessPilot using natural language.

> **"Show me the pending Salesforce access requests."**

AccessPilot determines what information is required, calls the appropriate MCP tools, retrieves relevant access-policy knowledge through RAG, and uses an LLM to generate a clear explanation and recommendation.

---

## 🎯 Problem

Enterprise access provisioning often involves repetitive manual work:

- Checking employee access requests
- Verifying manager and application-owner approvals
- Identifying why requests are pending
- Prioritizing requests requiring attention
- Searching access-management policies
- Switching between multiple systems to understand a request

This makes access operations slower and increases the possibility of missing important requests.

### AccessPilot's goal

Turn this workflow into a conversational AI experience where an administrator can simply ask:

> **"Why is this access request pending?"**

and receive an actionable answer.

---

## 💡 Solution

AccessPilot combines an AI agent with **Model Context Protocol (MCP)** tools, PostgreSQL data, Retrieval-Augmented Generation (RAG), Qdrant, and AWS Bedrock.

The agent decides which tools and information it needs before generating the final response.

### Example

**Admin:**

> Why is REQ4322122 pending?

**AccessPilot:**

> The request is pending because application-owner approval is incomplete. The manager approval has already been completed. The request therefore requires follow-up with the application owner's team before access can be granted.

The response is generated from the application's actual request data and available policy knowledge rather than hardcoded responses.

---

# 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │     Administrator    │
                         └──────────┬───────────┘
                                    │
                                    │ Natural Language
                                    ▼
                         ┌──────────────────────┐
                         │   AccessPilot UI     │
                         │   React + Vite       │
                         └──────────┬───────────┘
                                    │
                                    │ POST /ask
                                    ▼
                         ┌──────────────────────┐
                         │  AccessPilot Agent   │
                         │      TypeScript      │
                         └──────────┬───────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                 ┌────────────────┐    ┌────────────────┐
                 │   MCP Server   │    │ AWS Bedrock    │
                 │                │    │ Nemotron       │
                 └───────┬────────┘    └────────────────┘
                         │
             ┌───────────┼───────────────┐
             │           │               │
             ▼           ▼               ▼
       PostgreSQL     RAG Search     Access Analysis
                         │
                         ▼
                     Qdrant
                         │
                         ▼
               Access Policy Knowledge
                         │
                         ▼
                  Ollama Embeddings
                (nomic-embed-text)
```

---

# 🔄 How AccessPilot Works

### 1. Administrator asks a question

The administrator interacts with the AccessPilot interface using natural language.

Example:

```text
Check the pending Salesforce access request for employee 1024.
```

### 2. AI Agent understands the request

The AccessPilot agent analyzes the question and determines what information it needs.

### 3. Agent uses MCP

The agent can call MCP tools such as:

```text
get_employee
get_employee_access
get_pending_requests
get_request_by_id
analyze_access_request
prioritize_requests
search_access_policies
```

This allows the model to interact with real application capabilities instead of relying on hardcoded answers.

### 4. Data is retrieved

AccessPilot retrieves information from:

- PostgreSQL
- Access request data
- Employee data
- Qdrant policy knowledge base

### 5. RAG provides policy context

Policy documents are:

```text
Access Policy Document
        ↓
Text Chunking
        ↓
Ollama Embeddings
(nomic-embed-text)
        ↓
Qdrant
        ↓
Relevant Policy Chunks
```

This allows AccessPilot to answer questions such as:

> What should I do if application-owner approval is pending?

using the organization's access-policy knowledge.

### 6. AWS Bedrock generates the answer

The retrieved data and tool results are provided to the AI model running through AWS Bedrock.

The model generates a human-readable response containing:

- Current status
- Missing approvals
- Priority
- Reason
- Recommended action

---

# 🧠 MCP Tools

AccessPilot uses MCP to expose application capabilities to the AI agent.

| Tool | Purpose |
|---|---|
| `get_employee` | Retrieve employee information |
| `get_employee_access` | Check employee application access |
| `get_pending_requests` | Retrieve pending access requests |
| `get_request_by_id` | Retrieve a specific request |
| `analyze_access_request` | Analyze request status and issues |
| `prioritize_requests` | Help prioritize access requests |
| `search_access_policies` | Search access-policy knowledge |

This creates a clean separation between:

```text
AI reasoning
     ↓
MCP tools
     ↓
Application capabilities
     ↓
Enterprise data
```

---

# 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Markdown

### Backend

- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Prisma

### AI

- AWS Bedrock
- NVIDIA Nemotron Nano
- MCP
- RAG

### Vector Search

- Qdrant
- Ollama
- `nomic-embed-text`

### AWS

- AWS Bedrock
- AWS AgentCore architecture prepared for the project

---

# 📁 Project Structure

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

Install:

- Node.js
- PostgreSQL
- Docker
- Ollama
- AWS CLI

You also need access to AWS Bedrock.

---

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd accesspilot
```

## 2. Install dependencies

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

```text
React UI
   ↓
AccessPilot Agent
   ↓
MCP
   ↓
PostgreSQL / RAG
   ↓
AWS Bedrock
```

This keeps the application functional without making the demo dependent on a specific AWS account-level deployment configuration.

---

# 🏆 Hackathon Highlights

### 🤖 Agentic AI

AccessPilot doesn't simply generate text. The agent determines which application tools it needs and calls them through MCP.

### 🔌 MCP Integration

MCP provides a structured interface between the AI agent and enterprise access-management capabilities.

### 📚 RAG

Access policies are indexed and retrieved dynamically to ground policy-related responses.

### ☁️ AWS Bedrock

The reasoning layer uses AWS Bedrock to generate the final response.

### 🗃️ Real Application Data

The agent can work with employee and access-request data stored in PostgreSQL.

### 🎙️ Alexa+ / Conversational Interface

The UI simulates an Alexa+ style administrator experience, demonstrating how the same agent architecture can be exposed through a conversational assistant.

---

# 🎥 Demo Flow

A recommended demonstration:

```text
1. Open AccessPilot
        ↓
2. Ask:
   "Show me the pending access requests."
        ↓
3. Agent decides which MCP tool to use
        ↓
4. MCP retrieves application data
        ↓
5. Agent analyzes the result
        ↓
6. AccessPilot explains the issue
        ↓
7. Ask a policy question
        ↓
8. RAG retrieves relevant policy
        ↓
9. Bedrock generates the final recommendation
```

---

# 🔮 Future Improvements

- Production deployment using AWS AgentCore
- Enterprise identity integration
- Automated approval workflows
- Role-based administrator access
- Audit logging
- Slack / Microsoft Teams integration
- Voice-first Alexa+ interaction
- More advanced request prioritization
- Automated follow-up with approvers
- Multi-tenant enterprise support

---

# 👨‍💻 Built By

**Ashutosh Singh**

AccessPilot was built as an AI/agentic access-management project combining:

**MCP + RAG + AWS Bedrock + PostgreSQL + Qdrant + React**

---

## ⭐ Why AccessPilot?

AccessPilot demonstrates how enterprise workflows that traditionally depend on manual checking and repetitive operational tasks can be transformed into an intelligent, tool-using AI workflow.

> **From checking access requests manually to asking an AI agent what needs attention.**
