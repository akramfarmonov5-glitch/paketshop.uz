export interface PriceTierInput {
  minQuantity: number;
  maxQuantity?: number | null;
  price: number;
}

export function normalizeUzbekPhone(value: unknown): string | null {
  let digits = String(value ?? '').replace(/\D/g, '');

  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 9) digits = `998${digits}`;

  return /^998\d{9}$/.test(digits) ? `+${digits}` : null;
}

export function calculateUnitsPerCarton(
  unitsPerPack: number,
  packsPerCarton: number,
  override?: number | null,
): number {
  if (override !== undefined && override !== null) {
    if (!Number.isInteger(override) || override < 1) throw new Error('Invalid carton override');
    return override;
  }

  if (!Number.isInteger(unitsPerPack) || unitsPerPack < 1) throw new Error('Invalid units per pack');
  if (!Number.isInteger(packsPerCarton) || packsPerCarton < 1) throw new Error('Invalid packs per carton');
  return unitsPerPack * packsPerCarton;
}

export function isValidOrderQuantity(
  quantity: number,
  minimumOrderQuantity: number,
  orderStep: number,
): boolean {
  if (![quantity, minimumOrderQuantity, orderStep].every(Number.isInteger)) return false;
  if (quantity < minimumOrderQuantity || minimumOrderQuantity < 1 || orderStep < 1) return false;
  return (quantity - minimumOrderQuantity) % orderStep === 0;
}

export function selectTierPrice(
  basePrice: number,
  quantity: number,
  tiers: PriceTierInput[],
): number {
  const match = [...tiers]
    .sort((a, b) => b.minQuantity - a.minQuantity)
    .find((tier) => quantity >= tier.minQuantity && (tier.maxQuantity == null || quantity <= tier.maxQuantity));

  return match?.price ?? basePrice;
}

export function escapeTelegramHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export interface AttributionSummaryInput {
  source?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  first?: { source?: string | null } | null;
  last?: { source?: string | null } | null;
}

export function summarizeAttribution(attribution?: AttributionSummaryInput | null): string {
  if (!attribution) return 'direct';

  const first = attribution.first?.source?.trim();
  const last = attribution.last?.source?.trim()
    || attribution.source?.trim()
    || attribution.utm_source?.trim();
  const campaign = attribution.utm_campaign?.trim();

  let summary: string;
  if (first && last && first !== last) summary = `${first} → ${last}`;
  else summary = last || first || 'direct';

  return campaign ? `${summary} (${campaign})` : summary;
}

interface TelegramItem {
  sku: string;
  name: string;
  quantity: number;
  saleUnit: string;
  variant?: string | null;
  url?: string | null;
}

export function buildTelegramOrderMessage(input: {
  orderNumber: string;
  customerName: string;
  phone: string;
  customerType?: string | null;
  telegram?: string | null;
  region?: string | null;
  address?: string | null;
  paymentMethod?: string | null;
  note?: string | null;
  source?: string | null;
  items: TelegramItem[];
}): string {
  const lines = input.items.map((item, index) => {
    const variant = item.variant ? ` — ${escapeTelegramHtml(item.variant)}` : '';
    const url = item.url ? `\n   ${escapeTelegramHtml(item.url)}` : '';
    return `${index + 1}. <b>${escapeTelegramHtml(item.sku)}</b> — ${escapeTelegramHtml(item.name)}${variant}\n   ${item.quantity} ${escapeTelegramHtml(item.saleUnit)}${url}`;
  });

  return [
    '<b>YANGI BUYURTMA SO‘ROVI</b>',
    '',
    `Raqam: <code>${escapeTelegramHtml(input.orderNumber)}</code>`,
    `Mijoz: ${escapeTelegramHtml(input.customerName)}`,
    `Telefon: ${escapeTelegramHtml(input.phone)}`,
    ...(input.customerType ? [`Mijoz turi: ${escapeTelegramHtml(input.customerType)}`] : []),
    ...(input.telegram ? [`Telegram: ${escapeTelegramHtml(input.telegram)}`] : []),
    ...(input.region ? [`Hudud: ${escapeTelegramHtml(input.region)}`] : []),
    ...(input.address ? [`Manzil: ${escapeTelegramHtml(input.address)}`] : []),
    ...(input.paymentMethod ? [`To‘lov: ${escapeTelegramHtml(input.paymentMethod)}`] : []),
    ...(input.note ? [`Izoh: ${escapeTelegramHtml(input.note)}`] : []),
    `Manba: ${escapeTelegramHtml(input.source || 'direct')}`,
    '',
    '<b>Mahsulotlar:</b>',
    ...lines,
  ].join('\n');
}

const LEAD_TYPE_LABELS: Record<string, string> = {
  chat: 'AI chat',
  contact: 'Kontakt so‘rovi',
  wholesale: 'Ulgurji narx so‘rovi',
  organization: 'Tashkilot so‘rovi',
  reseller: 'Qayta sotuvchi so‘rovi',
  product_request: 'Mahsulot topish so‘rovi',
};

export function buildTelegramLeadMessage(input: {
  leadId: string;
  type: string;
  name: string;
  phone: string;
  source?: string | null;
  details: Array<{ label: string; value?: string | null }>;
}): string {
  const detailLines = input.details
    .filter((detail) => detail.value?.trim())
    .map((detail) => `${escapeTelegramHtml(detail.label)}: ${escapeTelegramHtml(detail.value!.trim())}`);

  return [
    `<b>${escapeTelegramHtml(LEAD_TYPE_LABELS[input.type] || 'Yangi murojaat')}</b>`,
    '',
    `Raqam: <code>${escapeTelegramHtml(input.leadId)}</code>`,
    `Mijoz: ${escapeTelegramHtml(input.name)}`,
    `Telefon: ${escapeTelegramHtml(input.phone)}`,
    `Manba: ${escapeTelegramHtml(input.source || 'direct')}`,
    ...(detailLines.length ? ['', ...detailLines] : []),
  ].join('\n');
}
