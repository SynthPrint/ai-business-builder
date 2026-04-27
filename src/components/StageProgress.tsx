import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { questsQuery, completionsQuery } from "@/lib/queries";
import { STAGES } from "@/lib/game";

export function StageProgress() {
  const { data: quests } = useSuspenseQuery(questsQuery());
  const { data: completions } = useSuspenseQuery(completionsQuery());
  const completedIds = new Set(completions.map((c) => c.quest_id));

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold">Your journey</h2>
          <p className="text-xs text-muted-foreground">5 stages from idea to scale</p>
        </div>
        <Link
          to="/quests"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          See all quests <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {STAGES.map((stage) => {
          const sq = quests.filter((q) => q.stage === stage.key);
          const done = sq.filter((q) => completedIds.has(q.id)).length;
          const total = sq.length;
          const pct = total ? (done / total) * 100 : 0;
          const isComplete = total > 0 && done === total;

          return (
            <div key={stage.key} className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background: isComplete ? `var(--${stage.color})` : `color-mix(in oklab, var(--${stage.color}) 25%, transparent)`,
                  color: isComplete ? "var(--background)" : `var(--${stage.color})`,
                }}
              >
                {stage.order}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium truncate">{stage.label}</span>
                  <span className="text-muted-foreground tabular-nums">{done}/{total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${pct}%`, background: `var(--${stage.color})` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
