import { FastifyReply, FastifyRequest } from "fastify";
import { transcribeAudio } from "../services/transcriptionService";

class TranscriptionController {
  public async transcribe(
    req: FastifyRequest<{ Body: any }>,
    res: FastifyReply
  ): Promise<void> {
    try {
      await transcribeAudio(req, res);
    } catch (error) {
      console.error(
        "Erro ao processar transcrição:",
        (error as Error).message || error
      );
      res.status(500).send({ error: "Falha ao transcrever áudio" });
    }
  }
}

export default new TranscriptionController();
