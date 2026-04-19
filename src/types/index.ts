export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Plan {
  id: "monthly" | "annual";
  name: string;
  price: number;
  interval: "month" | "year";
  savings?: string;
  description: string;
  features: string[];
}

export interface PlansResponse {
  plans: Plan[];
}

export interface PaymentMethod {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
}

export interface Subscription {
  id: string;
  planId: string;
  status: "active" | "inactive";
  startDate: string;
}

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: number;
  question: string;
  type: "single-select";
  options: QuestionOption[];
}

export interface QuestionsResponse {
  questions: Question[];
}

export interface Answer {
  questionId: number;
  selectedOptionId: string;
}
