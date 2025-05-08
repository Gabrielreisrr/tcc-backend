import { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import util from "util";
import FormData from "form-data";
import axios from "axios";
import History from "../models/History";
import { enhanceTranscription, generateSummary } from "./geminiService";

const pump = util.promisify(pipeline);
const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
interface TranscriptionSegment {
  time: string;
  text: string;
}

export const transcribeAudio = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const data = await request.file();
  if (!data) {
    throw new Error("Nenhum arquivo de áudio foi enviado");
  }

  const query = request.query as {
    autoSummary?: string;
    enhanceText?: string;
  };

  const shouldGenerateSummary = query.autoSummary === "true";
  const shouldEnhanceText = query.enhanceText === "true";

  const uploadPath = path.join(uploadDir, data.filename);
  let responseData = null;

  try {
    await pump(data.file, fs.createWriteStream(uploadPath));

    const formData = new FormData();
    formData.append("file", fs.createReadStream(uploadPath));

    const response = await axios.post(
      process.env.TRANSCRIPTION_SERVICE_URL ||
        "http://localhost:8001/transcribe",
      formData,
      {
        headers: formData.getHeaders(),
        responseType: "json",
        timeout: 5 * 60 * 1000,
      }
    );

    console.log("Transcription response received");

    let segments: TranscriptionSegment[] = [];
    if (Array.isArray(response.data)) {
      segments = response.data;
    } else if (response.data && typeof response.data === "object") {
      segments = response.data.segments || [];
    }

    if (segments.length === 0 || !segments.every((s) => s.time && s.text)) {
      console.warn("Segmentos inválidos na resposta");
      return response.data;
    }

    const fullText = segments.map((s) => s.text).join("\n");

    let enhancedTextResult = null;
    let summaryResult = null;

    const processingPromises = [];

    if (shouldEnhanceText) {
      processingPromises.push(
        enhanceTranscription(fullText)
          .then((result) => {
            enhancedTextResult = result;
          })
          .catch((err) => {
            console.error("Erro ao aprimorar texto:", err);
          })
      );
    }

    if (shouldGenerateSummary) {
      processingPromises.push(
        generateSummary(fullText)
          .then((result) => {
            summaryResult = result;
          })
          .catch((err) => {
            console.error("Erro ao gerar resumo:", err);
          })
      );
    }

    if (processingPromises.length > 0) {
      await Promise.allSettled(processingPromises);
    }

    if (request.user && request.user.id) {
      try {
        const userId = request.user.id;
        const fileName = data.filename;
        const newHistory = await History.create({
          userId,
          title: fileName,
          url: "uploads/" + fileName,
          type: data.mimetype.startsWith("video/") ? "video" : "audio",
          segments,
          enhancedText: enhancedTextResult,
          summary: summaryResult,
        });

        console.log("Histórico salvo com sucesso!");
        console.log("ID do histórico:", newHistory._id);

        responseData = {
          historyId: newHistory._id,
          segments,
          ...(enhancedTextResult ? { enhancedText: enhancedTextResult } : {}),
          ...(summaryResult ? { summary: summaryResult } : {}),
        };
      } catch (historyError) {
        console.error("Erro ao salvar histórico:", historyError);
        responseData = {
          segments,
          ...(enhancedTextResult ? { enhancedText: enhancedTextResult } : {}),
          ...(summaryResult ? { summary: summaryResult } : {}),
        };
      }
    } else {
      console.warn("Usuário não autenticado. Histórico não foi salvo.");
      responseData = {
        segments,
        ...(enhancedTextResult ? { enhancedText: enhancedTextResult } : {}),
        ...(summaryResult ? { summary: summaryResult } : {}),
      };
    }

    console.log("Transcrição processada com sucesso!");
    console.log("transcription:", responseData);
    return responseData;
  } catch (error) {
    console.error("Erro ao transcrever áudio:", error);
    throw new Error(
      `Falha ao processar a transcrição: ${(error as Error).message}`
    );
  } finally {
    if (fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath);
    }
  }
};

export const getFullTranscriptionText = async (
  historyId: string
): Promise<string> => {
  try {
    const history = await History.findById(historyId);
    if (!history || !history.segments || history.segments.length === 0) {
      throw new Error("Transcrição não encontrada ou vazia");
    }

    return history.segments.map((segment) => segment.text).join("\n");
  } catch (error) {
    console.error("Erro ao obter texto completo da transcrição:", error);
    throw new Error(
      `Falha ao obter texto da transcrição: ${(error as Error).message}`
    );
  }
};
