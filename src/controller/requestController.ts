import type { FastifyReply, FastifyRequest } from "fastify";

import {
  getAllRequests,
  getRequestById,
  getEmployeeRequests,
} from "../services/requestService.js";
import { analyzeRequestWithAI } from "../services/requestService.js";
type RequestParams = {
  id: string;
};

export async function getRequestsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const requests = await getAllRequests();

    return reply.send(requests);
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Failed to fetch access requests",
    });
  }
}

export async function getRequestController(
  request: FastifyRequest<{ Params: RequestParams }>,
  reply: FastifyReply,
) {
  try {
    const accessRequest = await getRequestById(request.params.id);

    if (!accessRequest) {
      return reply.code(404).send({
        message: "Request not found",
      });
    }

    return reply.send(accessRequest);
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Failed to fetch request",
    });
  }
}

export async function getEmployeeRequestsController(
  request: FastifyRequest<{ Params: RequestParams }>,
  reply: FastifyReply,
) {
  try {
    const result = await getEmployeeRequests(request.params.id);

    if (!result) {
      return reply.code(404).send({
        message: "Employee not found",
      });
    }

    return reply.send(result);
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Failed to fetch employee requests",
    });
  }
}
export async function analyzeRequestController(request: any, reply: any) {
  try {
    const { id } = request.params;

    const result = await analyzeRequestWithAI(id);

    return reply.send(result);
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      error: "Failed to analyze access request",
    });
  }
}
