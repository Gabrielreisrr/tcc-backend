import { FastifyReply, FastifyRequest } from "fastify";
import { transcribeAudio } from "../services/transcriptionService";
import { generateBrailleFile } from "../services/brailleService";
import History from "../models/History";

class TranscriptionController {
  public async transcribe(
    req: FastifyRequest,
    res: FastifyReply
  ): Promise<void> {
    try {
      const result = await transcribeAudio(req, res);
      res.send(result);
    } catch (error) {
      console.error(
        "Erro ao processar transcrição:",
        (error as Error).message || error
      );
      res.status(500).send({ error: "Falha ao transcrever áudio" });
    }
  }

  getTranscriptionById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;

    try {
      const numericId = Number(id);

      let history = null;

      if (!isNaN(numericId)) {
        history = await History.findOne({ id: numericId });
      }

      if (!history) {
        try {
          history = await History.findById(id);
        } catch (e) {}
      }

      if (!history) {
        history = await History.findOne({ _id: id });
      }

      if (!history) {
        console.log(`Transcrição não encontrada: ID ${id}`);
        return reply
          .status(404)
          .send({ message: "Transcrição não encontrada" });
      }

      reply.send({
        id: history._id || history.id,
        title: history.title,
        type: history.type,
        url: history.url,
        segments: history.segments || [],
        text: history.segments
          ? history.segments.map((segment) => segment.text).join("\n")
          : "Sem texto de transcrição disponível",
      });
    } catch (error) {
      console.error("Erro ao buscar transcrição:", error);
      reply.status(500).send({
        message: "Erro ao buscar transcrição",
        error: (error as Error).message,
      });
    }
  };

  exportBraille = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;

    try {
      const numericId = Number(id);

      let history = null;

      if (!isNaN(numericId)) {
        history = await History.findOne({ id: numericId });
      }

      if (!history) {
        try {
          history = await History.findById(id);
        } catch (e) {}
      }

      if (!history) {
        history = await History.findOne({ _id: id });
      }

      if (!history) {
        return reply
          .status(404)
          .send({ message: "Transcrição não encontrada" });
      }

      const fullText = history.segments
        .map((segment) => segment.text)
        .join("\n");

      const filePath = await generateBrailleFile(fullText, id);

      reply.header("Content-Type", "text/plain");
      reply.header(
        "Content-Disposition",
        `attachment; filename="transcription-${id}.txt"`
      );
      reply.sendFile(filePath);
    } catch (error) {
      console.error("Erro ao gerar arquivo Braille:", error);
      reply.status(500).send({
        message: "Erro ao gerar arquivo Braille",
        error: (error as Error).message,
      });
    }
  };

  // async generateSummary(
  //   request: FastifyRequest<{ Params: { id: string } }>,
  //   reply: FastifyReply
  // ) {
  //   const { id } = request.params;
  //   try {
  //     const history = await this.findHistoryById(id);

  //     if (!history) {
  //       return reply
  //         .status(404)
  //         .send({ message: "Transcrição não encontrada" });
  //     }

  //     if (history.summary) {
  //       return reply.send({
  //         id: history._id,
  //         summary: history.summary,
  //       });
  //     }

  //     const fullText = history.segments
  //       .map((segment) => segment.text)
  //       .join("\n");

  //     const summary = await generateSummary(fullText);

  //     history.summary = summary;
  //     await history.save();

  //     reply.send({
  //       id: history._id,
  //       summary,
  //     });
  //   } catch (error) {
  //     console.error("Erro ao gerar resumo:", error);
  //     reply.status(500).send({
  //       message: "Erro ao gerar resumo",
  //       error: (error as Error).message,
  //     });
  //   }
  // }

  // enhanceTranscription = async (
  //   request: FastifyRequest<{ Params: { id: string } }>,
  //   reply: FastifyReply
  // ) => {
  //   const { id } = request.params;
  //   try {
  //     const history = await this.findHistoryById(id);

  //     if (!history) {
  //       return reply
  //         .status(404)
  //         .send({ message: "Transcrição não encontrada" });
  //     }

  //     if (history.enhancedText) {
  //       return reply.send({
  //         id: history._id,
  //         enhancedText: history.enhancedText,
  //       });
  //     }

  //     const fullText = history.segments
  //       .map((segment) => segment.text)
  //       .join("\n");

  //     const enhanced = await enhanceTranscription(fullText);

  //     history.enhancedText = enhanced;
  //     await history.save();

  //     reply.send({
  //       id: history._id,
  //       enhancedText: enhanced,
  //     });
  //   } catch (error) {
  //     console.error("Erro ao aprimorar transcrição:", error);
  //     reply.status(500).send({
  //       message: "Erro ao aprimorar transcrição",
  //       error: (error as Error).message,
  //     });
  //   }
  // };
}

export default new TranscriptionController();
