import fs from "fs";
import path from "path";

export const generateBrailleFile = async (
  text: string,
  id: string
): Promise<string> => {
  const brailleText = text.normalize();
  const outputDir = path.resolve(__dirname, "..", "exports");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const filePath = path.join(outputDir, `transcription-${id}.txt`);
  fs.writeFileSync(filePath, brailleText, { encoding: "utf-8" });

  return filePath;
};
