import { pool } from "../db/postgres.js";

export async function findAllEmployees() {
  const result = await pool.query(`
    SELECT
      id,
      name,
      email,
      department,
      role,
      "createdAt",
      "updatedAt"
    FROM "Employee"
    ORDER BY name;
  `);

  return result.rows;
}

export async function findEmployeeById(id: string) {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      department,
      role,
      "createdAt",
      "updatedAt"
    FROM "Employee"
    WHERE id = $1;
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function findEmployeeApplications(employeeId: string) {
  const result = await pool.query(
    `
    SELECT
      "application" AS name,
      "status"
    FROM "ApplicationAccess"
    WHERE "employeeId" = $1
    ORDER BY "application";
    `,
    [employeeId],
  );

  return result.rows;
}
