import { createHmac } from "crypto";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function encodeData<T>(data: T): Buffer {
  const formattedData = JSON.stringify(data);
  return Buffer.from(formattedData, "utf-8");
}

function verifySignature(
  encodedData: Buffer,
  receivedSignature: string,
  secret: string
): boolean {
  const computedSignature = createHmac("sha256", secret)
    .update(encodedData)
    .digest("hex");

  return computedSignature === receivedSignature;
}

function verifyTimestamp(timestamp: number): boolean {
  const now = Math.round(Date.now() / 1000);
  const fiveMinutes = 5 * 60;

  return now - timestamp <= fiveMinutes;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  console.log("webhook body", body);

  const secret = process.env.WEBHOOK_SECRET_KEY;
  const signature = request.headers.get("x-signature") as string;
  if (!signature || !secret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const timestamp = body.created_at;
  if (!verifyTimestamp(timestamp)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const encodedData = encodeData(body);

  if (verifySignature(encodedData, signature, secret)) {
    const { session_id, status, vendor_data: email } = body;

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await prisma.verificationSession.upsert({
      where: { sessionId: session_id },
      update: { status },
      create: {
        sessionId: session_id,
        userId: user.id, // Use the user's ID here
        status,
      },
    });

    if (status === "Approved") {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    return NextResponse.json({ message: "Webhook event processed" });
  } else {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
