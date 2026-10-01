// Pure helpers for the bridge between the storefront chat widget and the AI assistant (paketshop-asistent).

export type ChatLanguage = 'uz' | 'ru' | 'en';

export interface WidgetHistoryEntry {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

/** The widget keeps Gemini-style history (`parts[0].text`); the assistant expects `{ role, content }`. */
export function toAssistantHistory(history?: WidgetHistoryEntry[]): Array<{ role: 'user' | 'model'; content: string }> {
  return (history ?? [])
    .map((entry) => ({ role: entry.role, content: entry.parts[0]?.text ?? '' }))
    .filter((entry) => entry.content.trim());
}

/** The widget shows plain text: drop markdown the model sometimes adds and the assistant's internal tags. */
export function plainChatText(text: string): string {
  return text
    .replace(/\[(?:BUYURTMA|IMAGE|VIDEO):[^\]]*\]/gi, '')
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/__(.+?)__/gs, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const SITE_ORIGIN = 'https://www.paketshop.uz';

/** Product page link for a reply; only paketshop.uz pages are accepted, and Russian readers get the /ru/ page. */
export function sitePageUrl(candidate: unknown, language: ChatLanguage): string | null {
  if (typeof candidate !== 'string') return null;
  let url: URL;
  try {
    url = new URL(candidate.trim());
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || (host !== 'www.paketshop.uz' && host !== 'paketshop.uz')) return null;
  const path = language === 'ru' ? url.pathname.replace(/^\/uz(?=\/|$)/, '/ru') : url.pathname;
  return `${SITE_ORIGIN}${path}`;
}

const PRODUCT_PAGE_LABEL: Record<ChatLanguage, string> = {
  uz: 'Mahsulot sahifasi',
  ru: 'Страница товара',
  en: 'Product page',
};

const MAX_REPLY_LENGTH = 4000;

/** Final widget text: cleaned reply plus the product page link (when the assistant pointed at one). */
export function formatWidgetReply(reply: unknown, productUrl: unknown, language: ChatLanguage): string {
  if (typeof reply !== 'string') return '';
  let text = plainChatText(reply);
  if (!text) return '';
  const link = sitePageUrl(productUrl, language);
  if (link && !text.includes(link)) text += `\n\n${PRODUCT_PAGE_LABEL[language]}: ${link}`;
  return text.slice(0, MAX_REPLY_LENGTH);
}

/** Wraps raw 16-bit mono PCM (what the assistant's TTS returns) in a WAV container the browser can play. */
export function wrapPcmAsWav(pcm: Buffer, sampleRate = 24_000): Buffer {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export interface TextPart {
  text: string;
  href?: string;
}

const LINK_HOSTS = /^(?:(?:[a-z0-9-]+\.)*paketshop\.uz|t\.me)$/i;

/**
 * Splits chat text into plain and link parts so the widget can render clickable links.
 * Only paketshop.uz and t.me links become clickable; any other address stays plain text.
 */
export function splitTextLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let cursor = 0;
  for (const match of text.matchAll(/https?:\/\/[^\s<>"]+/g)) {
    const start = match.index ?? 0;
    const raw = match[0].replace(/[.,;:!?)\]]+$/, '');
    let href: string | null = null;
    try {
      const url = new URL(raw);
      if (LINK_HOSTS.test(url.hostname)) href = url.toString();
    } catch {
      href = null;
    }
    if (!href) continue;
    if (start > cursor) parts.push({ text: text.slice(cursor, start) });
    parts.push({ text: raw, href });
    cursor = start + raw.length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return parts.length ? parts : [{ text }];
}
