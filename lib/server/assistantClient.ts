import 'server-only';
import {
  formatWidgetReply,
  plainChatText,
  toAssistantHistory,
  wrapPcmAsWav,
  type ChatLanguage,
  type WidgetHistoryEntry,
} from '@/lib/domain/assistantChat';
import { assistantApiKey } from '@/lib/server/assistantAuth';

// Client for the AI assistant (paketshop-asistent). The storefront chat widget can hand its conversations to it
// (ASSISTANT_CHAT_PROXY=true); any failure returns null so the caller falls back to the built-in Gemini reply.
const CHAT_TIMEOUT_MS = 25_000;
const SPEECH_TIMEOUT_MS = 12_000;

export function assistantBaseUrl(): string {
  return (process.env.ASSISTANT_URL || 'https://paketshop-asistent.vercel.app').replace(/\/+$/, '');
}

export function isChatProxyEnabled(): boolean {
  return process.env.ASSISTANT_CHAT_PROXY === 'true' && assistantApiKey() !== null;
}

async function postToAssistant(path: string, body: unknown, clientIp: string, timeoutMs: number): Promise<Response> {
  return fetch(`${assistantBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assistantApiKey()}`,
      // Lets the assistant rate-limit per customer instead of per Vercel server address.
      'X-Client-IP': clientIp,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
    cache: 'no-store',
  });
}

async function assistantSpeech(text: string, clientIp: string): Promise<string | null> {
  try {
    const response = await postToAssistant('/api/tts', { text: text.slice(0, 1_800) }, clientIp, SPEECH_TIMEOUT_MS);
    if (!response.ok) return null;
    const data = await response.json() as { audio?: unknown };
    if (typeof data.audio !== 'string' || !data.audio) return null;
    return wrapPcmAsWav(Buffer.from(data.audio, 'base64')).toString('base64');
  } catch (error) {
    console.warn('AI assistant speech failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

export interface AssistantChatInput {
  message: string;
  history?: WidgetHistoryEntry[];
  sessionId?: string;
  language: ChatLanguage;
  customerName?: string;
  voiceMode: boolean;
  clientIp: string;
}

export interface AssistantChatResult {
  text: string;
  audioBase64: string | null;
}

export async function askAssistant(input: AssistantChatInput): Promise<AssistantChatResult | null> {
  try {
    const response = await postToAssistant('/api/chat', {
      message: input.message,
      history: toAssistantHistory(input.history),
      ...(input.sessionId ? { webSessionId: `site_${input.sessionId}` } : {}),
      language: input.language,
      ...(input.customerName ? { customerName: input.customerName } : {}),
    }, input.clientIp, CHAT_TIMEOUT_MS);

    if (!response.ok) {
      console.warn(`AI assistant answered ${response.status}; using the built-in reply`);
      return null;
    }

    const data = await response.json() as { reply?: unknown; product?: { url?: unknown } | null };
    const text = formatWidgetReply(data.reply, data.product?.url, input.language);
    if (!text) return null;

    // The voice reads the answer itself, not the page link appended to the written text.
    const spoken = plainChatText(String(data.reply));
    return { text, audioBase64: input.voiceMode ? await assistantSpeech(spoken, input.clientIp) : null };
  } catch (error) {
    console.warn('AI assistant request failed; using the built-in reply:', error instanceof Error ? error.message : error);
    return null;
  }
}
