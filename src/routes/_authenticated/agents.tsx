import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bot, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listAgents, createAgent, updateAgent, deleteAgent } from "@/lib/api";
import { PLATFORMS, TONES, FREQUENCIES, platformName } from "@/lib/platforms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/agents")({
  head: () => ({
    meta: [
      { title: "Agents — Agentflow" },
      { name: "description", content: "Create and manage the AI agents that write your posts." },
      { property: "og:title", content: "Agents — Agentflow" },
      { property: "og:description", content: "Manage your AI social agents." },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  const qc = useQueryClient();
  const agents = useQuery({ queryKey: ["agents"], queryFn: listAgents });
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("Content creator");
  const [tone, setTone] = useState<string>("professional");
  const [frequency, setFrequency] = useState<string>("daily");
  const [topics, setTopics] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);

  const create = useMutation({
    mutationFn: () => createAgent({ name, role, tone, topics, platforms, frequency }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent created");
      setOpen(false);
      setName("");
      setTopics("");
      setPlatforms([]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateAgent(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Each agent has its own voice, beat and target timelines.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" /> New agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create an agent</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="agent-name">Name</Label>
                <Input
                  id="agent-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marina, the maritime analyst"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-role">Role</Label>
                <Input
                  id="agent-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Industry analyst"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
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
                  <Label>Posting frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-topics">Topics (comma separated)</Label>
                <Textarea
                  id="agent-topics"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="logistics, port operations, shipping tech"
                />
              </div>
              <div className="space-y-2">
                <Label>Target platforms</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PLATFORMS.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={platforms.includes(p.id)}
                        onCheckedChange={(checked) =>
                          setPlatforms((prev) =>
                            checked ? [...prev, p.id] : prev.filter((x) => x !== p.id),
                          )
                        }
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={create.isPending}>
                  Create agent
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {(agents.data ?? []).map((a) => (
          <article key={a.id} className="panel p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="bg-secondary flex size-10 items-center justify-center rounded-xl">
                  <Bot className="text-primary size-5" />
                </span>
                <div>
                  <h2 className="font-semibold">{a.name}</h2>
                  <p className="text-muted-foreground text-xs">
                    {a.role} · {a.tone} · {a.frequency}
                  </p>
                </div>
              </div>
              <Switch
                checked={a.is_active}
                onCheckedChange={(v) => toggle.mutate({ id: a.id, is_active: v })}
              />
            </div>
            {a.topics && <p className="text-muted-foreground mt-4 text-sm">{a.topics}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {a.platforms.map((p) => (
                <Badge key={p} variant="secondary">
                  {platformName(p)}
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={() => remove.mutate(a.id)}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          </article>
        ))}
        {agents.data?.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No agents yet — create one to start drafting posts.
          </p>
        )}
      </div>
    </div>
  );
}
