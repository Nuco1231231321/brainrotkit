export type Plan = {
  id: "free" | "creator" | "pro";
  name: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  description: string;
  monthlyCredits: number;
  creditsLabel: string;
  recommended?: boolean;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    description: "Test the complete workflow before paying.",
    monthlyCredits: 10,
    creditsLabel: "10 starter credits once",
    features: ["10 starter credits", "One 15-second Gameplay video", "All voice presets", "Project drafts", "Local MP4 export"],
  },
  {
    id: "creator",
    name: "Creator",
    monthlyPrice: 19,
    annualMonthlyPrice: 15,
    description: "For consistent Shorts, Reels and TikTok output.",
    monthlyCredits: 300,
    creditsLabel: "300 credits every month",
    recommended: true,
    features: ["300 monthly credits", "15 to 60-second Gameplay video", "5 or 15-second AI Motion", "Private project history", "Local MP4 export"],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 39,
    annualMonthlyPrice: 31,
    description: "For higher monthly generation volume.",
    monthlyCredits: 800,
    creditsLabel: "800 credits every month",
    features: ["800 monthly credits", "15 to 60-second Gameplay video", "5 or 15-second AI Motion", "Private project history", "Local MP4 export"],
  },
];

export const creditPack = {
  price: 9.99,
  credits: 175,
} as const;
