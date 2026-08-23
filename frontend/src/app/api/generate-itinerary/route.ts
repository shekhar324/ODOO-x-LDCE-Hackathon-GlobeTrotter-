import { NextResponse } from "next/server";

const FLASK_BACKEND_URL =
  process.env.CHATBOT_BACKEND_URL ||
  process.env.NEXT_PUBLIC_CHATBOT_API_URL ||
  "http://127.0.0.1:5000";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${FLASK_BACKEND_URL}/api/generate-itinerary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data?.error || `Flask AI engine responded with status ${backendRes.status}.` },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error proxying itinerary generation to Flask backend:", error);
    return NextResponse.json(
      {
        error:
          "Unable to reach the GlobeTrotter AI service. Please verify the Flask backend is running on port 5000.",
      },
      { status: 503 }
    );
  }
}
