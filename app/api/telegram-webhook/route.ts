import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const update = await req.json();
  const message = update.message;
  
  if (message && message.text) {
    const text = message.text;
    const chatId = message.chat.id;
    
    if (text.startsWith('/image ')) {
      const prompt = text.replace('/image ', '');
      
      // Trigger image generation
      const res = await fetch(`${process.env.APP_URL}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await res.json();
      
      if (data.base64) {
        // Send back to Telegram
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            photo: `data:image/png;base64,${data.base64}`,
          }),
        });
      }
    }
  }
  
  return NextResponse.json({ ok: true });
}
