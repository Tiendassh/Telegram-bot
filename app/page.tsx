import WebhookButton from './WebhookButton';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#F0F0F0] font-sans p-10 flex flex-col items-center justify-center">
      <header className="max-w-2xl w-full text-center space-y-4 mb-16 border-b border-white/10 pb-12">
        <h1 className="text-[80px] font-black leading-[0.8] tracking-tighter uppercase">Telegram<br />Media<br />Bot</h1>
        <p className="pt-6 text-sm opacity-60 tracking-widest uppercase">
          Your AI-powered assistant for generating images directly in Telegram.
        </p>
      </header>

      <section className="max-w-2xl w-full border border-white/10 p-10 space-y-8">
        <h2 className="text-4xl font-black uppercase tracking-tighter">How to use:</h2>
        <ol className="list-decimal list-inside space-y-4 text-[#F0F0F0]/70">
          <li>Set up your bot via <a href="https://t.me/BotFather" className="text-white hover:underline" target="_blank" rel="noopener noreferrer">BotFather</a>.</li>
          <li>Configure your <code className="bg-white/5 px-2 py-0.5 rounded text-sm font-mono text-white">TELEGRAM_BOT_TOKEN</code> in your environment variables.</li>
          <li>Set your webhook URL to <code className="bg-white/5 px-2 py-0.5 rounded text-sm font-mono text-white">{process.env.APP_URL}/api/telegram-webhook</code>.</li>
          <li>In Telegram, send: <code className="bg-white/5 px-2 py-0.5 rounded text-sm font-mono text-white">/image [your prompt]</code></li>
        </ol>
        
        <WebhookButton />
      </section>
    </main>
  );
}
