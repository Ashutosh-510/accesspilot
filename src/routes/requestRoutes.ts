import type { FastifyInstance } from "fastify";

import {
  getRequestsController,
  getRequestController,
  getEmployeeRequestsController,
} from "../controller/requestController.js";

export async function requestRoutes(server: FastifyInstance) {
  server.get("/requests", getRequestsController);

  server.get("/requests/:id", getRequestController);

  server.get("/employees/:id/requests", getEmployeeRequestsController);
}
