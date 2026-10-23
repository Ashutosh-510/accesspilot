import Fastify from "fastify";
import cors from "@fastify/cors";
import { employeeRoutes } from "./routes/employeeRoutes.js";
import { requestRoutes } from "./routes/requestRoutes.js";
import { analysisRoutes } from "./routes/analysisRoutes.js";
import { askAccessPilot } from "./agent/accessPilotAgent.js";
const server = Fastify({
  logger: true,
});
await server.register(cors, {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
});

server.get("/", async () => {
  return {
    message: "AccessPilot API is running",
  };
});

server.register(employeeRoutes);
server.register(requestRoutes);
server.register(analysisRoutes);
server.post("/ask", async (request, reply) => {
  const body = request.body as {
    message?: string;
  };

  if (!body?.message?.trim()) {
    return reply.code(400).send({
      error: "Message is required",
    });
  }

  try {
    console.log("\n========================================");
    console.log("ACCESSPILOT REQUEST");
    console.log("========================================");
    console.log("Admin:", body.message);

    const answer = await askAccessPilot(body.message);

    console.log("\nAccessPilot:", answer);

    return {
      answer,
    };
  } catch (error) {
    console.error("AccessPilot error:", error);

    return reply.code(500).send({
      error: "AccessPilot failed to process the request",
    });
  }
});
const port = Number(process.env.PORT) || 3000;

server.listen(
  {
    port,
    host: "0.0.0.0",
  },
  (error, address) => {
    if (error) {
      server.log.error(error);
      process.exit(1);
    }

    console.log(`AccessPilot running at ${address}`);
  },
);
