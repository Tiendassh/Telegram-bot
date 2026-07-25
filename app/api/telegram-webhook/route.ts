import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { sendTelegramRequest, sendMessage, sendPhoto, sendVideo } from "@/lib/telegram";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

export async function POST(req: NextRequest) {
  try {
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
        const prompt = args.join(' ');
        await sendMessage(chatId, `Generating video for: "${prompt}"... This might take a few minutes.`);

        try {
          let operation = await ai.models.generateVideos({
            model: 'veo-3.1-lite-generate-preview',
            prompt: prompt,
            config: {
              numberOfVideos: 1,
              resolution: '1080p',
              aspectRatio: '16:9'
            }
          });

          // Polling loop
          let done = false;
          let videoUri = "";
          const op = new GenerateVideosOperation();
          op.name = operation.name;
          
          while (!done) {
              await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10s
              const updated = await ai.operations.getVideosOperation({ operation: op });
              if (updated.done) {
                 done = true;
                 videoUri = updated.response?.generatedVideos?.[0]?.video?.uri || "";
              }
          }

          if (videoUri) {
            const videoRes = await fetch(videoUri, {
              headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY! }, 
            });
            const arrayBuffer = await videoRes.arrayBuffer();
            
            await sendVideo(chatId, arrayBuffer);
          } else {
            await sendMessage(chatId, `Failed to generate video. Please try again.`);
          }
        } catch (error) {
          console.error("Error generating video:", error);
          await sendMessage(chatId, `Failed to generate video. Error occurred.`);
        }
      } else if (command === '/ban' && message.reply_to_message) {
        try {
          await sendTelegramRequest('banChatMember', {
            chat_id: chatId,
            user_id: message.reply_to_message.from.id,
          });
          await sendMessage(chatId, "User banned.");
        } catch (error) {
          console.error("Error banning user:", error);
          await sendMessage(chatId, "Failed to ban user.");
        }
      } else if (command === '/kick' && message.reply_to_message) {
        try {
          await sendTelegramRequest('unbanChatMember', {
            chat_id: chatId,
            user_id: message.reply_to_message.from.id,
          });
          await sendMessage(chatId, "User kicked.");
        } catch (error) {
          console.error("Error kicking user:", error);
          await sendMessage(chatId, "Failed to kick user.");
        }
      } else if (command === '/post') {
        try {
          await sendMessage(chatId, args.join(' '));
        } catch (error) {
          console.error("Error sending post:", error);
        }
      }
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unhandled error in Telegram webhook:", error);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
