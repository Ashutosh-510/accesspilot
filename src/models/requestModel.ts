import { pool } from "../db/postgres.js";

export async function findAllRequests() {
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
    ORDER BY "createdAt" DESC;
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
