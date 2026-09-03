import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  Bot,
  Check,
  Gauge,
  Link2,
  Loader2,
  Moon,
  Palette,
  Sun,
  Trash2,
  Unplug,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getProfile,
  updateProfile,
  updatePassword,
  deleteAllPosts,
  disconnectAllPlatforms,
  deleteAllAgents,
  listAgents,
  listConnections,
  listPosts,
} from "@/lib/api";
import { PLATFORMS, TONES, FREQUENCIES, platformName } from "@/lib/platforms";
import { useAppearance, ACCENTS } from "@/hooks/useAppearance";
import { useAgentDefaults } from "@/hooks/useAgentDefaults";
import { useNotificationPrefs } from "@/hooks/useNotificationPrefs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Agentflow" },
      {
        name: "description",
        content:
          "Manage your Agentflow profile, appearance, agent defaults and workspace data.",
      },
      { property: "og:title", content: "Settings — Agentflow" },
      {
        property: "og:description",
        content: "Profile, appearance, agent defaults and danger zone.",
      },
    ],
  }),
  component: SettingsPage,
});

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-6">
      <div className="flex items-start gap-3">
        <span className="bg-brand-soft text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function SettingsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const profile = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const { appearance, update: setAppearance } = useAppearance();
  const { defaults, update: setDefaults } = useAgentDefaults();

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (profile.data?.full_name) setFullName(profile.data.full_name);
  }, [profile.data?.full_name]);

  const saveProfile = useMutation({
    mutationFn: () => updateProfile({ full_name: fullName.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const savePassword = useMutation({
    mutationFn: () => updatePassword(password),
    onSuccess: () => {
      setPassword("");
      toast.success("Password changed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const danger = useMutation({
    mutationFn: async (action: "posts" | "connections" | "agents") => {
      if (action === "posts") return deleteAllPosts();
      if (action === "connections") return disconnectAllPlatforms();
      return deleteAllAgents();
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Workspace data cleared");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">Workspace</p>
        <h1 className="mt-1 text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tune your account, the look of the control room, and how your agents behave by default.
        </p>
      </header>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="agents">Agent defaults</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Section
            title="Profile & account"
            description="How you appear in the workspace and how you sign in."
            icon={User}
          >
            {profile.isLoading ? (
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveProfile.mutate();
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Display name</Label>
                    <Input
                      id="full_name"
                      value={fullName}
                      placeholder="Your name"
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.data?.email ?? ""} readOnly disabled />
                  </div>
                  <Button type="submit" disabled={saveProfile.isPending}>
                    Save profile
                  </Button>
                </form>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    savePassword.mutate();
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                      id="password"
                      type="password"
                      minLength={8}
                      required
                      value={password}
                      placeholder="At least 8 characters"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" variant="outline" disabled={savePassword.isPending}>
                      Change password
                    </Button>
                    <Button type="button" variant="ghost" onClick={signOut}>
                      Sign out
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Section
            title="Appearance"
            description="Theme, accent colour and layout density. Saved to this browser."
            icon={Palette}
          >
            <div className="space-y-8">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid max-w-md grid-cols-2 gap-3">
                  {(
                    [
                      { id: "dark", label: "Dark cockpit", icon: Moon },
                      { id: "light", label: "Daylight", icon: Sun },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAppearance({ theme: t.id })}
                      className={cn(
                        "border-border hover:border-primary/60 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                        appearance.theme === t.id && "border-primary bg-brand-soft text-primary",
                      )}
                    >
                      <t.icon className="size-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Accent colour</Label>
                <div className="flex flex-wrap gap-3">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAppearance({ accent: a.id })}
                      className={cn(
                        "border-border hover:border-primary/60 flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
                        appearance.accent === a.id && "border-primary bg-brand-soft",
                      )}
                    >
                      <span
                        className="size-4 rounded-full"
                        style={{ backgroundColor: a.swatch }}
                        aria-hidden
                      />
                      {a.label}
                      {appearance.accent === a.id && <Check className="text-primary size-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                <div>
                  <p className="text-sm font-medium">Compact density</p>
                  <p className="text-muted-foreground text-xs">
                    Tighter corners and spacing for information-dense screens.
                  </p>
                </div>
                <Switch
                  checked={appearance.density === "compact"}
                  onCheckedChange={(v) =>
                    setAppearance({ density: v ? "compact" : "comfortable" })
                  }
                />
              </div>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Section
            title="Agent defaults"
            description="Pre-filled values whenever you create an agent or draft a post."
            icon={Bot}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Default tone</Label>
                <Select value={defaults.tone} onValueChange={(v) => setDefaults({ tone: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default posting frequency</Label>
                <Select
                  value={defaults.frequency}
                  onValueChange={(v) => setDefaults({ frequency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default platform</Label>
                <Select
                  value={defaults.platform}
                  onValueChange={(v) => setDefaults({ platform: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border p-4 md:col-span-1">
                <div>
                  <p className="text-sm font-medium">Auto-publish drafts</p>
                  <p className="text-muted-foreground text-xs">
                    New agent drafts go straight to published instead of draft.
                  </p>
                </div>
                <Switch
                  checked={defaults.autoPublish}
                  onCheckedChange={(v) => setDefaults({ autoPublish: v })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="signature">Signature appended to posts</Label>
                <Textarea
                  id="signature"
                  rows={2}
                  placeholder="e.g. — sent by the Agentflow team"
                  value={defaults.signature}
                  onChange={(e) => setDefaults({ signature: e.target.value })}
                />
              </div>
            </div>
            <p className="text-muted-foreground mt-4 text-xs">
              Defaults save automatically as you change them.
            </p>
          </Section>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Section
            title="Danger zone"
            description="Destructive actions. These cannot be undone."
            icon={AlertTriangle}
          >
            <div className="space-y-3">
              {(
                [
                  {
                    id: "posts" as const,
                    label: "Delete all posts",
                    hint: "Removes every draft, scheduled and published post.",
                    icon: Trash2,
                  },
                  {
                    id: "connections" as const,
                    label: "Disconnect all platforms",
                    hint: "Unlinks every social timeline from this workspace.",
                    icon: Unplug,
                  },
                  {
                    id: "agents" as const,
                    label: "Delete all agents",
                    hint: "Removes every agent persona you created.",
                    icon: Bot,
                  },
                ]
              ).map((a) => (
                <div
                  key={a.id}
                  className="border-destructive/35 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                >
                  <div>
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-muted-foreground text-xs">{a.hint}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={danger.isPending}
                    onClick={() => {
                      if (window.confirm(`${a.label}? This cannot be undone.`)) danger.mutate(a.id);
                    }}
                  >
                    <a.icon className="size-4" /> {a.label}
                  </Button>
                </div>
              ))}
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
