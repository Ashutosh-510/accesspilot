import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";

import { registerAccessPilotTools } from "./tools.js";

const server = new McpServer({
  name: "accesspilot-mcp",
  version: "1.0.0",
});

registerAccessPilotTools(server);

void serveStdio(() => server);

console.error("AccessPilot MCP server running");
