
import { GoogleGenAI } from "@google/genai";

// Inicialização segura - o SDK requer a chave, mas lidaremos com a ausência dela graciosamente
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return null;
  return new GoogleGenAI({ apiKey });
};

export const generateAiInviteCode = async (businessName: string): Promise<string> => {
  const ai = getAiClient();
  
  if (!ai) {
    // Fallback "IA-Simulada" caso não haja API Key
    const prefixes = ['PRO', 'ELITE', 'PARTNER', 'GOLD', 'DECOR'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const year = new Date().getFullYear();
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${randomPrefix}-${year}-${randomSuffix}`;
  }

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
    // Fallback secundário
    return `INVITE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }
};
