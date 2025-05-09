import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY não está configurado no ambiente");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateSummary(
  text: string,
  maxLength: number = 200
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
    Resuma o seguinte texto em português com no máximo ${maxLength} palavras.
    Foque nos pontos principais e mantenha a essência da informação.
   
    Texto: "${text}"
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Erro ao gerar resumo com Gemini:", error);
    throw new Error(`Falha ao gerar resumo: ${(error as Error).message}`);
  }
}

export async function enhanceTranscription(
  rawTranscription: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
    if (!text || text.trim() === "") {
      throw new Error("Texto vazio não pode ser convertido para Braille");
    }

    // Limitar o tamanho do texto para evitar exceder limites da API
    const maxLength = 10000;
    const truncatedText =
      text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
    Converta o seguinte texto para sua representação em braille utilizando caracteres Unicode.
    Siga as regras do sistema braille brasileiro.
    NÃO INCLUA NENHUM TEXTO EXPLICATIVO, APENAS RETORNE O TEXTO EM BRAILLE.
    
    Texto para converter: "${truncatedText}"
    `;

    console.log("Enviando prompt para conversão em Braille...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const brailleText = response.text().trim();

    console.log(
      `Texto convertido para Braille (${brailleText.length} caracteres)`
    );

    if (!brailleText || brailleText.length === 0) {
      throw new Error("API retornou texto Braille vazio");
    }

    return brailleText;
  } catch (error) {
    console.error("Erro ao converter para braille com Gemini:", error);
    throw new Error(
      `Falha ao converter para braille: ${(error as Error).message}`
    );
  }
}

// Exportamos também a função para uso em outros serviços
export { generateEnhancedBrailleFile } from "./brailleService";
