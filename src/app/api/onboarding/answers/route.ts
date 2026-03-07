import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await new Promise((r) => setTimeout(r, 500));

  const body = await req.json();
  const { answers } = body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json(
      { error: "Answers are required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "Personalization complete",
    profileComplete: true,
  });
}
