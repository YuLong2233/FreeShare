
import { GoogleGenAI, Type } from "@google/genai";
import { Resource } from "../types";

export const findResourcesWithAi = async (query: string, resources: Resource[]): Promise<number[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const resourceContext = resources.map(r => ({
    id: r.id,
    title: r.title,
    desc: r.desc,
    category: r.category,
    tags: r.tags
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `用户正在搜索资源，查询词为: "${query}"。
      根据以下资源列表，仅返回与查询最相关的资源 ID 组成的 JSON 数组。
      
      资源列表: ${JSON.stringify(resourceContext)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.NUMBER
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return [];
  } catch (error) {
    console.error("AI 搜索失败:", error);
    return [];
  }
};
