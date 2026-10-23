import { askBedrock } from "./bedrockServices.js";

export async function analyzeAccessRequest(request: unknown) {
  const prompt = `
You are AccessPilot, an AI assistant that helps administrators
prioritize employee access requests.

Analyze the following access request:

${JSON.stringify(request, null, 2)}

Provide:
1. Priority: LOW, MEDIUM, or HIGH
2. Reason
3. Risk
4. Recommended action

Keep the response concise and structured.
`;

  return await askBedrock(prompt);
}
