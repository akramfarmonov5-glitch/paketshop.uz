const DEFAULT_TIMEOUT_MS = 15_000;

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const forwardAbort = () => controller.abort();

  if (init.signal?.aborted) {
    controller.abort();
  } else {
    init.signal?.addEventListener('abort', forwardAbort, { once: true });
  }

  const timeout = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (timedOut) {
      throw new Error('Server javobi kutilganidan uzoq davom etdi. Qayta urinib ko‘ring.');
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
    init.signal?.removeEventListener('abort', forwardAbort);
  }
}
