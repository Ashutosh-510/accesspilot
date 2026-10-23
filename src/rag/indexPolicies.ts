import { indexPolicies } from "./ragService.js";

async function main() {
  try {
    await indexPolicies();

    console.log("Policy indexing completed successfully.");
  } catch (error) {
    console.error("Policy indexing failed:", error);
    process.exit(1);
  }
}

main();
