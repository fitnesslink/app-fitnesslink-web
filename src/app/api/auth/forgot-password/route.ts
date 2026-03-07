import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await new Promise((r) => setTimeout(r, 500));

  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "Password reset email sent",
  });
}
