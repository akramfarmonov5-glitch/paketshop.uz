import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Direct message forwarding is disabled; use a validated business endpoint.' },
    { status: 410 },
  );
}
