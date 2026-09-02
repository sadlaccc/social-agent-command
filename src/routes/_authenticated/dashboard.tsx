import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Bot,
  Link2,
  Send,
  CalendarClock,
  PenLine,
  Plug,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { listAgents, listConnections, listPosts, updateAgent, type Post } from "@/lib/api";
import { PLATFORMS, platformName } from "@/lib/platforms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Control room — Agentflow" },
      {
        name: "description",
        content:
          "Live overview of your AI agents: output trends, per-platform mix, scheduled queue and quick actions.",
      },
      { property: "og:title", content: "Control room — Agentflow" },
      {
        property: "og:description",
        content: "AI social agent activity, trends and queue at a glance.",
      },
    ],
  }),
  component: DashboardPage,
});

const DAYS = 14;

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildTrend(posts: Post[]) {
  const buckets = new Map<string, { day: string; created: number; published: number }>();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets.set(dayKey(d), {
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      created: 0,
      published: 0,
    });
  }
  for (const p of posts) {
    const c = buckets.get(dayKey(new Date(p.created_at)));
    if (c) c.created += 1;
    if (p.published_at) {
      const pub = buckets.get(dayKey(new Date(p.published_at)));
      if (pub) pub.published += 1;
    }
  }
  return [...buckets.values()];
}

function DashboardPage() {
  const qc = useQueryClient();
  const agents = useQuery({ queryKey: ["agents"], queryFn: listAgents });
  const connections = useQuery({ queryKey: ["connections"], queryFn: listConnections });
  const posts = useQuery({ queryKey: ["posts"], queryFn: listPosts });

  const toggle = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) =>
      updateAgent(v.id, { is_active: v.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const allPosts = posts.data ?? [];
  const allAgents = agents.data ?? [];
  const allConnections = connections.data ?? [];

  const activeAgents = allAgents.filter((a) => a.is_active).length;
  const published = allPosts.filter((p) => p.status === "published").length;
  const scheduled = allPosts
    .filter((p) => p.status === "scheduled")
    .sort((a, b) => (a.scheduled_at ?? "").localeCompare(b.scheduled_at ?? ""));

  const trend = useMemo(() => buildTrend(allPosts), [allPosts]);

  const platformMix = PLATFORMS.map((p) => ({
    name: p.name.split(" ")[0],
    posts: allPosts.filter((x) => x.platform === p.id).length,
  }));

  const perAgent = allAgents
    .map((a) => ({ agent: a, count: allPosts.filter((p) => p.agent_id === a.id).length }))
    .sort((x, y) => y.count - x.count);
  const topCount = Math.max(1, ...perAgent.map((p) => p.count));

  const stats = [
    { label: "Active agents", value: activeAgents, sub: `${allAgents.length} total`, icon: Bot },
    {
      label: "Connected platforms",
      value: allConnections.length,
      sub: `of ${PLATFORMS.length}`,
      icon: Link2,
    },
    { label: "Published posts", value: published, sub: "all time", icon: Send },
    { label: "In queue", value: scheduled.length, sub: "scheduled", icon: CalendarClock },
  ];

  const quickActions = [
    { to: "/composer", label: "Compose a post", icon: PenLine },
    { to: "/agents", label: "Create an agent", icon: Sparkles },
    { to: "/connections", label: "Connect a platform", icon: Plug },
  ] as const;

  return (
    <div className="space-y-8">
      <header className="panel grid-backdrop relative overflow-hidden p-6 md:p-8">
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
              Live workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Control <span className="text-gradient">room</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg text-sm">
              Everything your agents are drafting, scheduling and publishing right now.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <Button key={a.to} asChild variant={a.to === "/composer" ? "default" : "outline"}>
                <Link to={a.to}>
                  <a.icon className="size-4" />
                  {a.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel-interactive p-5">
            <div className="flex items-start justify-between">
              <span className="bg-brand-soft text-primary flex size-9 items-center justify-center rounded-lg">
                <s.icon className="size-4" />
              </span>
              <ArrowUpRight className="text-muted-foreground size-4" />
            </div>
            <p className="font-display mt-4 text-3xl font-bold">{s.value}</p>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">{s.label}</p>
            <p className="text-muted-foreground/70 mt-1 text-xs">{s.sub}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Output trend</h2>
              <p className="text-muted-foreground text-xs">Drafted vs published, last 14 days</p>
            </div>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPublished" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#gCreated)"
                />
                <Area
                  type="monotone"
                  dataKey="published"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  fill="url(#gPublished)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="text-lg font-semibold">Platform mix</h2>
          <p className="text-muted-foreground text-xs">Posts per network</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformMix} margin={{ left: -24, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="posts" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Agent performance</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/agents">Manage</Link>
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {perAgent.slice(0, 5).map(({ agent, count }) => (
              <div key={agent.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{agent.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {agent.role} · {agent.tone}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">{count} posts</span>
                    <Switch
                      checked={agent.is_active}
                      onCheckedChange={(v) => toggle.mutate({ id: agent.id, is_active: v })}
                    />
                  </div>
                </div>
                <Progress value={(count / topCount) * 100} className="h-1.5" />
              </div>
            ))}
            {perAgent.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No agents yet.{" "}
                <Link to="/agents" className="text-primary underline-offset-4 hover:underline">
                  Create your first agent
                </Link>
                .
              </p>
            )}
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Queue & schedule</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/composer">Schedule</Link>
            </Button>
          </div>
          <ol className="mt-4 space-y-3">
            {scheduled.slice(0, 5).map((p) => (
              <li key={p.id} className="border-border relative rounded-lg border p-3 pl-4">
                <span className="bg-signal absolute top-3 bottom-3 left-0 w-0.5 rounded-full" />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{platformName(p.platform)}</Badge>
                  <span className="text-primary text-xs font-medium">
                    {p.scheduled_at ? new Date(p.scheduled_at).toLocaleString() : "unscheduled"}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{p.content}</p>
              </li>
            ))}
            {scheduled.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Nothing scheduled. Queue a post from the composer.
              </p>
            )}
          </ol>
        </div>
      </section>

      <section className="panel p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/composer">Open composer</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {allPosts.slice(0, 6).map((p) => (
            <article key={p.id} className="border-border rounded-xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{platformName(p.platform)}</Badge>
                <StatusBadge status={p.status} />
                <span className="text-muted-foreground text-xs">
                  {new Date(p.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-3 line-clamp-4 text-sm whitespace-pre-line">{p.content}</p>
            </article>
          ))}
          {allPosts.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No posts yet. Create an agent, connect a platform and draft your first post.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "published" ? "default" : status === "scheduled" ? "outline" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}
