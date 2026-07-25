import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.APP_URL;

  if (!token || !appUrl) {
    return NextResponse.json({ error: "Missing TELEGRAM_BOT_TOKEN or APP_URL in environment variables" }, { status: 400 });
  }

  const webhookUrl = `${appUrl}/api/telegram-webhook`;
  const setWebhookApiUrl = `https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`;

  try {
    const res = await fetch(setWebhookApiUrl);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
