import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { sendTelegramRequest, sendMessage, sendPhoto } from "@/lib/telegram";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

export async function POST(req: NextRequest) {
  const update = await req.json();
  const message = update.message;
  
  if (message && message.text) {
    const text = message.text as string;
    const chatId = message.chat.id;
    const [command, ...args] = text.split(' ');
    
    if (command === '/image') {
      const prompt = args.join(' ');
      
      // Notify user that processing started
      await sendMessage(chatId, `Generating image for: "${prompt}"...`);

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: { parts: [{ text: prompt }] },
          config: {
            imageConfig: { aspectRatio: "1:1", imageSize: "1K" },
          },
        });

        const candidate = response.candidates?.[0];
        let base64Image: string | null | undefined = null;
        
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              base64Image = part.inlineData.data;
              break;
            }
          }
        }
        
        if (base64Image) {
          await sendPhoto(chatId, `data:image/png;base64,${base64Image}`);
        } else {
          await sendMessage(chatId, `Failed to generate image. Please try again.`);
        }
      } catch (error) {
        console.error("Error generating image:", error);
        await sendMessage(chatId, `Failed to generate image. Error occurred.`);
      }
    } else if (command === '/video') {
      await sendMessage(chatId, `Video generation requested: ${args.join(' ')}. This feature is under development.`);
    } else if (command === '/ban' && message.reply_to_message) {
      await sendTelegramRequest('banChatMember', {
        chat_id: chatId,
        user_id: message.reply_to_message.from.id,
      });
      await sendMessage(chatId, "User banned.");
    } else if (command === '/kick' && message.reply_to_message) {
      await sendTelegramRequest('unbanChatMember', {
        chat_id: chatId,
        user_id: message.reply_to_message.from.id,
      });
      await sendMessage(chatId, "User kicked.");
    } else if (command === '/post') {
      await sendMessage(chatId, args.join(' '));
    }
  }
  
  return NextResponse.json({ ok: true });
}
