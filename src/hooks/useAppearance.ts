import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";
export type AccentId = "teal" | "amber" | "violet" | "coral";
export type Density = "comfortable" | "compact";

export type Appearance = {
  theme: ThemeMode;
  accent: AccentId;
  density: Density;
};

export const ACCENTS: { id: AccentId; label: string; swatch: string }[] = [
  { id: "teal", label: "Signal teal", swatch: "oklch(0.82 0.13 183)" },
  { id: "amber", label: "Warm amber", swatch: "oklch(0.82 0.15 78)" },
  { id: "violet", label: "Deep violet", swatch: "oklch(0.72 0.16 292)" },
  { id: "coral", label: "Coral", swatch: "oklch(0.72 0.16 28)" },
];

const KEY = "agentflow.appearance";

export const DEFAULT_APPEARANCE: Appearance = {
  theme: "dark",
  accent: "teal",
  density: "comfortable",
};

export function readAppearance(): Appearance {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    return { ...DEFAULT_APPEARANCE, ...(JSON.parse(raw) as Partial<Appearance>) };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function applyAppearance(a: Appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", a.theme === "dark");
  root.dataset["accent"] = a.accent;
  root.dataset["density"] = a.density;
  root.style.colorScheme = a.theme;
}

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);

  useEffect(() => {
    const next = readAppearance();
    setAppearance(next);
    applyAppearance(next);
  }, []);

  const update = useCallback((patch: Partial<Appearance>) => {
    setAppearance((prev) => {
      const next = { ...prev, ...patch };
      applyAppearance(next);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  return { appearance, update };
}
