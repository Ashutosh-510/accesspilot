import { getPolicyRetriever } from "./ragService.js";
import { askBedrock } from "../services/bedrockServices.js";

export async function answerWithRAG(question: string) {
  const retriever = await getPolicyRetriever();

  const documents = await retriever.invoke(question);

  const context = documents
    .map((doc, index) => {
      return `Policy Source ${index + 1}:\n${doc.pageContent}`;
    })
    .join("\n\n");

  const prompt = `
You are AccessPilot, an enterprise access management assistant.

Answer the administrator's question using ONLY the provided policy
context.

If the answer cannot be determined from the policy context, say:
"I could not find this information in the access management policies."

Do not invent company policies.

Policy context:
${context}

Administrator question:
${question}

Provide a concise and practical answer.
`;

  return await askBedrock(prompt);
}
