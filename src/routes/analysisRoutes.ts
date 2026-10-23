import type { FastifyInstance } from "fastify";
import { analyzeRequestController } from "../controller/analysisController.js";

export async function analysisRoutes(fastify: FastifyInstance) {
  fastify.get("/requests/:id/analysis", analyzeRequestController);
}
