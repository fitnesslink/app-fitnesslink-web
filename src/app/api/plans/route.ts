import { NextResponse } from "next/server";

export async function GET() {
  await new Promise((r) => setTimeout(r, 300));

  return NextResponse.json({
    plans: [
      {
        id: "monthly",
        name: "Monthly",
        price: 14.99,
        interval: "month",
        description: "Billed monthly, cancel anytime",
        features: [
          "Personalized workouts",
          "Progress tracking",
          "Nutrition guidance",
        ],
      },
      {
        id: "annual",
        name: "Annual",
        price: 119.99,
        interval: "year",
        savings: "Save 33%",
        description: "Billed annually",
        features: [
          "Everything in Monthly",
          "Priority support",
          "Advanced analytics",
        ],
      },
    ],
  });
}
