import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const examples = [
    "Check the pending Salesforce access request for employee 1024.",
    "What should I do when application-owner approval is pending?",
    "Show me the pending access requests.",
    "Why is REQ4322122 pending?",
  ];

  const askAccessPilot = async () => {
    if (!message.trim() || loading) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://localhost:3000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = await res.json();

      setResponse(
        data.answer ||
          data.response ||
          data.message ||
          "AccessPilot returned an empty response.",
      );
    } catch (error) {
      console.error(error);

      setResponse(
        "I couldn't connect to the AccessPilot backend. Make sure the backend is running on port 3000.",
      );
    } finally {
      setLoading(false);
    }
  };

  const askExample = (example: string) => {
    setMessage(example);
  };

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">A</div>

          <div>
            <h1>AccessPilot</h1>
            <p>AI Access Management Agent</p>
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Agent Online
        </div>
      </header>

      <main className="main">
        {/* HERO */}
        <section className="hero">
          <div className="badge">AI-POWERED ACCESS MANAGEMENT</div>

          <h2>
            Ask AccessPilot
            <br />
            <span>Your access agent.</span>
          </h2>

          <p className="description">
            Analyze access requests, identify missing approvals, prioritize
            requests, and answer enterprise access-policy questions.
          </p>
        </section>

        {/* INPUT / ADMIN ASSISTANT */}
        <section className="assistant-card">
          <div className="card-header">
            <div>
              <h3>🎙 Admin Assistant</h3>
              <p>Simulated Alexa+ interaction</p>
            </div>

            <div className="ai-badge">NVIDIA Nemotron</div>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Try: "Alexa, check the pending Salesforce access request..."'
          />

          <div className="actions">
            <button
              className="ask-button"
              onClick={askAccessPilot}
              disabled={loading}
            >
              <span>{loading ? "⏳" : "🎙"}</span>

              {loading ? "AccessPilot is thinking..." : "Ask AccessPilot"}
            </button>

            <button
              className="clear-button"
              onClick={() => {
                setMessage("");
                setResponse("");
              }}
            >
              Clear
            </button>
          </div>
        </section>

        {/* EXAMPLES */}
        <section className="examples">
          <div className="section-title">
            <h3>Try asking</h3>
            <span>Demo scenarios</span>
          </div>

          <div className="example-grid">
            {examples.map((example, index) => (
              <button
                key={index}
                className="example-card"
                onClick={() => askExample(example)}
              >
                <span className="example-number">0{index + 1}</span>

                <span>{example}</span>

                <span className="arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* AGENT RESPONSE */}
        <section className="response-card">
          <div className="response-header">
            <div className="response-icon">✦</div>

            <div>
              <h3>AccessPilot Agent</h3>
              <p>AI agent • MCP • enterprise access intelligence</p>
            </div>

            <div className="agent-state">
              <span className="agent-state-dot"></span>
              {loading ? "Processing" : "Ready"}
            </div>
          </div>

          {/* AGENT ACTIVITY */}
          {loading && (
            <div className="agent-activity">
              <div className="activity-item active">
                <span>✓</span>
                Understanding administrator request
              </div>

              <div className="activity-item active">
                <span>✓</span>
                Connecting to AccessPilot MCP
              </div>

              <div className="activity-item active">
                <span className="activity-spinner">◌</span>
                Selecting the appropriate access tools
              </div>
            </div>
          )}

          <div className="response-content">
            {response ? (
              <div className="response-text">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            ) : loading ? (
              <p className="response-placeholder">
                AccessPilot is analyzing the request...
              </p>
            ) : (
              <div className="empty-response">
                <div className="empty-icon">✦</div>

                <h4>Ready for your request</h4>

                <p>
                  Ask AccessPilot about an employee, access request, approval,
                  priority, or access policy.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <span>AccessPilot</span>

        <span>
          AI Agent&nbsp; • &nbsp;MCP&nbsp; • &nbsp;RAG&nbsp; • &nbsp;AWS Bedrock
        </span>
      </footer>
    </div>
  );
}

export default App;
