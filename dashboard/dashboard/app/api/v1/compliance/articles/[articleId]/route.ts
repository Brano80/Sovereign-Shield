import { NextRequest, NextResponse } from 'next/server';

// DEPRECATED: This Next.js API route has been replaced by Rust backend on port 8080
// All compliance articles functionality is now handled by the Rust API

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Deprecated. Use Rust API on port 8080" },
    { status: 410 }
  );
}
