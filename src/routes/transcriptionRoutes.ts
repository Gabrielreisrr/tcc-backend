import { FastifyInstance } from "fastify";
import fastifyMultipart from "@fastify/multipart";
import transcriptionController from "../controllers/transcriptionController";
import { authMiddleware } from "../middlewares/authMiddleware";

async function transcriptionRoutes(app: FastifyInstance) {
  // Registra o plugin multipart para aceitar uploads de arquivos
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    },
  });

  // Rotas públicas (sem autenticação)
  app.get("/transcription/:id", transcriptionController.getTranscriptionById);

  // Rotas protegidas que exigem autenticação
  app.register(async (protectedRoutes) => {
    // Adicionando middleware de autenticação
    protectedRoutes.addHook("preHandler", authMiddleware);

    // Rota para transcrição de arquivos
    protectedRoutes.post("/transcribe", transcriptionController.transcribe);

    // Rota para exportar transcrição em braille
    protectedRoutes.get(
      "/transcription/:id/braille",
      transcriptionController.exportBraille
    );
  });
}

export default transcriptionRoutes;
