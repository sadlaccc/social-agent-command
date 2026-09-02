import { useCallback, useEffect, useState } from "react";

export type AgentDefaults = {
  tone: string;
  frequency: string;
  platform: string;
  autoPublish: boolean;
  signature: string;
};

const KEY = "agentflow.agent-defaults";

export const DEFAULT_AGENT_DEFAULTS: AgentDefaults = {
  tone: "professional",
  frequency: "daily",
  platform: "x",
  autoPublish: false,
  signature: "",
};

export function readAgentDefaults(): AgentDefaults {
  if (typeof window === "undefined") return DEFAULT_AGENT_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_AGENT_DEFAULTS;
    return { ...DEFAULT_AGENT_DEFAULTS, ...(JSON.parse(raw) as Partial<AgentDefaults>) };
  } catch {
    return DEFAULT_AGENT_DEFAULTS;
  }
}

export function useAgentDefaults() {
  const [defaults, setDefaults] = useState<AgentDefaults>(DEFAULT_AGENT_DEFAULTS);

  useEffect(() => {
    setDefaults(readAgentDefaults());
  }, []);

  const update = useCallback((patch: Partial<AgentDefaults>) => {
    setDefaults((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  return { defaults, update };
}
