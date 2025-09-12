// app/api/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFeedback, upsertFeedback } from '@/lib/feedback';
import { getSession } from 'next-auth/react';

export async function GET(req: NextRequest) {
  const session = await getSession({ req });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const feedback = await getUserFeedback(session?.user?.id);
  return NextResponse.json(feedback || {});
}

export async function POST(req: NextRequest) {
  const session = await getSession({ req });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { rating, comments } = await req.json();
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });
  }
  const feedback = await upsertFeedback(session?.user?.id, rating, comments);
  return NextResponse.json(feedback);
}
