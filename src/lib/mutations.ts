import { supabase } from "@/integrations/supabase/client";
import { levelFromXp, todayISO, daysBetween } from "@/lib/game";
import type { QueryClient } from "@tanstack/react-query";

async function awardBadgeIfMissing(badgeKey: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from("badge_awards")
    .select("id")
    .eq("badge_key", badgeKey)
    .eq("player_id", "me")
    .maybeSingle();
  if (existing) return false;
  const { error } = await supabase
    .from("badge_awards")
    .insert({ badge_key: badgeKey, player_id: "me" });
  if (error) return false;
  return true;
}

export type CompleteQuestResult = {
  xpEarned: number;
  newLevel: number;
  leveledUp: boolean;
  newBadges: string[];
};

export async function completeQuest(
  quest: { id: string; xp_reward: number; badge_key: string | null; stage: string },
  notes: string | undefined,
  qc: QueryClient,
): Promise<CompleteQuestResult> {
  // 1. Insert completion (unique constraint protects against double-claim)
  const { error: cErr } = await supabase
    .from("quest_completions")
    .insert({
      quest_id: quest.id,
      player_id: "me",
      xp_earned: quest.xp_reward,
      notes: notes || null,
    });
  if (cErr) throw cErr;

  // 2. Update player XP/level
  const { data: player, error: pErr } = await supabase
    .from("player").select("*").eq("id", "me").single();
  if (pErr) throw pErr;

  const newXp = player.xp + quest.xp_reward;
  const { level: newLevel } = levelFromXp(newXp);
  const leveledUp = newLevel > player.level;

  await supabase
    .from("player")
    .update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
    .eq("id", "me");

  // 3. Award badges
  const newBadges: string[] = [];
  if (quest.badge_key) {
    if (await awardBadgeIfMissing(quest.badge_key)) newBadges.push(quest.badge_key);
  }
  // First quest badge
  const { count } = await supabase
    .from("quest_completions")
    .select("id", { count: "exact", head: true })
    .eq("player_id", "me");
  if (count === 1) {
    if (await awardBadgeIfMissing("first_step")) newBadges.push("first_step");
  }
  // Bottleneck buster: 3 client_onboarding completions
  if (quest.stage === "client_onboarding") {
    const { count: ob } = await supabase
      .from("quest_completions")
      .select("id, quests!inner(stage)", { count: "exact", head: true })
      .eq("quests.stage", "client_onboarding");
    if ((ob ?? 0) >= 3) {
      if (await awardBadgeIfMissing("bottleneck_buster")) newBadges.push("bottleneck_buster");
    }
  }
  // Level milestone badges
  if (leveledUp) {
    if (newLevel >= 5 && (await awardBadgeIfMissing("level_5"))) newBadges.push("level_5");
    if (newLevel >= 10 && (await awardBadgeIfMissing("level_10"))) newBadges.push("level_10");
    if (newLevel >= 20 && (await awardBadgeIfMissing("level_20"))) newBadges.push("level_20");
  }

  await Promise.all([
    qc.invalidateQueries({ queryKey: ["player"] }),
    qc.invalidateQueries({ queryKey: ["completions"] }),
    qc.invalidateQueries({ queryKey: ["badge_awards"] }),
  ]);

  return { xpEarned: quest.xp_reward, newLevel, leveledUp, newBadges };
}

export type CheckInResult = {
  newStreak: number;
  awardedBadges: string[];
  xpBonus: number;
  alreadyCheckedIn: boolean;
};

export async function dailyCheckIn(
  efficiency: number,
  bottleneckNote: string | undefined,
  qc: QueryClient,
): Promise<CheckInResult> {
  const today = todayISO();

  const { data: existing } = await supabase
    .from("check_ins")
    .select("id")
    .eq("player_id", "me")
    .eq("check_in_date", today)
    .maybeSingle();

  if (existing) {
    return { newStreak: 0, awardedBadges: [], xpBonus: 0, alreadyCheckedIn: true };
  }

  await supabase.from("check_ins").insert({
    player_id: "me",
    check_in_date: today,
    efficiency_score: efficiency,
    bottleneck_note: bottleneckNote || null,
  });

  const { data: player } = await supabase
    .from("player").select("*").eq("id", "me").single();
  if (!player) throw new Error("No player");

  let newStreak = 1;
  if (player.last_check_in) {
    const diff = daysBetween(player.last_check_in, today);
    if (diff === 1) newStreak = player.streak + 1;
    else if (diff === 0) newStreak = player.streak;
  }
  const longest = Math.max(player.longest_streak ?? 0, newStreak);

  // Streak XP bonus (small)
  const xpBonus = 25 + Math.min(newStreak, 30) * 5;
  const newXp = player.xp + xpBonus;
  const { level: newLevel } = levelFromXp(newXp);

  await supabase.from("player").update({
    streak: newStreak,
    longest_streak: longest,
    last_check_in: today,
    xp: newXp,
    level: newLevel,
    updated_at: new Date().toISOString(),
  }).eq("id", "me");

  const awardedBadges: string[] = [];
  if (newStreak >= 3 && (await awardBadgeIfMissing("streak_starter"))) awardedBadges.push("streak_starter");
  if (newStreak >= 7 && (await awardBadgeIfMissing("streak_warrior"))) awardedBadges.push("streak_warrior");
  if (newStreak >= 30 && (await awardBadgeIfMissing("streak_legend"))) awardedBadges.push("streak_legend");

  await Promise.all([
    qc.invalidateQueries({ queryKey: ["player"] }),
    qc.invalidateQueries({ queryKey: ["check_ins"] }),
    qc.invalidateQueries({ queryKey: ["badge_awards"] }),
  ]);

  return { newStreak, awardedBadges, xpBonus, alreadyCheckedIn: false };
}
