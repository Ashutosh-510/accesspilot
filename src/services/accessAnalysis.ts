import {
  findRequestById,
  findRequestByRequestId,
} from "../models/requestModel.js";
import { askBedrock } from "./bedrockServices.js";
import { getPendingRequests } from "./requestService.js";
export async function analyzeRequest(requestId: string) {
  const request = await findRequestById(requestId);

  if (!request) {
    return null;
  }

  const issues: string[] = [];

  if (request.managerApproval !== "approved") {
    issues.push("Manager approval is incomplete");
  }

  if (request.applicationOwnerApproval !== "approved") {
    issues.push("Application owner approval is incomplete");
  }

  let recommendation = "Access request can proceed";

  if (issues.length > 0) {
    recommendation = "Access request requires attention";
  }

  const prompt = `
You are AccessPilot, an AI assistant for enterprise access management.

Analyze this employee access request.

Request:
${JSON.stringify(request, null, 2)}

Existing checks:
${JSON.stringify(issues, null, 2)}

Existing recommendation:
${recommendation}

Determine:

1. Priority: LOW, MEDIUM, or HIGH
2. Risk level
3. Why this request has that priority
4. Recommended action for the administrator

Keep the response concise and practical.
`;

  const aiAnalysis = await askBedrock(prompt);

  return {
    requestId: request.requestId,
    application: request.application,
    status: request.status,
    priority: request.priority,
    issues,
    recommendation,
    aiAnalysis,
  };
}

export async function prioritizeRequests() {
  const requests = await getPendingRequests();

  const analyses = [];

  for (const request of requests) {
    const analysis = await analyzeRequest(request.id);

    if (analysis) {
      analyses.push(analysis);
    }
  }

  return analyses.sort((a, b) => {
    const priorityOrder: Record<string, number> = {
      high: 3,
      medium: 2,
      normal: 1,
      low: 0,
    };

    return (
      (priorityOrder[String(b.priority).toLowerCase()] ?? 0) -
      (priorityOrder[String(a.priority).toLowerCase()] ?? 0)
    );
  });
}

export async function analyzeRequestByRequestId(requestId: string) {
  const request = await findRequestByRequestId(requestId);

  if (!request) {
    return null;
  }

  const issues: string[] = [];

  if (request.managerApproval !== "approved") {
    issues.push("Manager approval is incomplete");
  }

  if (request.applicationOwnerApproval !== "approved") {
    issues.push("Application owner approval is incomplete");
  }

  let recommendation = "Access request can proceed";

  if (issues.length > 0) {
    recommendation = "Access request requires attention";
  }

  const prompt = `
You are AccessPilot, an AI assistant for enterprise access management.

Analyze this employee access request.

Request:
${JSON.stringify(request, null, 2)}

Existing checks:
${JSON.stringify(issues, null, 2)}

Existing recommendation:
${recommendation}

Determine:

1. Priority: LOW, MEDIUM, or HIGH
2. Risk level
3. Why this request has that priority
4. Recommended action for the administrator

Keep the response concise and practical.
`;

  const { askBedrock } = await import("./bedrockServices.js");

  const aiAnalysis = await askBedrock(prompt);

  return {
    requestId: request.requestId,
    application: request.application,
    status: request.status,
    priority: request.priority,
    issues,
    recommendation,
    aiAnalysis,
  };
}
