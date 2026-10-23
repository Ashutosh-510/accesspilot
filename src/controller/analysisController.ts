import type { FastifyReply, FastifyRequest } from "fastify";
import { analyzeRequest } from "../services/accessAnalysis.js";

type AnalysisParams = {
  id: string;
};

export async function analyzeRequestController(
  request: FastifyRequest<{ Params: AnalysisParams }>,
  reply: FastifyReply,
) {
  try {
    const analysis = await analyzeRequest(request.params.id);

    if (!analysis) {
      return reply.code(404).send({
        message: "Request not found",
      });
    }

    return reply.send(analysis);
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Failed to analyze access request",
    });
  }
}
