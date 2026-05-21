import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '../../../lib/rateLimit';

export async function POST(req: NextRequest) {
  // 1. Get client IP address
  const ip = (req as any).ip || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  // 2. Limit to 5 requests per 60 seconds (1 minute) per IP
  const rateLimit = checkRateLimit(`telegram:${ip}`, 5, 60 * 1000);

  if (!rateLimit.allowed) {
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', '5');
    headers.set('X-RateLimit-Remaining', '0');
    headers.set('X-RateLimit-Reset', String(rateLimit.resetAt));
    headers.set('Retry-After', String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)));

    return NextResponse.json(
      { error: "Siz juda ko'p so'rov yubordingiz. Iltimos, birozdan keyin qayta urining." },
      { 
        status: 429,
        headers
      }
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      { error: 'Telegram credentials missing on server' },
      { status: 500 }
    );
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
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

    // Set rate limit headers in successful responses too
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', '5');
    headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    headers.set('X-RateLimit-Reset', String(rateLimit.resetAt));

    return NextResponse.json({ success: true }, { headers });
  } catch (error: any) {
    console.error('Failed to send Telegram message', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
