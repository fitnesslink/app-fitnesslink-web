import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await new Promise((r) => setTimeout(r, 800));

  const body = await req.json();
  const { planId, paymentMethod } = body;

  if (!planId || !paymentMethod) {
    return NextResponse.json(
      { error: "Plan and payment method are required" },
      { status: 400 }
    );
  }

  if (!paymentMethod.cardNumber || !paymentMethod.expiry || !paymentMethod.cvv) {
    return NextResponse.json(
      { error: "Invalid payment details" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    subscription: {
      id: "sub_" + Math.random().toString(36).slice(2, 10),
      planId,
      status: "active",
      startDate: new Date().toISOString(),
    },
  });
}
