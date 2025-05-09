import { GoogleGenerativeAI } from "@google/generative-ai";
export { generateEnhancedBrailleFile } from "./brailleService";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateSummary(
  text: string,
  maxLength: number = 200
): Promise<string> {
  try {
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY não está configurado no ambiente");
    }
    const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
    const prompt = `
    Resumo do seguinte texto em português, com no máximo ${maxLength} palavras. 
    Foque nos pontos principais e mantenha a essência da informação.
    
    Texto: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return summary.trim();
  } catch (error) {
    console.error("Erro ao gerar resumo com Gemini:", error);
    throw new Error(`Falha ao gerar resumo: ${(error as Error).message}`);
  }
}

export async function enhanceTranscription(
  rawTranscription: string
): Promise<string> {
  try {
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY não está configurado no ambiente");
    }

    const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });

    const prompt = `
    Melhore a seguinte transcrição de áudio em português. 
    Corrija erros gramaticais, pontuação e formatação. 
    Mantenha o significado original e o conteúdo intacto.
    
    Transcrição original: "${rawTranscription}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Erro ao aprimorar transcrição com Gemini:", error);
    return rawTranscription;
  }
}

export async function textToBraille(text: string): Promise<string> {
  try {
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY não está configurado no ambiente");
    }

    const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });

    const prompt = `
    Converta o seguinte texto para sua representação em braille utilizando caracteres Unicode.
    Siga as regras do sistema braille brasileiro.
    
    Texto: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Texto gerado pela Gemini (Braille):", response.text());
    return response.text().trim();
  } catch (error) {
    console.error("Erro ao converter para braille com Gemini:", error);
    throw new Error(
      `Falha ao converter para braille: ${(error as Error).message}`
    );
  }
}
