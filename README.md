# 🚀 AccessPilot

### AI-Powered Access Management Assistant using MCP, RAG & AWS Bedrock

**AccessPilot** is an AI-powered access-management assistant designed to help administrators understand and manage employee application-access requests using natural language.

Instead of manually checking access records, approval status, and policy documents, an administrator can simply ask questions such as:

> "Why is REQ4322122 pending?"

> "Show me the pending access requests."

> "What should I do if application-owner approval is pending?"

> "Can you prioritize the pending requests?"

AccessPilot combines **AI agents, Model Context Protocol (MCP), RAG, PostgreSQL, Qdrant, Ollama, and AWS Bedrock** to retrieve trusted application data and policy knowledge before generating an answer.

---

## 🎯 Problem

Enterprise access provisioning often involves repetitive tasks:

- Checking employee access
- Reviewing pending requests
- Identifying missing approvals
- Understanding why a request is blocked
- Searching access policies
- Prioritizing requests that need attention
- Following up on previously discussed requests

These tasks usually require administrators to switch between multiple systems and manually interpret information.

**AccessPilot brings these interactions into a single AI-powered interface.**

---

# 💡 Solution

AccessPilot provides an AI agent that can:

1. Understand the administrator's question.
2. Decide which tools or information it needs.
3. Call MCP tools to retrieve real access-management data.
4. Search policy documents through RAG when required.
5. Use AWS Bedrock for reasoning and response generation.
6. Maintain conversational context for follow-up questions.
7. Return a clear, human-readable answer.

The goal is not simply to generate text with an LLM, but to build an agent that can **reason over real application data and retrieve trusted information before answering.**

---

# ✨ Key Features

### 🤖 AI Access Management Agent

Ask natural-language questions about:

- Employees
- Application access
- Access requests
- Approval status
- Request priority
- Pending requests
- Access policies

---

### 🔌 MCP Tool Integration

AccessPilot exposes controlled application capabilities through the **Model Context Protocol (MCP)**.

Current MCP tools include:

- `get_employee`
- `get_employee_access`
- `get_pending_requests`
- `get_request_by_id`
- `analyze_access_request`
- `prioritize_requests`
- `search_access_policies`

The AI agent can select and call the appropriate tools based on the administrator's question.

---

### 🧠 RAG-Based Policy Retrieval

Policy-related questions use a Retrieval-Augmented Generation pipeline.

```text
Access Policy Documents
        ↓
Document Chunking
        ↓
Ollama
nomic-embed-text
        ↓
Qdrant
        ↓
Semantic Retrieval
        ↓
AI Agent
        ↓
AWS Bedrock
```

This allows AccessPilot to retrieve relevant policy information instead of relying only on the model's general knowledge.

---

### 💬 Conversational Follow-Ups

AccessPilot supports conversational follow-up questions.

For example:

```text
Admin:
Why is REQ4322122 pending?

AccessPilot:
The request is pending because application-owner approval
has not been completed.

Admin:
Who needs to approve it?

AccessPilot:
The application owner needs to provide the remaining approval.
```

The administrator does not need to repeat the request ID in every message.

This makes the interaction feel more like an actual AI assistant rather than a collection of independent API calls.

---

### 📊 Request Analysis

AccessPilot can analyze access requests and identify:

- Current status
- Missing approvals
- Priority
- Potential issues
- Recommended action

Example:

```text
Request:
Salesforce access

Status:
Pending

Issue:
Application owner approval is incomplete.

Recommendation:
Follow up with the application owner's team.
```

---

### ⚡ Request Prioritization

Administrators can ask:

```text
Prioritize the pending access requests.
```

The agent retrieves the relevant requests and determines which requests require attention.

---

### ☁️ AWS Bedrock Integration

AWS Bedrock provides the reasoning layer for the AccessPilot AI agent.

Current model:

```text
NVIDIA Nemotron Nano 12B v2
```

The application uses the AWS SDK for JavaScript to communicate with Bedrock Runtime.

---

# 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │      Administrator   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React Web UI       │
                         │   AI Assistant       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ AccessPilot Agent    │
                         │ TypeScript / Node.js │
                         └──────────┬───────────┘
                                    │
                              Tool Calling
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     MCP Server       │
                         └───────┬───────┬──────┘
                                 │       │
                    ┌────────────┘       └─────────────┐
                    ▼                                  ▼
          ┌──────────────────┐               ┌──────────────────┐
          │   PostgreSQL     │               │   RAG Pipeline   │
          │                  │               │                  │
          │ Employees        │               │ Policy Documents │
          │ Access Requests  │               │       ↓          │
          │ Approvals        │               │ Ollama Embedding │
          └──────────────────┘               │       ↓          │
                                             │     Qdrant       │
                                             └────────┬─────────┘
                                                      │
                                                      ▼
                                             ┌──────────────────┐
                                             │   AWS Bedrock    │
                                             │   AI Reasoning   │
                                             └────────┬─────────┘
                                                      │
                                                      ▼
                                             ┌──────────────────┐
                                             │ Human-readable   │
                                             │ AI Response      │
                                             └──────────────────┘
```

---

# 🔄 How AccessPilot Works

### Example: Checking a Pending Request

```text
Administrator
     │
     │ "Why is REQ4322122 pending?"
     ▼
AccessPilot Agent
     │
     ▼
MCP Tool Selection
     │
     ▼
get_request_by_id
     │
     ▼
PostgreSQL
     │
     ▼
Request Information
     │
     ▼
AWS Bedrock
     │
     ▼
Reasoned Response
     │
     ▼
Administrator
```

For policy questions:

```text
Administrator
     │
     ▼
AccessPilot Agent
     │
     ▼
search_access_policies
     │
     ▼
Qdrant
     │
     ▼
Relevant Policy Chunks
     │
     ▼
AWS Bedrock
     │
     ▼
Policy-based Answer
```

---

# 🧰 Technology Stack

| Technology | Purpose |
|---|---|
| **TypeScript** | Application and agent development |
| **Node.js** | Backend runtime |
| **Fastify** | REST API |
| **React + Vite** | Web interface |
| **PostgreSQL** | Employee and access-request data |
| **Prisma** | Database access and schema management |
| **MCP** | AI-to-application tool communication |
| **AWS Bedrock** | AI reasoning |
| **Qdrant** | Vector database |
| **Ollama** | Local embeddings |
| **nomic-embed-text** | Policy document embeddings |
| **LangChain** | RAG pipeline |
| **Docker** | Local Qdrant deployment |
| **AWS AgentCore** | Agent deployment preparation |

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

- Node.js and npm
- PostgreSQL
- Docker
- Ollama
- AWS CLI
- AWS credentials with access to Amazon Bedrock
- Qdrant

The configured Bedrock model is:

```text
nvidia.nemotron-nano-12b-v2
```

The current AWS region is:

```text
ap-south-1
```

---

# 1. Clone the Repository

```bash
git clone <your-repository-url>
cd accesspilot
```

---

# 2. Install Backend Dependencies

```bash
npm install
```

---

# 3. Configure Environment Variables

Create `.env` from the example:

```powershell
Copy-Item .env.example .env
```

Example:

```env
AWS_REGION=ap-south-1

DATABASE_URL=your_postgresql_connection_string

QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=accesspilot-policies-ollama

PORT=3000
FRONTEND_URL=http://localhost:5173
```

AWS credentials are resolved through the standard AWS SDK credential chain.

**Never commit `.env`, AWS credentials, API keys, or other secrets.**

---

# 4. Start Ollama

Install and start Ollama.

Pull the embedding model:

```bash
ollama pull nomic-embed-text
```

Ollama should be available at:

```text
http://localhost:11434
```

---

# 5. Start Qdrant

Qdrant can be started locally using Docker:

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

# 6. Configure PostgreSQL

Create a PostgreSQL database and configure its connection string in `.env`.

Run the required Prisma database setup/migrations according to the project's Prisma configuration.

The database stores information such as:

- Employees
- Application access
- Access requests
- Approval status
- Request analysis

---

# 7. Index Access Policies

Run:

```bash
npx tsx src/rag/indexPolicies.ts
```

This will:

1. Load the access-policy document.
2. Split it into chunks.
3. Generate embeddings using `nomic-embed-text`.
4. Store the vectors in Qdrant.

---

# 8. Start the Backend

From the project root:

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

# 9. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

The frontend provides the AI assistant interface for interacting with AccessPilot.

---

# 🧪 Example Queries

Try asking:

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

### Follow-up conversation

You can also continue the conversation:

```text
Admin:
Why is REQ4322122 pending?

AccessPilot:
The request is waiting for application-owner approval.

Admin:
Who needs to approve it?

AccessPilot:
The remaining approval must be provided by the application owner's team.
```

---

# 🔌 API Overview

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | API health message |
| `GET` | `/employees` | List employees |
| `GET` | `/employees/:id` | Get an employee |
| `GET` | `/employees/:id/access` | Get employee application access |
| `GET` | `/employees/:id/requests` | List employee access requests |
| `GET` | `/requests` | List access requests |
| `GET` | `/requests/:id` | Get an access request |
| `GET` | `/requests/:id/analysis` | Analyze an access request with Bedrock |
| `POST` | `/ask` | Ask the AccessPilot AI agent |

Example:

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Show me the pending access requests.\"}"
```

---

# 🧠 AI Agent + MCP

The AccessPilot agent does not directly manipulate the database.

Instead, it interacts with controlled application capabilities exposed through MCP.

```text
AI Agent
   │
   ├── get_employee
   ├── get_employee_access
   ├── get_pending_requests
   ├── get_request_by_id
   ├── analyze_access_request
   ├── prioritize_requests
   └── search_access_policies
```

This provides a controlled boundary between the AI model and application data.

---

# 🔐 Security

AccessPilot follows a tool-based architecture rather than giving the AI model unrestricted database access.

Key principles:

- AI interacts with application functionality through MCP.
- Database access remains inside backend services.
- Secrets are stored through environment variables.
- AWS credentials are never committed to the repository.
- Policy information is retrieved through the RAG pipeline.
- Development/testing should use non-production employee and access-request data.

---

# ☁️ AWS Bedrock & AgentCore

### AWS Bedrock

Amazon Bedrock provides the AI reasoning layer for AccessPilot.

The application uses the AWS SDK for JavaScript to interact with Bedrock Runtime.

```text
AccessPilot Agent
       ↓
AWS SDK
       ↓
Amazon Bedrock
       ↓
NVIDIA Nemotron
       ↓
AI Response
```

### AWS AgentCore

The project also contains an AgentCore integration/preparation:

```text
accesspilotAgentCore/
```

AgentCore deployment was tested during development. However, deployment was blocked by an **AWS Organizations Service Control Policy (SCP)** that restricted the required CloudFormation operation.

This did not prevent the core AccessPilot application from being developed and demonstrated.

The working application can independently demonstrate:

```text
React
  ↓
AccessPilot Agent
  ↓
MCP
  ↓
PostgreSQL / RAG
  ↓
AWS Bedrock
  ↓
AI Response
```

---

# 🏆 Hackathon Highlights

AccessPilot demonstrates how an AI agent can go beyond simple chatbot responses by combining:

### 🤖 Agentic AI

The model decides which tools it needs to answer the administrator's question.

### 🔌 MCP

Application capabilities are exposed to the agent through a standardized tool interface.

### 📚 RAG

Access policies are retrieved from a vector database to provide grounded answers.

### 🗄️ Enterprise Data

The agent can reason over structured employee and access-request information.

### ☁️ AWS Bedrock

Bedrock provides the AI reasoning capability.

### 💬 Conversational Follow-Ups

Administrators can continue the conversation without repeatedly providing the same request context.

---

# 🔮 Future Improvements

Potential next steps include:

- Integration with real enterprise IAM systems
- Authentication and role-based access control
- Audit logging
- Automated approval follow-ups
- Slack / Microsoft Teams integration
- Voice-based interaction through Alexa+
- Production deployment through AgentCore
- More advanced request-prioritization logic
- Automated notifications for pending approvals

---

# 📌 Project Status

AccessPilot currently provides a working local demonstration of:

```text
AI Agent
   +
MCP
   +
PostgreSQL
   +
RAG
   +
Qdrant
   +
Ollama
   +
AWS Bedrock
   +
Conversational Follow-Ups
```

The project is designed to demonstrate how AI agents can interact with real application data and trusted knowledge sources instead of relying only on generated responses.

---

# 👨‍💻 Built By

**Ashutosh Singh**

Built as an exploration of **Agentic AI, MCP, RAG, AWS Bedrock, and enterprise access management automation.**
