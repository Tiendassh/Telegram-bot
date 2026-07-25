export async function sendTelegramRequest(method: string, body: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  const url = `https://api.telegram.org/bot${token}/${method}`;
  
  let options: RequestInit = {
    method: 'POST',
  };

  if (body instanceof FormData) {
    options.body = body;
  } else {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
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

export async function sendVideo(chatId: string | number, videoBuffer: ArrayBuffer, caption?: string) {
  const formData = new FormData();
  formData.append('chat_id', chatId.toString());
  formData.append('video', new Blob([videoBuffer], { type: 'video/mp4' }), 'video.mp4');
  if (caption) {
    formData.append('caption', caption);
  }
  return sendTelegramRequest('sendVideo', formData);
}
