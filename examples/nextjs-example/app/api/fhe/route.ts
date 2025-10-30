import { NextRequest, NextResponse } from 'next/server';

/**
 * FHE Operations API Route
 * Handles general FHE operations
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    message: 'FHE API is running',
    endpoints: {
      encrypt: '/api/fhe/encrypt',
      decrypt: '/api/fhe/decrypt',
      compute: '/api/fhe/compute'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, data } = body;

    // Process FHE operations
    return NextResponse.json({
      success: true,
      operation,
      result: 'Operation processed'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
