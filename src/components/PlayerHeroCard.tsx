import { useSuspenseQuery } from "@tanstack/react-query";
import { playerQuery } from "@/lib/queries";
import { levelFromXp, levelTitle } from "@/lib/game";
import { Flame, Zap, Trophy } from "lucide-react";

export function PlayerHeroCard() {
  const { data: player } = useSuspenseQuery(playerQuery());
  const { level, intoLevelXp, nextLevelXp, progress } = levelFromXp(player.xp);
  const title = levelTitle(level);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-6 shadow-elevated">
      <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] items-center">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-xp" />
            <span>Level {level} · {title}</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-gradient-primary">{player.xp.toLocaleString()}</span>
            <span className="text-muted-foreground text-xl ml-2">XP earned</span>
          </h1>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{intoLevelXp} / {nextLevelXp} XP to level {level + 1}</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-xp transition-all duration-700"
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              />
              <div className="absolute inset-0 animate-shimmer" />
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col gap-3">
          <Stat
            icon={<Flame className="h-5 w-5" />}
            label="Streak"
            value={`${player.streak}d`}
            sub={`Best ${player.longest_streak}d`}
            tone="streak"
          />
          <Stat
            icon={<Zap className="h-5 w-5" />}
            label="Level"
            value={`${level}`}
            sub={title}
            tone="primary"
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon, label, value, sub, tone,
}: { icon: React.ReactNode; label: string; value: string; sub: string; tone: "streak" | "primary" }) {
  const toneClass =
    tone === "streak"
      ? "from-streak/20 to-streak/5 text-streak"
      : "from-primary/20 to-primary/5 text-primary";
  return (
    <div className={`flex-1 rounded-xl border border-border bg-gradient-to-br ${toneClass} px-4 py-3 min-w-[110px]`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest opacity-80">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
