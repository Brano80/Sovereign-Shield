import { NextRequest, NextResponse } from "next/server";

// POST /api/v1/dora/whitelist/[id]/versions - Deprecated API route
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ error: "Deprecated. Use Rust API on port 8080" }, { status: 410 });
}

