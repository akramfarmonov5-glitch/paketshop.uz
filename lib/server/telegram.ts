import 'server-only';

export async function sendTelegramHtml(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`Telegram notification failed (${response.status})`);
  return true;
}
