import { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import util from "util";
import FormData from "form-data";
import axios from "axios";
import History from "../models/History";

const pump = util.promisify(pipeline);

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const transcribeAudio = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const data = await request.file();

  if (!data) {
    throw new Error("Nenhum arquivo de áudio foi enviado");
  }

  const uploadPath = path.join(uploadDir, data.filename);

  try {
    await pump(data.file, fs.createWriteStream(uploadPath));

    const formData = new FormData();
    formData.append("file", fs.createReadStream(uploadPath));

    const response = await axios.post(
      "http://localhost:8001/transcribe",
      formData,
      {
        headers: formData.getHeaders(),
        responseType: "json",
        timeout: 5 * 60 * 1000,
      }
    );

    console.log("Transcription response:", response.data);

    let segments = [];
    if (Array.isArray(response.data)) {
      segments = response.data;
    } else if (response.data && typeof response.data === "object") {
      segments = response.data.segments || [];
    }

    if (
      request.user &&
      request.user.id &&
      segments.length > 0 &&
      segments.every((s: { time: any; text: any }) => s.time && s.text)
    ) {
      try {
        const userId = request.user.id;
        const fileName = data.filename;

        await History.create({
          userId,
          title: fileName,
          url: "uploads/" + fileName,
          type: data.mimetype.startsWith("video/") ? "video" : "audio",
          segments,
        });

        console.log("Histórico salvo com sucesso!");
      } catch (historyError) {
        console.error("Erro ao salvar histórico:", historyError);
      }
    } else {
      console.warn(
        "Segmentos inválidos ou usuário não autenticado. Histórico não foi salvo."
      );
    }

    reply.send(segments.length > 0 ? segments : response.data);
    console.log("Transcrição enviada com sucesso!");
  } catch (error) {
    console.error("Erro ao transcrever áudio:", error);
    throw new Error("Falha ao processar a transcrição");
  } finally {
    if (fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath);
    }
  }
};
