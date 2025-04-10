import { FastifyRequest } from "fastify";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import util from "util";
import FormData from "form-data";
import axios from "axios";

const pump = util.promisify(pipeline);

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const transcribeAudio = async (request: FastifyRequest) => {
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
        timeout: 5 * 60 * 1000,
      }
    );

    fs.unlinkSync(uploadPath);

    return response.data.transcription;
  } catch (error) {
    console.error("Erro ao transcrever áudio:", error);
    throw new Error("Falha ao processar a transcrição");
  }
};
