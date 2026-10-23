import "dotenv/config";
import pg from "pg";
import crypto from "node:crypto";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const employeeIds = {
  rahul: crypto.randomUUID(),
  priya: crypto.randomUUID(),
};

const requestIds = {
  req1: crypto.randomUUID(),
  req2: crypto.randomUUID(),
  req3: crypto.randomUUID(),
};

async function seed() {
  await client.connect();

  try {
    await client.query("BEGIN");

    // Employees
    await client.query(
      `
      INSERT INTO "Employee"
        ("id", "name", "email", "department", "role", "createdAt", "updatedAt")
      VALUES
        ($1, 'Rahul Sharma', 'rahul@accesspilot.dev', 'Engineering', 'Developer', NOW(), NOW()),
        ($2, 'Priya Singh', 'priya@accesspilot.dev', 'Finance', 'Analyst', NOW(), NOW())
      `,
      [employeeIds.rahul, employeeIds.priya],
    );

    // Current application access
    await client.query(
      `
      INSERT INTO "ApplicationAccess"
        ("id", "employeeId", "application", "status", "createdAt", "updatedAt")
      VALUES
        ($1, $2, 'Jira', 'approved', NOW(), NOW()),
        ($3, $2, 'GitHub', 'approved', NOW(), NOW()),
        ($4, $2, 'Salesforce', 'pending', NOW(), NOW()),
        ($5, $2, 'AWS', 'approved', NOW(), NOW()),
        ($6, $7, 'Jira', 'approved', NOW(), NOW()),
        ($8, $7, 'Salesforce', 'approved', NOW(), NOW())
      `,
      [
        crypto.randomUUID(),
        employeeIds.rahul,
        crypto.randomUUID(),
        crypto.randomUUID(),
        crypto.randomUUID(),
        crypto.randomUUID(),
        employeeIds.priya,
        crypto.randomUUID(),
      ],
    );

    // Access requests
    await client.query(
      `
      INSERT INTO "AccessRequest"
        (
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
        )
      VALUES
        (
          $1, $2, 'Salesforce', 'standard',
          'pending', 'approved', 'pending', 'normal',
          'Project requirement', NOW(), NOW()
        ),
        (
          $3, $4, 'Jira', 'standard',
          'approved', 'approved', 'approved', 'normal',
          'Project requirement', NOW(), NOW()
        ),
        (
          $5, $2, 'AWS', 'standard',
          'approved', 'approved', 'approved', 'high',
          'Cloud development requirement', NOW(), NOW()
        )
      `,
      [
        requestIds.req1,
        employeeIds.rahul,
        requestIds.req2,
        employeeIds.priya,
        requestIds.req3,
      ],
    );

    await client.query("COMMIT");

    console.log("AccessPilot seed data inserted successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seed();
