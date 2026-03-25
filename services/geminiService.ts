
import { GoogleGenAI, Type } from "@google/genai";
import { CSVRow } from "../types";

const JSON_SYSTEM_INSTRUCTION = `
You are an expert OCR and Data Extraction specialist.
Your goal is to extract the content of a study guide page as a sequence of distinct blocks for a JSON structure.
RULES:
1. **Atomic Extraction**: Do NOT merge separate paragraphs.
2. **Sequence**: Maintain exact top-to-bottom order.
3. **Classification**: 'title', 'text', or 'question'.
`;

const CSV_SYSTEM_INSTRUCTION = `
You are an expert OCR specialist. Your goal is to map the content of a study guide page into a specific CSV structure with fixed columns.
The structure must follow this flow:
- lesson_title: The main title of the lesson/page.
- text_1, text_2, text_3: The first three blocks of introductory text.
- question_1: The first question or prompt found.
- text_4: Text between question 1 and 2.
- question_2: The second question.
- text_5: Text between question 2 and 3.
- question_3: The third question.
- text_6: Text between question 3 and 4.
- question_4: The fourth question.
- text_7, text_8: Final concluding blocks of text.

If a block is not found, leave it empty. Ensure questions and texts are separated correctly according to the page layout. Do not include answers in the questions.
`;

const jsonResponseSchema = {
  type: Type.OBJECT,
  properties: {
    blocks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "title, text, question" },
          content: { type: Type.STRING, description: "The text content." }
        },
        required: ["type", "content"],
      },
    },
  },
};

const csvResponseSchema = {
  type: Type.OBJECT,
  properties: {
    lesson_title: { type: Type.STRING },
    text_1: { type: Type.STRING },
    text_2: { type: Type.STRING },
    text_3: { type: Type.STRING },
    question_1: { type: Type.STRING },
    text_4: { type: Type.STRING },
    question_2: { type: Type.STRING },
    text_5: { type: Type.STRING },
    question_3: { type: Type.STRING },
    text_6: { type: Type.STRING },
    question_4: { type: Type.STRING },
    text_7: { type: Type.STRING },
    text_8: { type: Type.STRING },
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const result = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview", 
    contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/jpeg", data: base64Image } }, { text: "Extract content as blocks." }] }],
    config: { systemInstruction: JSON_SYSTEM_INSTRUCTION, responseMimeType: "application/json", responseSchema: jsonResponseSchema },
  });

  let fullText = '';
  for await (const chunk of result) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    fullText += chunk.text;
    onProgress?.(50); 
  }
  return JSON.parse(fullText).blocks || [];
};

export const extractCSVDataFromImage = async (
  base64Image: string,
  signal?: AbortSignal,
  onProgress?: (percentage: number) => void
): Promise<Partial<CSVRow>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  onProgress?.(10);

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{
      role: "user",
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Analyze the image and fill the CSV structure. Distribute texts and questions according to the schema provided." }
      ]
    }],
    config: {
      systemInstruction: CSV_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: csvResponseSchema,
    },
  });

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  onProgress?.(100);
  
  try {
    return JSON.parse(result.text);
  } catch (e) {
    console.error("Failed to parse CSV extraction result", e);
    return {};
  }
};
