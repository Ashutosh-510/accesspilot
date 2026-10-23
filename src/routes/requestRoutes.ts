import type { FastifyInstance } from "fastify";

import {
  getRequestsController,
  getRequestController,
  getEmployeeRequestsController,
  getRequestFollowUpsController,
  createRequestFollowUpController,
} from "../controller/requestController.js";

export async function requestRoutes(server: FastifyInstance) {
  server.get("/requests", getRequestsController);

  server.get("/requests/:id/follow-ups", getRequestFollowUpsController);
  server.post("/requests/:id/follow-ups", createRequestFollowUpController);

  server.get("/requests/:id", getRequestController);

  server.get("/employees/:id/requests", getEmployeeRequestsController);
}
