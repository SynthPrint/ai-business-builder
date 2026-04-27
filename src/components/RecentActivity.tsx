import { useSuspenseQuery } from "@tanstack/react-query";
import { Activity, CheckCircle2 } from "lucide-react";
import { completionsQuery, questsQuery } from "@/lib/queries";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
  const { data: completions } = useSuspenseQuery(completionsQuery());
  const { data: quests } = useSuspenseQuery(questsQuery());
  const questMap = new Map(quests.map((q) => [q.id, q]));
  const recent = completions.slice(0, 6);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15 text-success">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">Recent wins</h2>
          <p className="text-xs text-muted-foreground">Your last completed quests</p>
        </div>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No completions yet. Pick a quest and start building!
        </p>
      ) : (
        <ul className="space-y-2">
          {recent.map((c) => {
            const q = questMap.get(c.quest_id);
            return (
              <li key={c.id} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{q?.title ?? "Quest"}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="text-xp font-semibold">+{c.xp_earned} XP</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(c.completed_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
