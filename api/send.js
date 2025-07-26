// File: /api/send.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  // Ambil bot token & chat id dari environment Vercel
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    res.status(500).json({ ok: false, error: 'Token/Chat ID belum diatur' });
    return;
  }

  // Cek isi body
  const { message } = req.body || {};
  if (!message) {
    res.status(400).json({ ok: false, error: 'Pesan tidak ada' });
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const tgRes = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    const data = await tgRes.json();
    if (data.ok) {
      res.status(200).json({ ok: true });
    } else {
      res.status(500).json({ ok: false, error: 'Gagal kirim Telegram', tg: data });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Network error' });
  }
}