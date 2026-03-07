import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await new Promise((r) => setTimeout(r, 500));

  const body = await req.json();
  const { firstName, lastName, email, password } = body;

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      user: {
        id: "usr_" + Math.random().toString(36).slice(2, 10),
        firstName,
        lastName,
        email,
      },
      token: "mock-jwt-token-" + Date.now(),
    },
    { status: 201 }
  );
}
