import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { checkInsQuery, completionsQuery, questsQuery } from "@/lib/queries";
import { STAGES } from "@/lib/game";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/insights")({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(checkInsQuery());
    queryClient.ensureQueryData(completionsQuery());
    queryClient.ensureQueryData(questsQuery());
  },
  head: () => ({
    meta: [
      { title: "Insights — AI Automation Quest" },
      { name: "description", content: "Charts of your efficiency, streaks, and quest completion progress." },
    ],
  }),
  component: InsightsPage,
});

function Charts() {
  const { data: checkIns } = useSuspenseQuery(checkInsQuery());
  const { data: completions } = useSuspenseQuery(completionsQuery());
  const { data: quests } = useSuspenseQuery(questsQuery());

  // Efficiency over last 14 days
  const days: { date: string; score: number | null }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const ci = checkIns.find((c) => c.check_in_date === iso);
    days.push({ date: iso.slice(5), score: ci?.efficiency_score ?? null });
  }

  // XP per stage
  const xpPerStage = STAGES.map((s) => {
    const stageQuestIds = new Set(quests.filter((q) => q.stage === s.key).map((q) => q.id));
    const xp = completions
      .filter((c) => stageQuestIds.has(c.quest_id))
      .reduce((sum, c) => sum + (c.xp_earned ?? 0), 0);
    return { stage: s.label.split(" ")[0], xp };
  });

  const totalXp = completions.reduce((s, c) => s + (c.xp_earned ?? 0), 0);
  const avgEff = (() => {
    const scored = checkIns.filter((c) => typeof c.efficiency_score === "number");
    if (!scored.length) return 0;
    return scored.reduce((s, c) => s + (c.efficiency_score ?? 0), 0) / scored.length;
  })();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total XP earned" value={totalXp.toLocaleString()} />
        <Stat label="Quests completed" value={completions.length.toString()} />
        <Stat label="Avg efficiency" value={avgEff ? avgEff.toFixed(1) + "/10" : "—"} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h3 className="font-semibold text-sm">Efficiency · last 14 days</h3>
        <p className="text-xs text-muted-foreground mb-4">Self-rated daily score from check-ins.</p>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={days}>
              <defs>
                <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.16 195)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.78 0.16 195)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.03 260)" />
              <XAxis dataKey="date" stroke="oklch(0.7 0.02 255)" fontSize={11} />
              <YAxis domain={[0, 10]} stroke="oklch(0.7 0.02 255)" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "oklch(0.22 0.03 260)", border: "1px solid oklch(0.3 0.03 260)", borderRadius: 12, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="score" stroke="oklch(0.78 0.16 195)" strokeWidth={2} fill="url(#effGrad)" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h3 className="font-semibold text-sm">XP earned by stage</h3>
        <p className="text-xs text-muted-foreground mb-4">See where you've made the most progress.</p>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={xpPerStage}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.03 260)" />
              <XAxis dataKey="stage" stroke="oklch(0.7 0.02 255)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0.02 255)" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "oklch(0.22 0.03 260)", border: "1px solid oklch(0.3 0.03 260)", borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="xp" fill="oklch(0.84 0.16 85)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-card p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1 text-gradient-primary">{value}</div>
    </div>
  );
}

function InsightsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your efficiency and progress over time.</p>
      </header>
      <Suspense fallback={<div className="h-96 rounded-xl bg-card animate-pulse" />}>
        <Charts />
      </Suspense>
    </div>
  );
}
