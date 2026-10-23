import { randomUUID } from "node:crypto";
import { pool } from "../db/postgres.js";

export type ApprovalStage = "manager" | "application_owner";

export type RequestFollowUp = {
  id: string;
  requestId: string;
  approvalStage: ApprovalStage;
  note: string | null;
  createdAt: string;
};

export async function findAllRequests() {
  const result = await pool.query(`
    SELECT
      "AccessRequest"."id",
      "AccessRequest"."employeeId",
      employee."name" AS "employeeName",
      "AccessRequest"."application",
      "AccessRequest"."requestedAccess",
      "AccessRequest"."status",
      "AccessRequest"."managerApproval",
      "AccessRequest"."applicationOwnerApproval",
      "AccessRequest"."priority",
      "AccessRequest"."reason",
      "AccessRequest"."createdAt",
      "AccessRequest"."updatedAt"
    FROM "AccessRequest"
    JOIN "Employee" employee ON employee."id" = "AccessRequest"."employeeId"
    ORDER BY "AccessRequest"."createdAt" DESC;
  `);

  return result.rows;
}

export async function findRequestById(id: string) {
  const result = await pool.query(
    `
    SELECT
      "id",
      "employeeId",
      "application",
      "requestedAccess",
      "status",
      "managerApproval",
      "applicationOwnerApproval",
      "priority",
      "reason",
      "createdAt",
      "updatedAt"
    FROM "AccessRequest"
    WHERE "id" = $1;
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function findRequestsByEmployeeId(employeeId: string) {
  const result = await pool.query(
    `
    SELECT
      "id",
      "application",
      "status",
      "managerApproval",
      "applicationOwnerApproval",
      "priority",
      "reason",
      "createdAt",
      "updatedAt"
    FROM "AccessRequest"
    WHERE "employeeId" = $1
    ORDER BY "createdAt" DESC;
    `,
    [employeeId],
  );

  return result.rows;
}

export async function findPendingRequests() {
  const result = await pool.query(`
    SELECT
      "id",
      "employeeId",
      "application",
      "requestedAccess",
      "status",
      "managerApproval",
      "applicationOwnerApproval",
      "priority",
      "reason",
      "createdAt",
      "updatedAt"
    FROM "AccessRequest"
    WHERE "status" = 'pending'
    ORDER BY "priority" DESC, "createdAt" ASC;
  `);

  return result.rows;
}
export async function findRequestByRequestId(requestId: string) {
  const result = await pool.query(
    `
    SELECT
      "id",
      "requestId",
      "employeeId",
      "application",
      "requestedAccess",
      "status",
      "managerApproval",
      "applicationOwnerApproval",
      "priority",
      "reason",
      "createdAt",
      "updatedAt"
    FROM "AccessRequest"
    WHERE "requestId" = $1;
    `,
    [requestId],
  );

  return result.rows[0] ?? null;
}

export async function findRequestFollowUps(requestId: string) {
  const result = await pool.query<RequestFollowUp>(
    `
    SELECT
      "id",
      "requestId",
      "approvalStage",
      "note",
      "createdAt"
    FROM "AccessRequestFollowUp"
    WHERE "requestId" = $1
    ORDER BY "createdAt" DESC;
    `,
    [requestId],
  );

  return result.rows;
}

export async function insertRequestFollowUp(
  requestId: string,
  approvalStage: ApprovalStage,
  note: string | null,
) {
  const result = await pool.query<RequestFollowUp>(
    `
    INSERT INTO "AccessRequestFollowUp"
      ("id", "requestId", "approvalStage", "note")
    SELECT $1, request."id", $3, $4
    FROM "AccessRequest" request
    WHERE request."id" = $2
      AND request."status" = 'pending'
      AND (
        ($3 = 'manager' AND request."managerApproval" = 'pending')
        OR (
          $3 = 'application_owner'
          AND request."applicationOwnerApproval" = 'pending'
        )
      )
    RETURNING "id", "requestId", "approvalStage", "note", "createdAt";
    `,
    [randomUUID(), requestId, approvalStage, note],
  );

  return result.rows[0] ?? null;
}
