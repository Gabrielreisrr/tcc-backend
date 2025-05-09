import { FastifyInstance } from "fastify";
import transcriptionController from "../controllers/transcriptionController";
import { authMiddleware } from "../middlewares/authMiddleware";

async function transcriptionRoutes(app: FastifyInstance) {
  app.get("/transcription/:id", transcriptionController.getTranscriptionById);

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", authMiddleware);

    protectedRoutes.post("/transcribe", transcriptionController.transcribe);

    protectedRoutes.get(
      "/transcription/:id/summary",
      transcriptionController.generateSummary
    );

    protectedRoutes.get(
      "/transcription/:id/enhance",
      transcriptionController.enhanceTranscription
    );

    protectedRoutes.get(
      "/transcription/:id/braille",
      transcriptionController.exportBraille
    );
  });
}

export default transcriptionRoutes;
