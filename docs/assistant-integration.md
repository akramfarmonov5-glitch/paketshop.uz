# AI assistant integration

paketshop.uz is connected to the standalone AI assistant (`paketshop-asistent`, <https://paketshop-asistent.vercel.app>,
also reachable as a Telegram bot and Mini App). The storefront stays the source of truth for products, prices and
customer requests; the assistant consults and hands requests over.

```
            catalogue feed (GET, key)                  customer request (POST, key)
 paketshop.uz  ──────────────────────▶  assistant  ──────────────────────▶  paketshop.uz /api/leads
 (Prisma/Postgres)                      (Neon + pgvector)                    (CRM lead + Telegram alert)
                                            assistant  ◀──────────────────────  paketshop.uz /api/assistant/leads
                                                          lead status (GET, key)  (status set by the managers)

 widget ──▶ /api/gemini ──(ASSISTANT_CHAT_PROXY=true)──▶ assistant /api/chat   (falls back to built-in Gemini)
```

Everything is **off until `ASSISTANT_API_KEY` is set** and is backward compatible: without the key the endpoints below
answer 503/401 and `/api/leads` behaves exactly as before.

## Configuration

| Variable | Where | Meaning |
| --- | --- | --- |
| `ASSISTANT_API_KEY` | site **and** assistant | Shared secret, at least 24 random characters (`openssl rand -hex 32`). Both Vercel projects must hold the same value. |
| `ASSISTANT_URL` | site (optional) | Assistant base URL; defaults to `https://paketshop-asistent.vercel.app`. |
| `ASSISTANT_CHAT_PROXY` | site (optional) | `true` sends the storefront chat widget through the assistant. Anything other than `true` keeps the built-in Gemini reply. |
| `SITE_URL` | assistant (optional) | Storefront base URL; defaults to `https://www.paketshop.uz` (use `www` — the apex domain redirects). |

Rotate the key by changing it in both projects and redeploying both.

## Endpoints

### `GET /api/assistant/catalog`

`Authorization: Bearer <ASSISTANT_API_KEY>`. Returns active products only.

| Query | Default | Meaning |
| --- | --- | --- |
| `limit` | 100 | Page size, 1–200. |
| `cursor` | – | `nextCursor` of the previous page (a product SKU). |
| `updatedAfter` | – | ISO date; only products changed after it. |

Response: `{ products: AssistantProduct[], nextCursor: string | null, generatedAt: string }`. The product shape lives in
`lib/domain/assistantCatalog.ts` (`AssistantProduct`): SKU, legacy SKU, absolute uz/ru page URLs, names, short and long
descriptions (plain text, no cross-language fallback), category, `priceMode`, `publicPrice` (per sale unit; `null` for
`REQUEST_ONLY`/`LOGIN_REQUIRED`), approximate piece price, availability enum, units per pack/carton, minimum order and
step, dimensions, up to four image URLs, active variants, public price tiers (customer-group tiers and tiers outside
their start/end dates are skipped) and timestamps.

Never exposed: `purchasePrice`, `minimumAllowedPrice`, `resellerPrice`, `organizationPrice`, supplier data. The query
uses an explicit `select`, and `assistantCatalog.test.ts` asserts that these values cannot appear in the output.

### `POST /api/leads` (existing endpoint)

A request carrying the bearer key is treated as the assistant:

- it uses its own rate-limit bucket (120 per 10 minutes) instead of the per-IP limit of 6, because every customer
  request reaches the site from the assistant's servers;
- the response additionally contains `notified` — whether the Telegram alert to the manager was sent from the site.
  When it is `false` the assistant alerts the manager itself.

The assistant sends `type: "chat"` (shown as "AI chat"), the customer's name and phone (normalised to `+998…`), city,
the request number, quote, delivery and comments in `note`, the requested items in `products`, and
`attribution.source = "AI yordamchi (Telegram | Veb | Sayt)"`. Honeypot and timing checks do not apply to it (it sends
neither field), the schema validation does.

### `GET /api/assistant/leads`

`Authorization: Bearer <ASSISTANT_API_KEY>`. `?ids=<lead id>,<lead id>` — the `leadId`s the assistant received from
`POST /api/leads` (up to 50; malformed ids are ignored). Returns only leads the assistant created
(`source` starting with `AI yordamchi`), so it cannot be used to look up other CRM entries:

```json
{ "leads": [{ "id": "…", "status": "CONTACTED", "lostReason": null, "createdAt": "…", "updatedAt": "…" }] }
```

Status fields only (`NEW`, `CONTACTED`, `IN_PROGRESS`, `WON`, `LOST`) — no names, phones or notes; responses are
`no-store`. The assistant uses it to answer "where is my request?" with the status the managers set in the CRM.

### `POST /api/gemini` (existing endpoint, widget chat)

When `ASSISTANT_CHAT_PROXY=true` and the key is set, non-admin requests are forwarded to the assistant's `/api/chat`
(`webSessionId = site_<sessionId>`, `language`, `customerName`, `X-Client-IP`). The reply is converted to plain text,
the product page link is appended, and for `voiceMode` the assistant's `/api/tts` audio is wrapped into WAV. On a
timeout (25 s), an error status or an empty reply the built-in Gemini answer is used instead, so the widget keeps
working when the assistant is down. Admin requests (`systemInstruction`/`jsonMode`) are never forwarded.

The widget stores a random `sessionId` in `localStorage` (`paketshop_chat_session`) so the assistant can remember the
conversation; it contains no personal data. It introduces itself as the assistant does (Malika · AI yordamchi /
Малика · AI-помощник) and shows its greeting, labels and error text in the page language (uz/ru).

The built-in voice reply tries `GEMINI_TTS_MODEL` (if set), then `gemini-3.1-flash-tts-preview`, then
`gemini-2.5-flash-preview-tts` (being retired), and answers without audio when none of them works.

## Rollout order

1. Generate the secret and set `ASSISTANT_API_KEY` in both Vercel projects.
2. Merge this branch and let the site redeploy; redeploy the assistant.
3. Check `GET /api/assistant/catalog` and `GET /api/assistant/leads` with the key (200) and without it (401).
4. In Telegram run `/sync apply` on the assistant bot: the catalogue now comes from the feed instead of HTML scraping.
5. Send a test request through the assistant and confirm the lead appears in the admin CRM and the manager alert arrives
   once.
6. Set `ASSISTANT_CHAT_PROXY=true` and redeploy to move the widget chat to the assistant.

Rollback: set `ASSISTANT_CHAT_PROXY` to anything but `true` (widget returns to the built-in reply), or remove
`ASSISTANT_API_KEY` to close every assistant endpoint at once.
