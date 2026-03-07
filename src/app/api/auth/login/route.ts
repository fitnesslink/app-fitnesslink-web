import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await new Promise((r) => setTimeout(r, 500));

  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Mock: accept any valid-looking credentials
  if (password.length < 4) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: {
      id: "usr_mock_001",
      firstName: "Demo",
      lastName: "User",
      email,
    },
    token: "mock-jwt-token-" + Date.now(),
  });
}
