// app/api/evaluate/route.ts
import { NextRequest, NextResponse } from 'next/server';

console.log('🔄 API route /api/evaluate called' + process.env.BACKEND_URL);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔄 Forwarding evaluation request to backend...');

    // Forward the request to your Express backend
    const backendResponse = await fetch('http://localhost:3002/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error('❌ Backend evaluation failed:', errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || 'Backend evaluation failed',
          details: errorData 
        },
        { status: backendResponse.status }
      );
    }

    const evaluationResult = await backendResponse.json();
    
    console.log('✅ Backend evaluation successful');

    return NextResponse.json(evaluationResult);

  } catch (error) {
    console.error('💥 API route error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
