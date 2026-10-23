import { getPolicyRetriever } from "./ragService.js";

async function main() {
  const retriever = await getPolicyRetriever();

  const question = "What should I do if application owner approval is pending?";

  console.log("\nQuestion:");
  console.log(question);

  const documents = await retriever.invoke(question);

  console.log("\nRetrieved policy chunks:\n");

  documents.forEach((doc, index) => {
    console.log(`--- Result ${index + 1} ---`);
    console.log(doc.pageContent);
    console.log("Metadata:", doc.metadata);
    console.log();
  });
}

main().catch((error) => {
  console.error("Retrieval failed:", error);
  process.exit(1);
});
