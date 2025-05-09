import fs from "fs";
import path from "path";
import { textToBraille } from "./geminiService";

export const formatTextForBraille = async (text: string): Promise<string> => {
  let formattedText = text
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const maxLineLength = 40;
  const lines: string[] = [];
  const words = formattedText.split(" ");
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 > maxLineLength) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine.length === 0 ? word : `${currentLine} ${word}`;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.join("\n");
};

export const generateBrailleFile = async (
  text: string,
  id: string
): Promise<string> => {
  if (!text || text.trim() === "") {
    throw new Error("O texto para conversão em Braille está vazio");
  }

  const brailleText = text.normalize();

  // Certifique-se de que o diretório de saída existe e está acessível
  const outputDir = path.resolve(__dirname, "..", "exports");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `transcription-${id}.txt`);
  fs.writeFileSync(filePath, brailleText, { encoding: "utf-8" });

  // Verificar se o arquivo foi escrito corretamente
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    throw new Error("Falha ao escrever o arquivo Braille");
  }

  return filePath;
};

export const generateEnhancedBrailleFile = async (
  text: string,
  id: string
): Promise<string> => {
  try {
    if (!text || text.trim() === "") {
      throw new Error("O texto para conversão em Braille está vazio");
    }

    const formattedText = await formatTextForBraille(text);
    console.log(
      "Texto formatado para Braille:",
      formattedText.substring(0, 100) + "..."
    );

    const brailleText = await textToBraille(formattedText);
    console.log(
      "Texto convertido para Braille (primeiros caracteres):",
      brailleText.substring(0, 100) + "..."
    );

    if (!brailleText || brailleText.trim() === "") {
      throw new Error("A conversão para Braille retornou texto vazio");
    }

    return generateBrailleFile(brailleText, id);
  } catch (error) {
    console.error("Erro ao gerar arquivo Braille aprimorado:", error);
    // Em caso de falha, tente gerar arquivo com o texto original
    if (text && text.trim() !== "") {
      console.log("Tentando gerar arquivo com texto original");
      return generateBrailleFile(text, id);
    }
    throw error;
  }
};
