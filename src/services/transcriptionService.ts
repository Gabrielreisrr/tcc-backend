import { FastifyRequest } from "fastify";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import util from "util";
import { OpenAI } from "openai";

const pump = util.promisify(pipeline);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const transcribeAudio = async (request: FastifyRequest) => {
  const data = await request.file();

  if (!data) {
    throw new Error("Nenhum arquivo de áudio foi enviado");
  }

  const uploadPath = path.join(__dirname, "../../uploads", data.filename);

  try {
    await pump(data.file, fs.createWriteStream(uploadPath));

    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(uploadPath),
      model: "whisper-1",
      language: "pt",
    });

    fs.unlinkSync(uploadPath);

    return response.text;
  } catch (error) {
    console.error("Erro ao transcrever áudio:", error);
    throw new Error("Falha ao processar a transcrição");
  }
};
