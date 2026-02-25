import { NextRequest, NextResponse } from 'next/server';

// Evidence Events API - Proxies to Rust backend
// This endpoint fetches evidence events from the evidence_events table

export async function GET(request: NextRequest) {
  try {
    // Get authentication token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';
    const offset = searchParams.get('offset') || '0';
    const sourceSystem = searchParams.get('source_system');
    const eventType = searchParams.get('event_type');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search');

    // Build query string for Rust backend
    const rustParams = new URLSearchParams();
    rustParams.append('limit', limit);
    rustParams.append('offset', offset);
    if (sourceSystem) rustParams.append('source_system', sourceSystem);
    if (eventType) rustParams.append('event_type', eventType);
    if (severity) rustParams.append('severity', severity);
    if (search) rustParams.append('search', search);

    // Call Rust backend using relative path (will be rewritten by Next.js)
    const rustUrl = `/api/v1/evidence/events?${rustParams.toString()}`;
    console.log('Proxying to Rust backend:', rustUrl);

    const response = await fetch(rustUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Rust backend error:', response.status, response.statusText);
      // Return empty result if Rust backend fails
      return NextResponse.json({
        events: [],
        totalCount: 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
        error: 'Rust backend unavailable'
      });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Evidence events API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authentication token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Get request body
    const body = await request.json();

    // Call Rust backend
    const rustUrl = 'http://localhost:8080/api/v1/evidence/events';
    console.log('Proxying POST to Rust backend:', rustUrl);

    const response = await fetch(rustUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Rust backend error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Rust backend error', details: response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Evidence events POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
