import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppearance } from "@/hooks/useAppearance";

export function ThemeToggle({ className }: { className?: string }) {
  const { appearance, update } = useAppearance();
  const isDark = appearance.theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => update({ theme: isDark ? "light" : "dark" })}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
