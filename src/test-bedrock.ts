import { analyzeAccessRequest } from "./services/aiService.js";

const request = {
  employee: "Rahul Sharma",
  application: "AWS",
  requestedAccess: "Administrator",
  managerApproval: "approved",
  applicationOwnerApproval: "pending",
};

const result = await analyzeAccessRequest(request);

console.log("\n===== AccessPilot AI Analysis =====\n");
console.log(result);
