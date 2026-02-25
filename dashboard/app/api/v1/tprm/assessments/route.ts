import { NextRequest, NextResponse } from 'next/server';

// GET /api/v1/tprm/assessments - Deprecated API route
export async function GET() {
  return NextResponse.json({ error: "Deprecated. Use Rust API on port 8080" }, { status: 410 });
}

// POST /api/v1/tprm/assessments - Deprecated API route
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: "Deprecated. Use Rust API on port 8080" }, { status: 410 });
}
