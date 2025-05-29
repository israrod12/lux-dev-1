import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isIframe } = await request.json();

    const url = `${process.env.NEXT_VERIFICATION_BASE_URL}/v1/session/`;

    const body: {
      workflow_id: string;
      vendor_data: string;
      callback?: string;
    } = {
      workflow_id: process.env.VERIFICATION_WORKFLOW_ID ?? "", // Add workflow_id to the body
      vendor_data: session.user.email,
    };

    if (!isIframe) {
      body.callback = process.env.VERIFICATION_CALLBACK_URL;
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": `${process.env.API_KEY}`,
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(url, requestOptions);
    const data = await response.json();

    if (response.status === 201 && data) {
      return NextResponse.json(data);
    } else {
      console.error("Error creating session:", data.message);
      return NextResponse.json(
        { error: data.message },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
