import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/compliance/[regulation] - Deprecated API route
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ regulation: string }> }
) {
  return NextResponse.json({ error: "Deprecated. Use Rust API on port 8080" }, { status: 410 });
}
