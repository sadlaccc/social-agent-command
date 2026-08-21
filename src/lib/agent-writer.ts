import { platformById } from "./platforms";

type DraftInput = {
  agentName: string;
  role: string;
  tone: string;
  topics: string;
  platform: string;
  brief: string;
};

const openers: Record<string, string> = {
  professional: "Here's what we're seeing",
  friendly: "Quick thought for you",
  bold: "Let's be blunt",
  witty: "Plot twist",
  educational: "A short breakdown",
  inspirational: "A reminder",
};

const closers: Record<string, string> = {
  professional: "What's your read on this?",
  friendly: "Curious what you think 👇",
  bold: "Disagree? Tell me why.",
  witty: "You're welcome.",
  educational: "Save this for later.",
  inspirational: "Keep going.",
};

/**
 * Local, deterministic draft generator used while platform publishing is simulated.
 * Produces a platform-appropriate post from the agent's persona and a short brief.
 */
export function generateDraft({
  agentName,
  role,
  tone,
  topics,
  platform,
  brief,
}: DraftInput): string {
  const topicList = topics
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const topic = brief.trim() || topicList[0] || role;
  const opener = openers[tone] ?? openers["professional"]!;
  const closer = closers[tone] ?? closers["professional"]!;
  const tags = topicList
    .slice(0, 3)
    .map((t) => "#" + t.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((t) => t.length > 1);

  const p = platformById(platform);
  const isLong = (p?.limit ?? 280) > 1000;

  const body = isLong
    ? [
        `${opener}: ${topic}.`,
        "",
        `Three things worth noting as a ${role.toLowerCase()}:`,
        `1. The teams that move first on ${topicList[0] ?? topic} compound their advantage.`,
        `2. Consistency beats intensity — small, repeatable moves win.`,
        `3. Measure the outcome, not the activity.`,
        "",
        closer,
        tags.join(" "),
      ]
        .join("\n")
        .trim()
    : `${opener}: ${topic}. ${closer} ${tags.join(" ")}`.trim();

  const limit = p?.limit ?? 280;
  return body.length > limit ? body.slice(0, limit - 1).trimEnd() + "…" : body;
}

export const agentSignature = (agentName: string) => `— drafted by ${agentName}`;
