import { NextRequest, NextResponse } from "next/server";
import { sendTelegramRequest, sendMessage, sendPhoto } from "@/lib/telegram";

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

      const res = await fetch(`${process.env.APP_URL}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.base64) {
        await sendPhoto(chatId, `data:image/png;base64,${data.base64}`);
      } else {
        await sendMessage(chatId, `Failed to generate image. Please try again.`);
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
