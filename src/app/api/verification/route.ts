import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/diditAuth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const accessToken = await getAuthToken();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isIframe } = await request.json();

    const url = `${process.env.NEXT_VERIFICATION_BASE_URL}/v1/session/`;

    const body: {
      vendor_data: string;
      callback?: string;
      // features?: string;
    } = {
      vendor_data: session.user.email,
    };

    if (!isIframe) {
      body.callback = process.env.VERIFICATION_CALLBACK_URL;
    }

    // If you want to include features, uncomment this line:
    // body.features = process.env.VERIFICATION_FEATURES;

    console.log("Request body:", body);

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
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
