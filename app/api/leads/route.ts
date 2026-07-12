import { NextRequest, NextResponse } from 'next/server';
import { buildTelegramLeadMessage, normalizeUzbekPhone, summarizeAttribution } from '@/lib/domain/commerce';
import { checkRateLimit } from '@/lib/rateLimit';
import { db } from '@/lib/server/db';
import { sendTelegramHtml } from '@/lib/server/telegram';
import { leadRequestSchema, type LeadRequestInput } from '@/lib/validation/leadRequest';
import type { LeadType } from '@prisma/client';

const LEAD_TYPE_MAP: Record<LeadRequestInput['type'], LeadType> = {
  chat: 'CONTACT',
  contact: 'CONTACT',
  wholesale: 'WHOLESALE',
  organization: 'ORGANIZATION',
  reseller: 'RESELLER',
  product_request: 'PRODUCT_REQUEST',
};

function leadDetails(input: LeadRequestInput): Array<{ label: string; value?: string | null }> {
  return [
    { label: 'Shahar/viloyat', value: input.city },
    { label: 'Telegram', value: input.telegram },
    { label: 'Email', value: input.email },
    { label: 'Tashkilot', value: input.organizationName },
    { label: 'STIR', value: input.tin },
    { label: 'Bank orqali to‘lov', value: input.bankPayment === undefined ? null : input.bankPayment ? 'Kerak' : 'Kerak emas' },
    { label: 'Shartnoma', value: input.contractNeeded === undefined ? null : input.contractNeeded ? 'Kerak' : 'Kerak emas' },
    { label: 'Savdo joyi', value: input.tradePlace },
    { label: 'Oylik hajm', value: input.monthlyVolume },
    { label: 'Kategoriyalar', value: input.categories },
    { label: 'Kerakli mahsulotlar', value: input.products },
    { label: 'Izoh', value: input.note },
  ];
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-real-ip')
    || request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
  if (!checkRateLimit(`lead-create:${ip}`, 6, 10 * 60 * 1000).allowed) {
    return NextResponse.json({ error: "Juda ko'p so'rov yuborildi" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri JSON" }, { status: 400 });
  }

  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ma'lumotlar noto'g'ri", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const input = parsed.data;
  if (input.website || (input.startedAt && Date.now() - input.startedAt < 700)) {
    return NextResponse.json({ error: 'Spam rejected' }, { status: 400 });
  }

  const phone = normalizeUzbekPhone(input.phone);
  if (!phone) return NextResponse.json({ error: "Telefon raqami noto'g'ri" }, { status: 400 });

  const source = summarizeAttribution(input.attribution);
  const details = leadDetails(input);

  try {
    const lead = await db.lead.create({
      data: {
        type: LEAD_TYPE_MAP[input.type],
        name: input.name,
        phone,
        email: input.email || null,
        source,
        utmCampaign: input.attribution?.utm_campaign || input.attribution?.last?.utm_campaign || null,
        payload: {
          locale: input.locale,
          city: input.city || null,
          telegram: input.telegram || null,
          organizationName: input.organizationName || null,
          tin: input.tin || null,
          bankPayment: input.bankPayment ?? null,
          contractNeeded: input.contractNeeded ?? null,
          tradePlace: input.tradePlace || null,
          monthlyVolume: input.monthlyVolume || null,
          categories: input.categories || null,
          products: input.products || null,
          note: input.note || null,
          attribution: input.attribution || null,
        },
        activities: { create: { type: 'CREATED', note: `Manba: ${source}` } },
      },
    });

    const message = buildTelegramLeadMessage({
      leadId: lead.id,
      type: input.type,
      name: input.name,
      phone,
      source,
      details,
    });
    try {
      await sendTelegramHtml(message);
    } catch (notificationError) {
      console.error('Lead created but notification failed:', notificationError);
    }

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (error) {
    console.error('Lead request failed:', error);
    return NextResponse.json({ error: "Murojaatni saqlab bo'lmadi" }, { status: 500 });
  }
}
