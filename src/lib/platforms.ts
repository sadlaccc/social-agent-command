export type PlatformId = "x" | "linkedin" | "facebook" | "instagram";

export type Platform = {
  id: PlatformId;
  name: string;
  handlePrefix: string;
  blurb: string;
  limit: number;
};

export const PLATFORMS: Platform[] = [
  {
    id: "x",
    name: "X / Twitter",
    handlePrefix: "@",
    blurb: "Short, punchy timeline posts and threads.",
    limit: 280,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handlePrefix: "in/",
    blurb: "Professional updates for your network feed.",
    limit: 3000,
  },
  {
    id: "facebook",
    name: "Facebook",
    handlePrefix: "@",
    blurb: "Page and timeline posts for a broad audience.",
    limit: 2000,
  },
  {
    id: "instagram",
    name: "Instagram",
    handlePrefix: "@",
    blurb: "Caption-led posts with hashtags.",
    limit: 2200,
  },
];

export const platformById = (id: string): Platform | undefined =>
  PLATFORMS.find((p) => p.id === id);

export const platformName = (id: string): string => platformById(id)?.name ?? id;

export const TONES = [
  "professional",
  "friendly",
  "bold",
  "witty",
  "educational",
  "inspirational",
] as const;

export const FREQUENCIES = ["hourly", "daily", "weekly", "manual"] as const;
