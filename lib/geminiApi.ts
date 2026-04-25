type GeminiRole = 'user' | 'model';

interface GeminiHistoryEntry {
  role: GeminiRole;
  parts: { text: string }[];
}

interface GeminiRequestOptions {
  message: string;
  systemInstruction?: string;
  history?: GeminiHistoryEntry[];
  jsonMode?: boolean;
}

export async function requestGeminiText({
  message,
  systemInstruction,
  history,
  jsonMode = false,
}: GeminiRequestOptions): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      systemInstruction,
      history,
      jsonMode,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Gemini API xatosi');
  }

  return data.text || '';
}

export async function requestGeminiJson<T>(
  options: Omit<GeminiRequestOptions, 'jsonMode'>
): Promise<T> {
  const text = await requestGeminiText({ ...options, jsonMode: true });
  return JSON.parse(text) as T;
}
