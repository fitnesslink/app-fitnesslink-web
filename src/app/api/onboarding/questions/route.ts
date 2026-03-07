import { NextResponse } from "next/server";

export async function GET() {
  await new Promise((r) => setTimeout(r, 300));

  return NextResponse.json({
    questions: [
      {
        id: 1,
        question: "What is your fitness goal?",
        type: "single-select",
        options: [
          { id: "lose-weight", label: "Lose Weight" },
          { id: "build-muscle", label: "Build Muscle" },
          { id: "improve-endurance", label: "Improve Endurance" },
          { id: "stay-active", label: "Stay Active" },
        ],
      },
      {
        id: 2,
        question: "What is your experience level?",
        type: "single-select",
        options: [
          { id: "beginner", label: "Beginner" },
          { id: "intermediate", label: "Intermediate" },
          { id: "advanced", label: "Advanced" },
        ],
      },
      {
        id: 3,
        question: "How many days per week can you work out?",
        type: "single-select",
        options: [
          { id: "1-2", label: "1-2 days" },
          { id: "3-4", label: "3-4 days" },
          { id: "5-6", label: "5-6 days" },
          { id: "7", label: "Every day" },
        ],
      },
      {
        id: 4,
        question: "Do you have access to a gym?",
        type: "single-select",
        options: [
          { id: "full-gym", label: "Full Gym" },
          { id: "home-gym", label: "Home Gym" },
          { id: "no-equipment", label: "No Equipment" },
        ],
      },
    ],
  });
}
