import "dotenv/config";
import pg from "pg";
import { readFile } from "node:fs/promises";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  await client.connect();

  const sql = await readFile(new URL("./setup.sql", import.meta.url), "utf8");

  await client.query(sql);

  console.log("Database setup completed successfully.");

  await client.end();
}

setup().catch(async (error) => {
  console.error("Database setup failed:", error);
  await client.end();
  process.exit(1);
});
