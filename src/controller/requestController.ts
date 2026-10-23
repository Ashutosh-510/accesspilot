import type { FastifyReply, FastifyRequest } from "fastify";

import {
  getAllRequests,
  getRequestById,
  getEmployeeRequests,
  getRequestFollowUps,
  createRequestFollowUp,
} from "../services/requestService.js";
import { analyzeRequestWithAI } from "../services/requestService.js";
import type { ApprovalStage } from "../models/requestModel.js";
type RequestParams = {
  id: string;
};

type FollowUpBody = {
  approvalStage?: unknown;
  note?: unknown;
};

const approvalStages = ["manager", "application_owner"] as const;

function isApprovalStage(value: unknown): value is ApprovalStage {
  return approvalStages.some((stage) => stage === value);
}

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

export async function getRequestFollowUpsController(
  request: FastifyRequest<{ Params: RequestParams }>,
  reply: FastifyReply,
) {
  try {
    const accessRequest = await getRequestById(request.params.id);

    if (!accessRequest) {
      return reply.code(404).send({ message: "Request not found" });
    }

    return reply.send(await getRequestFollowUps(request.params.id));
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Failed to fetch request follow-ups",
    });
  }
}

export async function createRequestFollowUpController(
  request: FastifyRequest<{ Params: RequestParams; Body: FollowUpBody }>,
  reply: FastifyReply,
) {
  const { approvalStage, note } = request.body ?? {};

  if (!isApprovalStage(approvalStage)) {
    return reply.code(400).send({
      message: "Approval stage must be manager or application_owner",
    });
  }

  if (
    note !== undefined &&
    (typeof note !== "string" || note.length > 1000)
  ) {
    return reply.code(400).send({
      message: "Note must be 1000 characters or fewer",
    });
  }

  try {
    const followUp = await createRequestFollowUp(
      request.params.id,
      approvalStage,
      typeof note === "string" && note.trim() ? note.trim() : null,
    );

    if (!followUp) {
      const accessRequest = await getRequestById(request.params.id);

      if (!accessRequest) {
        return reply.code(404).send({ message: "Request not found" });
      }

      return reply.code(409).send({
        message: "That approval is no longer pending for this request",
      });
    }

    return reply.code(201).send(followUp);
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Failed to record request follow-up",
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
