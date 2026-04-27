import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { badgesQuery, badgeAwardsQuery } from "@/lib/queries";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/badges")({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(badgesQuery());
    queryClient.ensureQueryData(badgeAwardsQuery());
  },
  head: () => ({
    meta: [
      { title: "Badges — AI Automation Quest" },
      { name: "description", content: "Achievements and badges earned on your AI automation journey." },
    ],
  }),
  component: BadgesPage,
});

const TIER_STYLE: Record<string, string> = {
  bronze: "from-orange-700/30 to-orange-900/10 text-orange-300 border-orange-700/40",
  silver: "from-slate-400/30 to-slate-600/10 text-slate-200 border-slate-400/40",
  gold: "from-yellow-500/30 to-yellow-700/10 text-yellow-300 border-yellow-500/40",
  platinum: "from-cyan-300/30 to-cyan-500/10 text-cyan-200 border-cyan-300/40",
};

function BadgesGrid() {
  const { data: badges } = useSuspenseQuery(badgesQuery());
  const { data: awards } = useSuspenseQuery(badgeAwardsQuery());
  const earnedSet = new Map(awards.map((a) => [a.badge_key, a.awarded_at]));
  const earnedCount = awards.length;

  return (
    <>
      <div className="mb-6 rounded-2xl border border-border bg-gradient-card p-5 shadow-card flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Collection</p>
          <p className="text-2xl font-bold mt-1">
            <span className="text-gradient-xp">{earnedCount}</span>
            <span className="text-muted-foreground text-base"> / {badges.length} earned</span>
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">Keep questing to unlock more.</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {badges.map((b) => {
          const earned = earnedSet.has(b.key);
          const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[toPascal(b.icon)] ?? Icons.Award;
          const tone = TIER_STYLE[b.tier] ?? TIER_STYLE.bronze;
          return (
            <div
              key={b.key}
              className={cn(
                "rounded-xl border p-4 transition-all bg-gradient-to-br",
                earned ? tone : "border-border bg-card opacity-50",
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center mb-3",
                earned ? "bg-background/40" : "bg-secondary",
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="font-semibold text-sm">{b.name}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{b.description}</div>
              <div className="mt-3 text-[10px] uppercase tracking-widest font-semibold opacity-70">
                {earned ? "Earned" : "Locked"} · {b.tier}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function toPascal(s: string) {
  return s
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function BadgesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Badges</h1>
        <p className="text-sm text-muted-foreground mt-1">Trophies for milestones along your journey.</p>
      </header>
      <Suspense fallback={<div className="h-96 rounded-xl bg-card animate-pulse" />}>
        <BadgesGrid />
      </Suspense>
    </div>
  );
}
