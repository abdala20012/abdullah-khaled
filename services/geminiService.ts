
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchQuestion(level: number): Promise<Question> {
  const difficultyLabel = level <= 5 ? "سهلة" : level <= 10 ? "متوسطة" : "صعبة جداً";
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `أنت خبير في الشؤون الإسلامية. قم بإنشاء سؤال ديني واحد للمستوى ${level} (صعوبة: ${difficultyLabel}) لمسابقة 'من سيربح المليون'.
    يجب أن يكون السؤال دقيقاً من الناحية التاريخية والشرعية.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "نص السؤال الديني" },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "أربعة خيارات، واحد فقط صحيح"
          },
          correctIndex: { type: Type.INTEGER, description: "مؤشر الإجابة الصحيحة (0-3)" },
          explanation: { type: Type.STRING, description: "شرح مختصر للإجابة" }
        },
        required: ["id", "text", "options", "correctIndex", "explanation"]
      }
    }
  });

  const question = JSON.parse(response.text) as Question;
  question.difficulty = level;
  return question;
}

export async function callFriendAdvice(question: Question): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `أنت صديق يتصل به متسابق في برنامج 'من سيربح المليون'. المتسابق يسألك عن هذا السؤال الديني: "${question.text}".
    الخيارات هي: ${question.options.join(", ")}. 
    رد كصديق بلهجة ودودة ومحترمة، أخبره بما تعتقد أنه الإجابة الصحيحة مع ذكر سبب بسيط جداً. لا تكن متأكداً بنسبة 100% دائماً لإضافة الإثارة.`,
    config: {
      systemInstruction: "رد باللغة العربية بأسلوب مشوق وقصير."
    }
  });

  return response.text || "عذراً، لا يحضرني الجواب حالياً ولكن أظن الخيار الثاني هو الأقرب.";
}
