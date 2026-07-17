import { NextRequest, NextResponse } from "next/server";

async function sendTelegram(method: string, body: any) {
  return fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function POST(req: NextRequest) {
  const update = await req.json();
  const message = update.message;
  
  if (message && message.text) {
    const text = message.text as string;
    const chatId = message.chat.id;
    const [command, ...args] = text.split(' ');
    
    if (command === '/image') {
      const prompt = args.join(' ');
      const res = await fetch(`${process.env.APP_URL}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.base64) {
        await sendTelegram('sendPhoto', {
          chat_id: chatId,
          photo: `data:image/png;base64,${data.base64}`,
        });
      }
    } else if (command === '/video') {
      await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: `Video generation requested: ${args.join(' ')}. This feature is under development.`,
      });
    } else if (command === '/ban' && message.reply_to_message) {
      await sendTelegram('banChatMember', {
        chat_id: chatId,
        user_id: message.reply_to_message.from.id,
      });
      await sendTelegram('sendMessage', { chat_id: chatId, text: "User banned." });
    } else if (command === '/kick' && message.reply_to_message) {
      await sendTelegram('unbanChatMember', {
        chat_id: chatId,
        user_id: message.reply_to_message.from.id,
      });
      await sendTelegram('sendMessage', { chat_id: chatId, text: "User kicked." });
    } else if (command === '/post') {
      await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: args.join(' '),
      });
    }
  }
  
  return NextResponse.json({ ok: true });
}
