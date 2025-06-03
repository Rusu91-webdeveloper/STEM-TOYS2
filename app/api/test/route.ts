import { NextRequest, NextResponse } from "next/server";

// Simple GET endpoint for testing API connectivity
export async function GET(request: NextRequest) {
  console.log("Test GET endpoint called");
  return NextResponse.json({
    message: "Test API endpoint is working",
    timestamp: new Date().toISOString(),
  });
}

// Simple POST endpoint for testing API connectivity
export async function POST(request: NextRequest) {
  console.log("Test POST endpoint called");

  try {
    const body = await request.json();
    console.log("Received data:", body);

    return NextResponse.json(
      {
        message: "Test API POST endpoint is working",
        receivedData: body,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json(
      {
        error: "Failed to parse request body",
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}
