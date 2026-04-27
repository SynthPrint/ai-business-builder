import { useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Flame, Loader2 } from "lucide-react";
import { playerQuery, checkInsQuery } from "@/lib/queries";
import { dailyCheckIn } from "@/lib/mutations";
import { todayISO } from "@/lib/game";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function CheckInCard() {
  const qc = useQueryClient();
  const { data: player } = useSuspenseQuery(playerQuery());
  const { data: checkIns } = useSuspenseQuery(checkInsQuery());
  const today = todayISO();
  const alreadyCheckedIn = player.last_check_in === today || checkIns.some((c) => c.check_in_date === today);

  const [score, setScore] = useState(7);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const handleCheckIn = async () => {
    setBusy(true);
    try {
      const res = await dailyCheckIn(score, note, qc);
      if (res.alreadyCheckedIn) {
        toast.info("Already checked in today");
      } else {
        toast.success(`+${res.xpBonus} XP · ${res.newStreak}-day streak 🔥`, {
          description: res.awardedBadges.length ? `New badge: ${res.awardedBadges.join(", ")}` : undefined,
        });
        setNote("");
      }
    } catch (e) {
      toast.error("Check-in failed", { description: e instanceof Error ? e.message : "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-streak/15 text-streak">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">Daily check-in</h2>
          <p className="text-xs text-muted-foreground">Keep your streak alive · earn bonus XP</p>
        </div>
      </div>

      {alreadyCheckedIn ? (
        <div className="mt-4 rounded-xl border border-success/30 bg-success/10 p-4 text-sm">
          <div className="font-medium text-success">✓ Checked in today</div>
          <div className="text-xs text-muted-foreground mt-1">
            Current streak: <span className="font-semibold text-foreground">{player.streak} days</span>. Come back tomorrow.
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">
              Today's efficiency: <span className="font-semibold text-foreground">{score}/10</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value))}
              className="w-full accent-primary mt-1"
            />
          </div>
          <Textarea
            placeholder="Biggest bottleneck today? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="resize-none"
          />
          <Button onClick={handleCheckIn} disabled={busy} className="w-full bg-gradient-streak text-foreground hover:opacity-90">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check in & claim bonus"}
          </Button>
        </div>
      )}
    </div>
  );
}
