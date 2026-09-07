import {
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  LayoutDashboard,
  Link2,
  PenLine,
  LogOut,
  Sparkles,
  Loader2,
  Settings,
  Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <AppSidebar email={user?.email} onSignOut={signOut} />
      <SidebarInset>
        <AppHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-7 md:px-8 md:py-9">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AppSidebar({ email, onSignOut }: { email?: string; onSignOut: () => void }) {
  const currentPath = useRouterState({ select: (router) => router.location.pathname });
  const { setOpenMobile } = useSidebar();
  const initials = email?.slice(0, 2).toUpperCase() ?? "AF";

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="gap-3 p-3">
        <Link
          to="/dashboard"
          className="flex h-10 items-center gap-3 overflow-hidden px-1"
          onClick={() => setOpenMobile(false)}
        >
          <span className="bg-signal flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm">
            <Sparkles className="text-primary-foreground size-4" />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-display block truncate text-sm font-semibold">Agentflow</span>
            <span className="text-muted-foreground block truncate text-[11px]">Social command center</span>
          </span>
        </Link>
        <Button asChild size="sm" className="w-full justify-start group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0">
          <Link to="/composer" onClick={() => setOpenMobile(false)}>
            <Plus className="size-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Create post</span>
          </Link>
        </Button>
      </SidebarHeader>

      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.to}
                    tooltip={item.label}
                    size="lg"
                    className="h-10 gap-3"
                  >
                    <Link to={item.to} onClick={() => setOpenMobile(false)}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="mx-0 mb-1" />
        <div className="flex items-center gap-2 overflow-hidden rounded-md p-1 group-data-[collapsible=icon]:p-0">
          <Avatar className="size-8 shrink-0 rounded-md">
            <AvatarFallback className="bg-brand-soft text-primary rounded-md text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-medium">{email}</p>
            <p className="text-muted-foreground text-[11px]">Administrator</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 group-data-[collapsible=icon]:hidden"
            onClick={onSignOut}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function AppHeader() {
  const currentPath = useRouterState({ select: (router) => router.location.pathname });
  const currentItem = nav.find((item) => item.to === currentPath);

  return (
    <header className="bg-background/90 border-border sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="size-9" />
      <div className="bg-border h-5 w-px" />
      <div className="min-w-0 flex-1">
        <p className="font-display truncate text-sm font-semibold">{currentItem?.label ?? "Agentflow"}</p>
        <p className="text-muted-foreground hidden text-xs sm:block">Manage your social agent workspace</p>
      </div>
      <ThemeToggle />
    </header>
  );
}
