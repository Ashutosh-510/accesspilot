import { useEffect, useRef, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

type ApprovalStage = "manager" | "application_owner";

type AccessRequest = {
  id: string;
  employeeName: string;
  application: string;
  status: string;
  managerApproval: string;
  applicationOwnerApproval: string;
};

type RequestFollowUp = {
  id: string;
  requestId: string;
  approvalStage: ApprovalStage;
  note: string | null;
  createdAt: string;
};

function getPendingApprovalStages(
  request: AccessRequest | undefined,
): ApprovalStage[] {
  if (!request) {
    return [];
  }

  const stages: ApprovalStage[] = [];
  if (request.managerApproval === "pending") {
    stages.push("manager");
  }
  if (request.applicationOwnerApproval === "pending") {
    stages.push("application_owner");
  }
  return stages;
}

function isFollowUpRequest(message: string) {
  return /(follow[\s-]?up|followup|chase|nudge|remind(?:er|ing)?)/i.test(
    message,
  );
}

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [approvalStage, setApprovalStage] = useState<ApprovalStage>("manager");
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpHistory, setFollowUpHistory] = useState<{
    requestId: string;
    items: RequestFollowUp[];
  } | null>(null);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpError, setFollowUpError] = useState("");
  const [followUpNotice, setFollowUpNotice] = useState("");
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const followUpSectionRef = useRef<HTMLElement>(null);

  const requestsNeedingApproval = requests.filter(
    (request) =>
      request.status === "pending" &&
      (request.managerApproval === "pending" ||
        request.applicationOwnerApproval === "pending"),
  );

  const selectedRequest = requestsNeedingApproval.find(
    (request) => request.id === selectedRequestId,
  );

  const followUps =
    followUpHistory?.requestId === selectedRequestId
      ? followUpHistory.items
      : [];

  const availableApprovalStages = getPendingApprovalStages(selectedRequest);

  const openFollowUp = () => {
    setIsFollowUpOpen(true);
    window.requestAnimationFrame(() => {
      followUpSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  useEffect(() => {
    let isCurrent = true;

    const loadRequests = async () => {
      try {
        const result = await fetch("http://localhost:3000/requests");
        if (!result.ok) {
          throw new Error(`Request list failed (${result.status})`);
        }

        const data: AccessRequest[] = await result.json();
        if (isCurrent) {
          setRequests(data);
          const firstPendingRequest = data.find(
            (request) =>
              request.status === "pending" &&
              (request.managerApproval === "pending" ||
                request.applicationOwnerApproval === "pending"),
          );
          setSelectedRequestId(firstPendingRequest?.id ?? "");
          setApprovalStage(
            getPendingApprovalStages(firstPendingRequest)[0] ?? "manager",
          );
        }
      } catch (error) {
        if (isCurrent) {
          setFollowUpError(
            error instanceof Error
              ? error.message
              : "Could not load access requests.",
          );
        }
      }
    };

    void loadRequests();

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedRequestId) {
      return;
    }

    const controller = new AbortController();

    const loadFollowUps = async () => {
      setFollowUpError("");
      try {
        const result = await fetch(
          `http://localhost:3000/requests/${encodeURIComponent(selectedRequestId)}/follow-ups`,
          { signal: controller.signal },
        );
        if (!result.ok) {
          throw new Error(`Follow-up history failed (${result.status})`);
        }
        setFollowUpHistory({
          requestId: selectedRequestId,
          items: await result.json(),
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setFollowUpError(
            error instanceof Error
              ? error.message
              : "Could not load follow-up history.",
          );
        }
      }
    };

    void loadFollowUps();

    return () => controller.abort();
  }, [selectedRequestId]);

  const examples = [
    "Check the pending Salesforce access request for employee 1024.",
    "What should I do when application-owner approval is pending?",
    "Show me the pending access requests.",
    "Why is REQ4322122 pending?",
  ];

  const askAccessPilot = async () => {
    if (!message.trim() || loading) return;

    if (isFollowUpRequest(message)) {
      openFollowUp();
    }

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

  const recordFollowUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRequestId || !availableApprovalStages.includes(approvalStage)) {
      setFollowUpError("Choose a request with a pending approval first.");
      return;
    }

    setFollowUpLoading(true);
    setFollowUpError("");
    setFollowUpNotice("");

    try {
      const result = await fetch(
        `http://localhost:3000/requests/${encodeURIComponent(selectedRequestId)}/follow-ups`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approvalStage,
            note: followUpNote.trim() || undefined,
          }),
        },
      );

      if (!result.ok) {
        const error: { message?: string } = await result.json();
        throw new Error(error.message ?? `Could not record follow-up (${result.status})`);
      }

      const followUp: RequestFollowUp = await result.json();
      setFollowUpHistory((currentHistory) => ({
        requestId: selectedRequestId,
        items: [
          followUp,
          ...(currentHistory?.requestId === selectedRequestId
            ? currentHistory.items
            : []),
        ],
      }));
      setFollowUpNote("");
      setFollowUpNotice("Follow-up recorded. No message was sent.");
    } catch (error) {
      setFollowUpError(
        error instanceof Error ? error.message : "Could not record follow-up.",
      );
    } finally {
      setFollowUpLoading(false);
    }
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
              className="follow-up-toggle"
              type="button"
              onClick={() =>
                isFollowUpOpen ? setIsFollowUpOpen(false) : openFollowUp()
              }
              aria-expanded={isFollowUpOpen}
              aria-controls="approval-follow-up"
            >
              {isFollowUpOpen ? "Close follow-up" : "Follow up on approval"}
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

        {isFollowUpOpen && (
          <section
            className="follow-up-card"
            id="approval-follow-up"
            ref={followUpSectionRef}
          >
            <div className="follow-up-heading">
              <div>
                <h3>Approval follow-up</h3>
                <p>
                  Log when you chase an approver and keep a history by request.
                </p>
              </div>
              <span className="tracking-badge">TRACKING ONLY</span>
            </div>

            <form onSubmit={recordFollowUp}>
              <label className="follow-up-field">
                Access request
                <select
                  value={selectedRequestId}
                  onChange={(event) => {
                    const requestId = event.target.value;
                    const request = requestsNeedingApproval.find(
                      (item) => item.id === requestId,
                    );
                    setSelectedRequestId(requestId);
                    setApprovalStage(
                      getPendingApprovalStages(request)[0] ?? "manager",
                    );
                    setFollowUpNotice("");
                    setFollowUpError("");
                  }}
                  disabled={requestsNeedingApproval.length === 0}
                  required
                >
                  {requestsNeedingApproval.length === 0 ? (
                    <option value="">No requests need approval</option>
                  ) : (
                    requestsNeedingApproval.map((request) => (
                      <option key={request.id} value={request.id}>
                        {request.application} — {request.employeeName} (
                        {request.id.slice(0, 8)})
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="follow-up-field">
                Approval to chase
                <select
                  value={approvalStage}
                  onChange={(event) =>
                    setApprovalStage(
                      event.target.value === "application_owner"
                        ? "application_owner"
                        : "manager",
                    )
                  }
                  disabled={availableApprovalStages.length === 0}
                >
                  {availableApprovalStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage === "manager"
                        ? "Manager approval"
                        : "Application owner approval"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="follow-up-field">
                Note <span>(optional)</span>
                <textarea
                  className="follow-up-note"
                  value={followUpNote}
                  onChange={(event) => setFollowUpNote(event.target.value)}
                  placeholder="Add context about this follow-up"
                  maxLength={1000}
                  rows={3}
                />
              </label>

              <div className="follow-up-actions">
                <p>
                  Recording a follow-up does not send an email or notification.
                </p>
                <button
                  className="ask-button"
                  type="submit"
                  disabled={followUpLoading || !selectedRequest}
                >
                  {followUpLoading ? "Recording..." : "Log follow-up"}
                </button>
              </div>
            </form>

            {followUpError && (
              <p className="follow-up-message error" role="alert">
                {followUpError}
              </p>
            )}
            {followUpNotice && (
              <p className="follow-up-message success" role="status">
                {followUpNotice}
              </p>
            )}

            <div className="follow-up-history">
              <h4>Follow-up history</h4>
              {followUps.length === 0 ? (
                <p>No follow-ups recorded for this request yet.</p>
              ) : (
                <ul>
                  {followUps.map((followUp) => (
                    <li key={followUp.id}>
                      <span>
                        {followUp.approvalStage === "manager"
                          ? "Manager approval"
                          : "Application owner approval"}
                        {followUp.note ? ` — ${followUp.note}` : ""}
                      </span>
                      <time dateTime={followUp.createdAt}>
                        {new Date(followUp.createdAt).toLocaleString()}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

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
