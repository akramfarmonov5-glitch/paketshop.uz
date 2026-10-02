import { NextRequest, NextResponse } from 'next/server';
import { assistantApiKey, isAssistantRequest } from '@/lib/server/assistantAuth';
import { db } from '@/lib/server/db';

// Status of the requests the AI assistant handed over (POST /api/leads), so it can answer "where is my request?"
// with what the managers set in the CRM. Status fields only: no names, phones or notes. Protected by ASSISTANT_API_KEY.
export const dynamic = 'force-dynamic';

const MAX_IDS = 50;
const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET(request: NextRequest) {
  if (!assistantApiKey()) {
    return NextResponse.json({ error: 'Assistant integration is not configured' }, { status: 503, headers: NO_STORE });
  }
  if (!isAssistantRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE });
  }

  const ids = (request.nextUrl.searchParams.get('ids') || '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => /^[a-z0-9]{8,40}$/i.test(id))
    .slice(0, MAX_IDS);
  if (!ids.length) return NextResponse.json({ leads: [] }, { headers: NO_STORE });

  try {
    const leads = await db.lead.findMany({
      // Only leads the assistant created (their source is "AI yordamchi (...)")
      where: { id: { in: ids }, source: { startsWith: 'AI yordamchi' } },
      select: { id: true, status: true, lostReason: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({
      leads: leads.map((lead) => ({
        id: lead.id,
        status: lead.status,
        lostReason: lead.lostReason,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      })),
    }, { headers: NO_STORE });
  } catch (error) {
    console.error('Assistant lead status failed:', error);
    return NextResponse.json({ error: 'Lead status is temporarily unavailable' }, { status: 500, headers: NO_STORE });
  }
}
