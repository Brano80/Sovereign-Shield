import { NextRequest, NextResponse } from "next/server";

// GET /api/v1/dora/assets/[id] - Deprecated API route
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ error: "Deprecated. Use Rust API on port 8080" }, { status: 410 });
}

// PUT /api/v1/dora/assets/[id] - Deprecated API route
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ error: "Deprecated. Use Rust API on port 8080" }, { status: 410 });
}

// DELETE /api/v1/dora/assets/[id] - Deprecated API route
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ error: "Deprecated. Use Rust API on port 8080" }, { status: 410 });
}

