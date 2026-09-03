import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, CalendarClock, Link2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORMS } from "@/lib/platforms";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agentflow — AI Agents That Post To Your Timelines" },
      {
        name: "description",
        content:
          "Build AI social agents, connect X, LinkedIn, Facebook and Instagram, then draft, schedule and publish posts from one dashboard.",
      },
      { property: "og:title", content: "Agentflow — AI Agents That Post To Your Timelines" },
      {
        property: "og:description",
        content:
          "Build AI social agents, connect your platforms and publish to your timelines from one control room.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Bot,
    title: "Agent roster",
    body: "Give each agent a role, tone and topic beat, then switch it on or off.",
  },
  {
    icon: Link2,
    title: "Platform connections",
    body: "Connect the timelines you own and keep every handle in one place.",
  },
  {
    icon: CalendarClock,
    title: "Draft, schedule, publish",
    body: "Compose once, queue for later, and track everything your agents shipped.",
  },
];

function Landing() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <span className="bg-signal flex size-9 items-center justify-center rounded-xl">
            <Sparkles className="size-5 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-semibold">Agentflow</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pt-10 pb-16 md:pt-20">
        <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
          AI social operations
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] font-bold md:text-6xl">
          A control room for the <span className="text-gradient">AI agents</span> that post to
          your timelines.
        </h1>
        <p className="text-muted-foreground mt-5 max-w-xl text-base md:text-lg">
          Spin up agents with their own voice and beat, connect the platforms you publish on,
          and keep every draft, schedule and post in a single dashboard.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/auth">
              Open the dashboard <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/auth" search={{ mode: "signup" }}>
              Create an account
            </Link>
          </Button>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="panel p-6">
              <f.icon className="text-primary size-6" />
              <h2 className="mt-4 text-lg font-semibold">{f.title}</h2>
              <p className="text-muted-foreground mt-2 text-sm">{f.body}</p>
            </article>
          ))}
        </div>

        <div className="panel mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 p-6">
          <span className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
            Supported platforms
          </span>
          {PLATFORMS.map((p) => (
            <span key={p.id} className="font-display text-sm font-semibold">
              {p.name}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
