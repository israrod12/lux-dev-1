import { createHmac, timingSafeEqual } from "crypto";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function verifySignature(
  rawBody: string,
  receivedSignature: string,
  timestamp: number,
  secret: string
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");
  const providedSignatureBuffer = Buffer.from(receivedSignature, "hex");

  return (
    expectedSignatureBuffer.length === providedSignatureBuffer.length &&
    timingSafeEqual(expectedSignatureBuffer, providedSignatureBuffer)
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const body = JSON.parse(rawBody);

  console.log("webhook body", body);

  const secret = process.env.WEBHOOK_SECRET_KEY;
  const signature = request.headers.get("x-signature") as string;
  if (!signature || !secret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const timestamp = body.created_at;

  if (verifySignature(rawBody, signature, timestamp, secret)) {
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
