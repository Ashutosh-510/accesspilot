import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createServer } from "node:http";

import { registerAccessPilotTools } from "./tools.js";

const handler = createMcpHandler(() => {
  const server = new McpServer({
    name: "accesspilot-mcp",
    version: "1.0.0",
  });

  registerAccessPilotTools(server);

  return server;
});

const httpHandler = toNodeHandler(handler);

const httpServer = createServer((req, res) => {
  httpHandler(req, res);
});

const PORT = 8000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.error("AccessPilot MCP HTTP server running");
  console.error(`MCP endpoint: http://localhost:${PORT}/mcp`);
});
