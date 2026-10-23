import {
  findAllRequests,
  findRequestById,
  findRequestsByEmployeeId,
  findPendingRequests,
  findRequestFollowUps,
  insertRequestFollowUp,
  type ApprovalStage,
} from "../models/requestModel.js";
import { analyzeAccessRequest } from "./aiService.js";
import { findEmployeeById } from "../models/employeeModel.js";

export async function getAllRequests() {
  return findAllRequests();
}

export async function getPendingRequests() {
  return findPendingRequests();
}

export async function getRequestById(id: string) {
  return findRequestById(id);
}

export async function getRequestFollowUps(requestId: string) {
  return findRequestFollowUps(requestId);
}

export async function createRequestFollowUp(
  requestId: string,
  approvalStage: ApprovalStage,
  note: string | null,
) {
  return insertRequestFollowUp(requestId, approvalStage, note);
}

export async function getEmployeeRequests(employeeId: string) {
  const employee = await findEmployeeById(employeeId);

  if (!employee) {
    return null;
  }

  const requests = await findRequestsByEmployeeId(employeeId);

  return {
    employee: employee.name,
    requests,
  };
}
export async function analyzeRequestWithAI(requestId: string) {
  // Get the request using your existing request lookup function
  const request = await getRequestById(requestId);

  if (!request) {
    throw new Error("Access request not found");
  }

  const analysis = await analyzeAccessRequest(request);

  return {
    request,
    analysis,
  };
}
