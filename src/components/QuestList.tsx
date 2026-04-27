import { useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Check, Loader2, Lock, Sparkles, Trash2 } from "lucide-react";
import { questsQuery, completionsQuery } from "@/lib/queries";
import { STAGES, stageMeta } from "@/lib/game";
import { completeQuest } from "@/lib/mutations";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function QuestList({ filterStage }: { filterStage?: string }) {
  const qc = useQueryClient();
  const { data: quests } = useSuspenseQuery(questsQuery());
  const { data: completions } = useSuspenseQuery(completionsQuery());
  const completedIds = new Set(completions.map((c) => c.quest_id));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const stages = filterStage ? STAGES.filter((s) => s.key === filterStage) : STAGES;

  const handleComplete = async (q: typeof quests[number]) => {
    setBusyId(q.id);
    try {
      const res = await completeQuest(q, undefined, qc);
      toast.success(`+${res.xpEarned} XP earned!`, {
        description: [
          res.leveledUp ? `🎉 Leveled up to ${res.newLevel}!` : null,
          res.newBadges.length ? `🏆 New badge: ${res.newBadges.join(", ")}` : null,
        ].filter(Boolean).join(" · ") || undefined,
      });
    } catch (e) {
      toast.error("Could not complete quest", { description: e instanceof Error ? e.message : "" });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (questId: string) => {
    setDeletingId(questId);
    try {
      // Remove any completions first (no FK cascade in schema)
      const { error: cErr } = await supabase
        .from("quest_completions")
        .delete()
        .eq("quest_id", questId);
      if (cErr) throw cErr;
      const { error } = await supabase.from("quests").delete().eq("id", questId);
      if (error) throw error;
      toast.success("Quest deleted");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["quests"] }),
        qc.invalidateQueries({ queryKey: ["completions"] }),
      ]);
    } catch (e) {
      toast.error("Could not delete quest", { description: e instanceof Error ? e.message : "" });
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <div className="space-y-8">
      {stages.map((stage) => {
        const stageQuests = quests.filter((q) => q.stage === stage.key);
        const done = stageQuests.filter((q) => completedIds.has(q.id)).length;
        const total = stageQuests.length;
        const pct = total ? (done / total) * 100 : 0;

        return (
          <section key={stage.key}>
            <div className="flex items-end justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center font-bold"
                  style={{ background: `var(--${stage.color})`, color: "var(--background)" }}
                >
                  {stage.order}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{stage.label}</h3>
                  <p className="text-xs text-muted-foreground">{done}/{total} quests complete</p>
                </div>
              </div>
              <div className="hidden sm:block w-40 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{ width: `${pct}%`, background: `var(--${stage.color})` }}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {stageQuests.map((q) => {
                const isDone = completedIds.has(q.id);
                const meta = stageMeta(q.stage);
                return (
                  <div
                    key={q.id}
                    className={cn(
                      "rounded-xl border p-4 transition-all",
                      isDone
                        ? "border-success/30 bg-success/5"
                        : "border-border bg-card hover:border-primary/40 hover:shadow-glow",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: `color-mix(in oklab, var(--${meta.color}) 20%, transparent)`,
                              color: `var(--${meta.color})`,
                            }}
                          >
                            {q.is_ai_generated ? "AI" : meta.label}
                          </span>
                          <span className="text-xs font-semibold text-xp">+{q.xp_reward} XP</span>
                          {q.badge_key && <span className="text-[10px] text-muted-foreground">🏆 badge</span>}
                          {q.is_ai_generated && <Sparkles className="h-3 w-3 text-primary" />}
                        </div>
                        <h4 className="font-semibold text-sm leading-snug">{q.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{q.description}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      {isDone ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-success">
                          <Check className="h-4 w-4" /> Completed
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleComplete(q)}
                          disabled={busyId === q.id}
                          className="w-full"
                        >
                          {busyId === q.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <><Lock className="h-3.5 w-3.5 mr-1.5" /> Mark complete</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
