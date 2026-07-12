// Eski Supabase leads jadvalini Prisma Lead jadvaliga ko'chiradi (idempotent).
// Ishga tushirish: node --env-file=.env scripts/migrate-legacy-leads.mjs
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: legacyLeads, error } = await supabase
  .from('leads')
  .select('id,name,phone,last_message,created_at')
  .order('created_at', { ascending: true });
if (error) throw error;

console.log(`Legacy leadlar: ${legacyLeads.length} ta`);

const existing = await db.lead.findMany({ select: { payload: true } });
const migratedIds = new Set(
  existing
    .map((lead) => (lead.payload && typeof lead.payload === 'object' ? lead.payload.legacyId : null))
    .filter(Boolean),
);

let migrated = 0;
let skipped = 0;

for (const legacy of legacyLeads) {
  if (migratedIds.has(legacy.id)) {
    skipped += 1;
    continue;
  }

  await db.lead.create({
    data: {
      type: 'CONTACT',
      name: legacy.name || 'Nomsiz',
      phone: legacy.phone || '',
      source: 'legacy',
      payload: { legacyId: legacy.id, note: legacy.last_message || null },
      createdAt: legacy.created_at ? new Date(legacy.created_at) : undefined,
      activities: { create: { type: 'CREATED', note: 'Eski tizimdan ko‘chirildi' } },
    },
  });
  migrated += 1;
}

console.log(`Natija: ${migrated} ta ko'chirildi, ${skipped} ta avvaldan mavjud.`);
await db.$disconnect();
