import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Send, Sparkles, CalendarClock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  listAgents,
  listConnections,
  listPosts,
  createPost,
  publishPost,
  deletePost,
} from "@/lib/api";
import { platformById, platformName } from "@/lib/platforms";
import { generateDraft } from "@/lib/agent-writer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/composer")({
  head: () => ({
    meta: [
      { title: "Composer — Agentflow" },
      {
        name: "description",
        content: "Draft, schedule and publish agent-written posts to your connected timelines.",
      },
      { property: "og:title", content: "Composer — Agentflow" },
      { property: "og:description", content: "Draft and publish agent-written posts." },
    ],
  }),
  component: ComposerPage,
});

function ComposerPage() {
  const qc = useQueryClient();
  const agents = useQuery({ queryKey: ["agents"], queryFn: listAgents });
  const connections = useQuery({ queryKey: ["connections"], queryFn: listConnections });
  const posts = useQuery({ queryKey: ["posts"], queryFn: listPosts });

  const [agentId, setAgentId] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [brief, setBrief] = useState("");
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const connectedPlatforms = connections.data ?? [];
  const activePlatform = platformById(platform);
  const agent = (agents.data ?? []).find((a) => a.id === agentId);

  const save = useMutation({
    mutationFn: (status: "draft" | "scheduled" | "published") =>
      createPost({
        agent_id: agentId || null,
        platform,
        content: content.trim(),
        status,
        scheduled_at: status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      }),
    onSuccess: (_d, status) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success(
        status === "published" ? "Posted to your timeline" : `Post saved as ${status}`,
      );
      setContent("");
      setBrief("");
      setScheduledAt("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publishNow = useMutation({
    mutationFn: publishPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Published");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: deletePost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  function draft() {
    if (!agent) {
      toast.error("Pick an agent first");
      return;
    }
    if (!platform) {
      toast.error("Pick a platform first");
      return;
    }
    setContent(
      generateDraft({
        agentName: agent.name,
        role: agent.role,
        tone: agent.tone,
        topics: agent.topics,
        platform,
        brief,
      }),
    );
  }

  function submit(status: "draft" | "scheduled" | "published") {
    if (!platform) {
      toast.error("Pick a platform");
      return;
    }
    if (!content.trim()) {
      toast.error("Write or generate some content");
      return;
    }
    if (status === "scheduled" && !scheduledAt) {
      toast.error("Pick a date and time to schedule");
      return;
    }
    save.mutate(status);
  }

  const overLimit = activePlatform ? content.length > activePlatform.limit : false;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Composer</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Let an agent draft it, then post to your timeline or schedule it for later.
        </p>
      </header>

      {connectedPlatforms.length === 0 && (
        <div className="panel p-5 text-sm">
          You have no connected platforms yet.{" "}
          <Link to="/connections" className="text-primary underline-offset-4 hover:underline">
            Connect one first
          </Link>
          .
        </div>
      )}

      <section className="panel space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Agent</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                {(agents.data ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Post to</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a timeline" />
              </SelectTrigger>
              <SelectContent>
                {connectedPlatforms.map((c) => (
                  <SelectItem key={c.id} value={c.platform}>
                    {platformName(c.platform)} · {c.handle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brief">What should this post be about?</Label>
          <Input
            id="brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Our new port analytics release"
          />
        </div>

        <Button type="button" variant="secondary" onClick={draft}>
          <Sparkles className="size-4" /> Draft with agent
        </Button>

        <div className="space-y-2">
          <Label htmlFor="content">Post content</Label>
          <Textarea
            id="content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the post, or let your agent draft it."
          />
          <p className={`text-xs ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
            {content.length}
            {activePlatform ? ` / ${activePlatform.limit}` : ""} characters
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="when">Schedule for (optional)</Label>
            <Input
              id="when"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => submit("published")} disabled={save.isPending || overLimit}>
            <Send className="size-4" /> Post now
          </Button>
          <Button
            variant="secondary"
            onClick={() => submit("scheduled")}
            disabled={save.isPending || overLimit}
          >
            <CalendarClock className="size-4" /> Schedule
          </Button>
          <Button variant="ghost" onClick={() => submit("draft")} disabled={save.isPending}>
            Save draft
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Post history</h2>
        {(posts.data ?? []).map((p) => (
          <article key={p.id} className="panel p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{platformName(p.platform)}</Badge>
              <Badge
                variant={
                  p.status === "published" ? "default" : p.status === "scheduled" ? "outline" : "secondary"
                }
              >
                {p.status}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {p.scheduled_at
                  ? `for ${new Date(p.scheduled_at).toLocaleString()}`
                  : new Date(p.created_at).toLocaleString()}
              </span>
            </div>
            <p className="mt-3 text-sm whitespace-pre-line">{p.content}</p>
            <div className="mt-3 flex gap-2">
              {p.status !== "published" && (
                <Button size="sm" variant="outline" onClick={() => publishNow.mutate(p.id)}>
                  <Send className="size-4" /> Publish now
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(p.id)}>
                <Trash2 className="size-4" /> Delete
              </Button>
            </div>
          </article>
        ))}
        {posts.data?.length === 0 && (
          <p className="text-muted-foreground text-sm">Nothing posted yet.</p>
        )}
      </section>
    </div>
  );
}
