export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Telegram credentials missing on server' });
  }

  try {
    const { message } = req.body || {};
    
    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.description || 'Telegram API error');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to send Telegram message", error);
    return res.status(500).json({ error: error.message });
  }
}
