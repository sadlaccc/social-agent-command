import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bot, LayoutDashboard, Link2, PenLine, LogOut, Sparkles, Loader2, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/agents", label: "Agents", icon: Bot },
  { to: "/connections", label: "Connections", icon: Link2 },
  { to: "/composer", label: "Composer", icon: PenLine },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function AuthenticatedLayout() {
  const { session, user, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-sidebar border-sidebar-border md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-r">
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="bg-signal flex size-8 items-center justify-center rounded-lg">
              <Sparkles className="text-primary-foreground size-4" />
            </span>
            <span className="font-display font-semibold">Agentflow</span>
          </Link>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              activeProps={{
                className:
                  "bg-sidebar-accent text-sidebar-accent-foreground flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
              }}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto hidden px-3 pb-5 md:block">
          <div className="border-sidebar-border rounded-lg border p-3">
            <p className="truncate text-xs font-medium">{user?.email}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start"
              onClick={signOut}
            >
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="border-border flex items-center justify-end border-b px-5 py-3 md:hidden">
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
        <main className="mx-auto max-w-5xl px-5 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
