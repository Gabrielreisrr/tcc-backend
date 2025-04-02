import { FastifyInstance } from "fastify";
import fastifyMultipart from "@fastify/multipart";
import transcriptionController from "../controllers/transcriptionController";

async function transcriptionRoutes(app: FastifyInstance) {
  app.post("/transcribe", transcriptionController.transcribe);
}

export default transcriptionRoutes;
