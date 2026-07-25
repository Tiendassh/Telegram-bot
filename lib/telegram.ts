export async function sendTelegramRequest(method: string, body: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  const url = `https://api.telegram.org/bot${token}/${method}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return response.json();
}

export async function sendMessage(chatId: string | number, text: string) {
  return sendTelegramRequest('sendMessage', {
    chat_id: chatId,
    text,
  });
}

export async function sendPhoto(chatId: string | number, photoUrlOrBase64: string, caption?: string) {
  const body: any = {
    chat_id: chatId,
    photo: photoUrlOrBase64,
  };
  if (caption) {
    body.caption = caption;
  }
  return sendTelegramRequest('sendPhoto', body);
}
