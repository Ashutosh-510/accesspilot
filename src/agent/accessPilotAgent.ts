import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: "ap-south-1",
});

const MODEL_ID = "nvidia.nemotron-nano-12b-v2";

/**
 * Main AccessPilot AI Agent
 *
 * This is the same agent previously used from the terminal.
 * It connects to MCP, gives the MCP tools to Bedrock,
 * executes tool calls, and returns the final AI response.
 */
export async function askAccessPilot(userQuestion: string): Promise<string> {
  // -----------------------------------------
  // 1. Connect to MCP server
  // -----------------------------------------

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "src/mcp/server.ts"],
  });

  const client = new Client({
    name: "accesspilot-agent",
    version: "1.0.0",
  });

  try {
    await client.connect(transport);

    console.log("Connected to AccessPilot MCP server");

    // -----------------------------------------
    // 2. Get MCP tools
    // -----------------------------------------

    const tools = await client.listTools();

    console.log("Available MCP tools:");

    for (const tool of tools.tools) {
      console.log(`- ${tool.name}`);
    }

    // -----------------------------------------
    // 3. Convert MCP tools → Bedrock tools
    // -----------------------------------------

    const bedrockTools = tools.tools.map((tool) => ({
      toolSpec: {
        name: tool.name,
        description: tool.description ?? "",
        inputSchema: {
          json: tool.inputSchema,
        },
      },
    }));

    const toolConfig: any = {
      tools: bedrockTools,
    };

    // -----------------------------------------
    // 4. Conversation
    // -----------------------------------------

    const messages: any[] = [
      {
        role: "user",
        content: [
          {
            text: `
You are AccessPilot, an AI assistant for enterprise
access management.

You have access to MCP tools that provide real access
request and employee data.

Rules:

1. Use MCP tools whenever the user's question requires
   information from the AccessPilot system.

2. Do not invent employee or access request information.

3. If multiple MCP tools are required, use them in sequence.

4. After receiving tool results, analyze them and give
   the administrator a concise practical answer.

5. Explain the reason behind your recommendation.

6. Human-facing access requests use IDs such as REQ8472913.

7. When the administrator mentions a request ID starting
   with "REQ", use the appropriate MCP request tool to
   retrieve the request.

8. Do not invent request information.

9. Always use an MCP tool when the administrator asks
   about a specific request.

10. After retrieving the request, explain its status,
    application, approvals, priority, and issue clearly.

11. If the request does not exist, tell the administrator
    that the request could not be found.

12. For access-policy questions, use the available
    RAG/policy MCP tools when appropriate.

Administrator question:

${userQuestion}
`,
          },
        ],
      },
    ];

    // -----------------------------------------
    // 5. Agent loop
    // -----------------------------------------

    while (true) {
      console.log("\nAccessPilot is thinking...");

      const command = new ConverseCommand({
        modelId: MODEL_ID,
        messages,
        toolConfig,
      });

      const response = await bedrock.send(command);

      const assistantMessage = response.output?.message;

      if (!assistantMessage) {
        throw new Error("No response from Bedrock");
      }

      // Add AI response to conversation
      messages.push(assistantMessage);

      // -----------------------------------------
      // AI finished
      // -----------------------------------------

      if (response.stopReason !== "tool_use") {
        const text = assistantMessage.content
          ?.filter((block: any) => block.text)
          .map((block: any) => block.text)
          .join("\n");

        return text || "AccessPilot could not generate a response.";
      }

      // -----------------------------------------
      // AI requested MCP tools
      // -----------------------------------------

      const toolUses =
        assistantMessage.content?.filter((block: any) => block.toolUse) ?? [];

      // -----------------------------------------
      // Execute MCP tools
      // -----------------------------------------

      for (const block of toolUses) {
        const toolUse = block.toolUse;

        if (!toolUse) {
          continue;
        }

        const toolName = String(toolUse.name);

        const toolArguments =
          toolUse.input && typeof toolUse.input === "object"
            ? (toolUse.input as Record<string, unknown>)
            : {};

        console.log("\n----------------------------------------");
        console.log("MCP TOOL CALL");
        console.log("----------------------------------------");

        console.log("Tool:", toolName);
        console.log("Arguments:", toolArguments);

        const toolResult = await client.callTool({
          name: toolName,
          arguments: toolArguments,
        });

        console.log("MCP tool executed successfully.");

        // ---------------------------------------
        // Send MCP result back to Bedrock
        // ---------------------------------------

        messages.push({
          role: "user",
          content: [
            {
              toolResult: {
                toolUseId: toolUse.toolUseId,
                content: [
                  {
                    text: JSON.stringify(toolResult),
                  },
                ],
              },
            },
          ],
        });
      }
    }
  } finally {
    // Always close MCP connection
    await client.close();
  }
}
