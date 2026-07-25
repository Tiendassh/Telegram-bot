'use client';

import { useState } from 'react';

export default function WebhookButton() {
  const [status, setStatus] = useState<string>('');

  const handleSetWebhook = async () => {
    setStatus('Setting webhook...');
    try {
      const res = await fetch('/api/set-webhook');
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus('Webhook set successfully!');
      } else {
        setStatus(`Error: ${data.description || data.error || 'Failed to set webhook'}`);
      }
    } catch (e) {
      setStatus(`Error: ${String(e)}`);
    }
  };

  return (
    <div className="mt-8 flex flex-col items-start gap-4">
      <button 
        onClick={handleSetWebhook}
        className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors"
      >
        Set Webhook Automatically
      </button>
      {status && <p className="text-sm text-gray-400 font-mono">{status}</p>}
    </div>
  );
}
