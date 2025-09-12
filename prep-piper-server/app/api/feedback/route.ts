import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Import the auth function from your auth.ts
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await auth(); // Use auth() instead of getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feedback = await db.userFeedback.findUnique({
      where: { userId: session.user.id }
    });

    return NextResponse.json(feedback || {});
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth(); // Use auth() instead of getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating, comments } = await req.json();
    
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1-5' }, { status: 400 });
    }

    const feedback = await db.userFeedback.upsert({
      where: { userId: session.user.id },
      update: { rating, comments },
      create: { userId: session.user.id, rating, comments },
    });

    return NextResponse.json({ 
      success: true, 
      feedback,
      message: 'Feedback submitted successfully' 
    });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
