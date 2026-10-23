import { McpServer } from "@modelcontextprotocol/server";
import { findRequestByRequestId } from "../models/requestModel.js";
import { getPolicyRetriever } from "../rag/ragService.js";
import * as z from "zod/v4";

import {
  analyzeRequest,
  prioritizeRequests,
} from "../services/accessAnalysis.js";

import {
  getEmployeeById,
  getEmployeeApplications,
} from "../services/employeeService.js";

import { getPendingRequests } from "../services/requestService.js";

export function registerAccessPilotTools(server: McpServer) {
  // --------------------------------------------------
  // 1. GET EMPLOYEE
  // --------------------------------------------------

  server.registerTool(
    "get_employee",
    {
      description:
        "Get employee information from AccessPilot using the employee ID.",
      inputSchema: z.object({
        id: z.string().min(1).describe("The employee ID"),
      }),
    },
    async ({ id }) => {
      try {
        const employee = await getEmployeeById(id);

        if (!employee) {
          return {
            content: [
              {
                type: "text",
                text: `Employee with ID ${id} was not found.`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(employee),
            },
          ],
        };
      } catch (error) {
        console.error("get_employee error:", error);

        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve employee information.",
            },
          ],
          isError: true,
        };
      }
    },
  );

  // --------------------------------------------------
  // 2. GET EMPLOYEE ACCESS
  // --------------------------------------------------

  server.registerTool(
    "get_employee_access",
    {
      description: "Get the applications and access status for an employee.",
      inputSchema: z.object({
        id: z.string().min(1).describe("The employee ID"),
      }),
    },
    async ({ id }) => {
      try {
        const result = await getEmployeeApplications(id);

        if (!result) {
          return {
            content: [
              {
                type: "text",
                text: `Employee with ID ${id} was not found.`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        };
      } catch (error) {
        console.error("get_employee_access error:", error);

        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve employee access information.",
            },
          ],
          isError: true,
        };
      }
    },
  );

  // --------------------------------------------------
  // 3. GET PENDING REQUESTS
  // --------------------------------------------------

  server.registerTool(
    "get_pending_requests",
    {
      description:
        "Get all pending access requests that require attention, ordered by priority.",
    },
    async () => {
      try {
        const requests = await getPendingRequests();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(requests),
            },
          ],
        };
      } catch (error) {
        console.error("get_pending_requests error:", error);

        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve pending access requests.",
            },
          ],
          isError: true,
        };
      }
    },
  );

  // --------------------------------------------------
  // 4. ANALYZE ACCESS REQUEST
  // --------------------------------------------------

  server.registerTool(
    "analyze_access_request",
    {
      description:
        "Analyze an access request and identify approval issues and whether it requires attention.",
      inputSchema: z.object({
        requestId: z.string().min(1).describe("The access request ID"),
      }),
    },
    async ({ requestId }) => {
      try {
        const analysis = await analyzeRequest(requestId);

        if (!analysis) {
          return {
            content: [
              {
                type: "text",
                text: `Access request with ID ${requestId} was not found.`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(analysis),
            },
          ],
        };
      } catch (error) {
        console.error("analyze_access_request error:", error);

        return {
          content: [
            {
              type: "text",
              text: "Failed to analyze the access request.",
            },
          ],
          isError: true,
        };
      }
    },
  );

  // --------------------------------------------------
  // 5. PRIORITIZE REQUESTS
  // --------------------------------------------------

  server.registerTool(
    "prioritize_requests",
    {
      description:
        "Analyze and prioritize all pending access requests so administrators know which requests require attention first.",
    },
    async () => {
      try {
        const prioritizedRequests = await prioritizeRequests();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(prioritizedRequests),
            },
          ],
        };
      } catch (error) {
        console.error("prioritize_requests error:", error);

        return {
          content: [
            {
              type: "text",
              text: "Failed to prioritize pending access requests.",
            },
          ],
          isError: true,
        };
      }
    },
  );

  // --------------------------------------------------
  // 6. GET REQUEST BY ID
  // --------------------------------------------------

  server.registerTool(
    "get_request_by_id",
    {
      description:
        "Find an access request using its human-friendly request ID such as REQ4322122",
      inputSchema: z.object({
        requestId: z.string(),
      }),
    },
    async ({ requestId }) => {
      try {
        const request = await findRequestByRequestId(requestId);

        if (!request) {
          return {
            content: [
              {
                type: "text",
                text: `No access request found with request ID ${requestId}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(request, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("get_request_by_id error:", error);

        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve access request.",
            },
          ],
          isError: true,
        };
      }
    },
  );

  // --------------------------------------------------
  // 7. SEARCH ACCESS POLICIES / RAG
  // --------------------------------------------------

  server.registerTool(
    "search_access_policies",
    {
      description:
        "Search AccessPilot access management policies and return relevant policy information for a question.",
      inputSchema: z.object({
        question: z.string(),
      }),
    },
    async ({ question }) => {
      try {
        const retriever = await getPolicyRetriever();

        const documents = await retriever.invoke(question);

        if (documents.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No relevant access management policy was found.",
              },
            ],
          };
        }

        const results = documents.map((doc, index) => ({
          result: index + 1,
          content: doc.pageContent,
          source: doc.metadata?.source ?? "unknown",
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("search_access_policies error:", error);

        return {
          content: [
            {
              type: "text",
              text: "Failed to search access management policies.",
            },
          ],
          isError: true,
        };
      }
    },
  );
}
