// Game logic helpers — pure, no I/O.

export const STAGES = [
  { key: "idea_validation", label: "Idea Validation", color: "stage-idea", order: 1 },
  { key: "lead_gen", label: "Lead Generation", color: "stage-lead", order: 2 },
  { key: "client_onboarding", label: "Client Onboarding", color: "stage-onboarding", order: 3 },
  { key: "automation_delivery", label: "Automation Delivery", color: "stage-delivery", order: 4 },
  { key: "scaling", label: "Scaling", color: "stage-scaling", order: 5 },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];

export const stageMeta = (key: string) =>
  STAGES.find((s) => s.key === key) ?? STAGES[0];

// XP curve: level N requires N * 250 XP cumulative
export function levelFromXp(xp: number): { level: number; intoLevelXp: number; nextLevelXp: number; progress: number } {
  let level = 1;
  let needed = 250;
  let acc = 0;
  while (xp >= acc + needed) {
    acc += needed;
    level++;
    needed = level * 250;
  }
  const intoLevelXp = xp - acc;
  return { level, intoLevelXp, nextLevelXp: needed, progress: intoLevelXp / needed };
}

export function levelTitle(level: number): string {
  if (level >= 20) return "Founder";
  if (level >= 15) return "Strategist";
  if (level >= 10) return "Operator";
  if (level >= 5) return "Apprentice";
  if (level >= 3) return "Builder";
  return "Rookie";
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  const d1 = new Date(a + "T00:00:00Z").getTime();
  const d2 = new Date(b + "T00:00:00Z").getTime();
  return Math.round((d2 - d1) / 86400000);
}
