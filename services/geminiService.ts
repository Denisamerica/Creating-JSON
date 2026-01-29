
import { GoogleGenAI, Type } from "@google/genai";
import { CSVRow } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert OCR and Data Extraction specialist.
Your goal is to extract the content of a study guide page as a sequence of distinct blocks.

EXTRACTION RULES:
1. **Atomic Extraction**: Do NOT merge separate paragraphs into a single block. Each paragraph or section must be its own 'text' block.
2. **Sequence**: Maintain the exact top-to-bottom order of the page.
3. **Classification**:
   - 'title': Daily lesson headings or main titles.
   - 'text': Reading content, paragraphs, or explanatory notes.
   - 'question': Direct questions that require user input.

DO NOT try to fit the data into a fixed table structure here. Just provide the raw sequence of what you see on the page.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    blocks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { 
            type: Type.STRING, 
            description: "One of: title, text, question" 
          },
          content: { 
            type: Type.STRING, 
            description: "The actual text content of the block." 
          }
        },
        required: ["type", "content"],
      },
    },
  },
};

export interface ExtractedBlock {
  type: 'title' | 'text' | 'question';
  content: string;
}

export const processImageWithGemini = async (
  base64Image: string, 
  signal?: AbortSignal,
  onProgress?: (percentage: number) => void
): Promise<ExtractedBlock[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const ESTIMATED_CHAR_LENGTH = 2000;

  try {
    onProgress?.(5);

    const result = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview", 
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: "Extract all content from this page as a sequential list of blocks. Keep every paragraph separate. Identify titles, reading texts, and questions.",
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    let fullText = '';
    for await (const chunk of result) {
        if (signal?.aborted) {
            throw new DOMException("Aborted", "AbortError");
        }
        const chunkText = chunk.text;
        if (chunkText) {
            fullText += chunkText;
            const progress = 10 + (Math.min(1, fullText.length / ESTIMATED_CHAR_LENGTH) * 85); 
            onProgress?.(Math.round(progress));
        }
    }

    onProgress?.(98); 
    let text = fullText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(text);
    return parsed.blocks || [];

  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
