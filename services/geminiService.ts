
import { GoogleGenAI, Type } from "@google/genai";
import { BudgetItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBudget = async (theme: string, currentItems: BudgetItem[]) => {
  const prompt = `Analise este orçamento de decoração para uma festa com o tema "${theme}". 
  Itens atuais: ${JSON.stringify(currentItems)}.
  
  Sugira 3 novos itens que não podem faltar para este tema e estime custos médios (em BRL). 
  Também dê uma dica de economia para um dos itens existentes.
  Retorne um JSON estruturado.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  category: { type: Type.STRING },
                  estimatedCost: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ["item", "category", "estimatedCost", "reason"]
              }
            },
            savingTip: { type: Type.STRING }
          },
          required: ["suggestions", "savingTip"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
