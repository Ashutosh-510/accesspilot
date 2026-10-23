import { answerWithRAG } from "./ragAnswer.js";

async function main() {
  const question = "What should I do if application owner approval is pending?";

  console.log("\nQuestion:");
  console.log(question);

  const answer = await answerWithRAG(question);

  console.log("\n==============================");
  console.log("RAG ANSWER");
  console.log("==============================\n");

  console.log(answer);
}

main().catch((error) => {
  console.error("RAG test failed:", error);
  process.exit(1);
});
