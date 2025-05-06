import fs from "fs";
import path from "path";
import { textToBraille } from "./geminiService";

export const generateBrailleFile = async (
  text: string,
  id: string
): Promise<string> => {
  const brailleText = text.normalize();

  const outputDir = path.resolve(__dirname, "..", "exports");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `transcription-${id}.txt`);

  fs.writeFileSync(filePath, brailleText, { encoding: "utf-8" });

  return filePath;
};

export const formatTextForBraille = async (text: string): Promise<string> => {
  let formattedText = text
    .replace(/\s+/g, " ") 
    .replace(/\n+/g, "\n") 
    .trim();

  const maxLineLength = 40;
  const lines = [];
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


export const generateEnhancedBrailleFile = async (
  text: string,
  id: string
): Promise<string> => {
  try {
    const formattedText = await formatTextForBraille(text);

    const brailleText = await textToBraille(formattedText);

    return generateBrailleFile(brailleText, id);
  } catch (error) {
    console.error("Erro ao gerar arquivo braille aprimorado:", error);


    return generateBrailleFile(text, id);
  }
};
