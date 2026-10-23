import type { FastifyReply, FastifyRequest } from "fastify";
import {
  getAllEmployees,
  getEmployeeById,
  getEmployeeApplications,
} from "../services/employeeService.js";

type EmployeeParams = {
  id: string;
};

export async function getEmployeesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const employees = await getAllEmployees();

    return reply.send(employees);
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Failed to fetch employees",
    });
  }
}

export async function getEmployeeController(
  request: FastifyRequest<{ Params: EmployeeParams }>,
  reply: FastifyReply,
) {
  try {
    const employee = await getEmployeeById(request.params.id);

    if (!employee) {
      return reply.code(404).send({
        message: "Employee not found",
      });
    }

    return reply.send(employee);
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Failed to fetch employee",
    });
  }
}

export async function getEmployeeApplicationsController(
  request: FastifyRequest<{ Params: EmployeeParams }>,
  reply: FastifyReply,
) {
  try {
    const result = await getEmployeeApplications(request.params.id);

    if (!result) {
      return reply.code(404).send({
        message: "Employee not found",
      });
    }

    return reply.send(result);
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Failed to fetch employee applications",
    });
  }
}
