import { NextRequest, NextResponse } from "next/server";

// PUT /api/v1/incidents/learning/recommendations/[id] - Deprecated API route
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ error: "Deprecated. Use Rust API on port 8080" }, { status: 410 });
}

