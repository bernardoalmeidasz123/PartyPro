
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAiInviteCode = async (businessName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um código de convite único e profissional para fornecedores de eventos. 
      O nome do atelier é "${businessName}". 
      O código deve ter entre 8 e 12 caracteres, ser em letras maiúsculas, pode conter hifens.
      Exemplos de estilo: ATELIER-PRO-2026, ELITE-DECOR-88.
      Retorne APENAS o código, sem explicações.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Erro ao gerar código via IA:", error);
    // Fallback caso a API falhe
    return `INVITE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }
};
