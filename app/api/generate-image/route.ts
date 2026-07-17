import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1", imageSize: "1K" },
      },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return NextResponse.json({ base64: part.inlineData.data });
        }
      }
    }
    return NextResponse.json({ error: "No image generated" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
