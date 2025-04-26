import { FastifyInstance } from "fastify";
import fastifyMultipart from "@fastify/multipart";
import transcriptionController from "../controllers/transcriptionController";
import { authMiddleware } from "../middlewares/authMiddleware";

async function transcriptionRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", authMiddleware);
    protectedRoutes.post("/transcribe", transcriptionController.transcribe);
  });
}

export default transcriptionRoutes;
