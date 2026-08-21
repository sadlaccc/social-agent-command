import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bot, Link2, Send, CalendarClock } from "lucide-react";
import { listAgents, listConnections, listPosts } from "@/lib/api";
import { platformName } from "@/lib/platforms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — Agentflow" },
      { name: "description", content: "Your AI agents, connections and post activity at a glance." },
      { property: "og:title", content: "Overview — Agentflow" },
      { property: "og:description", content: "AI social agent activity at a glance." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const agents = useQuery({ queryKey: ["agents"], queryFn: listAgents });
  const connections = useQuery({ queryKey: ["connections"], queryFn: listConnections });
  const posts = useQuery({ queryKey: ["posts"], queryFn: listPosts });

  const activeAgents = (agents.data ?? []).filter((a) => a.is_active).length;
  const published = (posts.data ?? []).filter((p) => p.status === "published").length;
  const scheduled = (posts.data ?? []).filter((p) => p.status === "scheduled").length;

  const stats = [
    { label: "Active agents", value: activeAgents, icon: Bot },
    { label: "Connected platforms", value: connections.data?.length ?? 0, icon: Link2 },
    { label: "Published posts", value: published, icon: Send },
    { label: "Scheduled", value: scheduled, icon: CalendarClock },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Control room</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Everything your agents are working on right now.
          </p>
        </div>
        <Button asChild>
          <Link to="/composer">New post</Link>
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-5">
            <s.icon className="text-primary size-5" />
            <p className="font-display mt-3 text-3xl font-bold">{s.value}</p>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="panel p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/composer">Open composer</Link>
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {(posts.data ?? []).slice(0, 6).map((p) => (
            <article key={p.id} className="border-border rounded-lg border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{platformName(p.platform)}</Badge>
                <StatusBadge status={p.status} />
                <span className="text-muted-foreground text-xs">
                  {new Date(p.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-3 text-sm whitespace-pre-line">{p.content}</p>
            </article>
          ))}
          {posts.data?.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No posts yet. Create an agent, connect a platform and draft your first post.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-lg font-semibold">Your agents</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(agents.data ?? []).slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3">
                <span>{a.name}</span>
                <Badge variant={a.is_active ? "default" : "secondary"}>
                  {a.is_active ? "active" : "paused"}
                </Badge>
              </li>
            ))}
            {agents.data?.length === 0 && (
              <li className="text-muted-foreground">
                <Link to="/agents" className="text-primary underline-offset-4 hover:underline">
                  Create your first agent
                </Link>
              </li>
            )}
          </ul>
        </div>
        <div className="panel p-6">
          <h2 className="text-lg font-semibold">Connections</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(connections.data ?? []).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3">
                <span>{platformName(c.platform)}</span>
                <span className="text-muted-foreground">{c.handle}</span>
              </li>
            ))}
            {connections.data?.length === 0 && (
              <li className="text-muted-foreground">
                <Link to="/connections" className="text-primary underline-offset-4 hover:underline">
                  Connect a platform
                </Link>
              </li>
            )}
          </ul>
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
