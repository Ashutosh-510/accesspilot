import type { FastifyInstance } from "fastify";

import {
  getEmployeesController,
  getEmployeeController,
  getEmployeeApplicationsController,
} from "../controller/employeeController.js";

export async function employeeRoutes(server: FastifyInstance) {
  server.get("/employees", getEmployeesController);

  server.get("/employees/:id", getEmployeeController);

  server.get("/employees/:id/access", getEmployeeApplicationsController);
}
