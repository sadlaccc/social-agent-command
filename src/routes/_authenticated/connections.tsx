import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, Link2, Unplug } from "lucide-react";
import { toast } from "sonner";
import { listConnections, connectPlatform, disconnectPlatform } from "@/lib/api";
import { PLATFORMS } from "@/lib/platforms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/connections")({
  head: () => ({
    meta: [
      { title: "Connections — Agentflow" },
      {
        name: "description",
        content: "Connect X, LinkedIn, Facebook and Instagram timelines to your agents.",
      },
      { property: "og:title", content: "Connections — Agentflow" },
      { property: "og:description", content: "Connect your social timelines." },
    ],
  }),
  component: ConnectionsPage,
});

function ConnectionsPage() {
  const qc = useQueryClient();
  const connections = useQuery({ queryKey: ["connections"], queryFn: listConnections });
  const [target, setTarget] = useState<string | null>(null);
  const [handle, setHandle] = useState("");

  const connect = useMutation({
    mutationFn: () => connectPlatform(target!, handle.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Platform connected");
      setTarget(null);
      setHandle("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const disconnect = useMutation({
    mutationFn: disconnectPlatform,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Disconnected");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const connected = (id: string) => (connections.data ?? []).find((c) => c.platform === id);
  const targetPlatform = PLATFORMS.find((p) => p.id === target);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Connections</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Link the timelines your agents are allowed to post to.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {PLATFORMS.map((p) => {
          const c = connected(p.id);
          return (
            <article key={p.id} className="panel flex flex-col justify-between gap-4 p-6">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">{p.name}</h2>
                  {c ? (
                    <Badge>
                      <CheckCircle2 className="size-3" /> connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">not connected</Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{p.blurb}</p>
                {c && <p className="mt-3 text-sm font-medium">{c.handle}</p>}
              </div>
              {c ? (
                <Button variant="outline" size="sm" onClick={() => disconnect.mutate(c.id)}>
                  <Unplug className="size-4" /> Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setTarget(p.id);
                    setHandle(p.handlePrefix);
                  }}
                >
                  <Link2 className="size-4" /> Connect
                </Button>
              )}
            </article>
          );
        })}
      </div>

      <p className="text-muted-foreground text-xs">
        Publishing is simulated for now — posts are stored in your workspace. Live platform APIs
        can be switched on later with developer credentials for each network.
      </p>

      <Dialog open={target !== null} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {targetPlatform?.name}</DialogTitle>
            <DialogDescription>
              Enter the account handle your agents should post from.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              connect.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="handle">Account handle</Label>
              <Input
                id="handle"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={connect.isPending}>
                Connect account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
