import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const playerQuery = () =>
  queryOptions({
    queryKey: ["player"],
    queryFn: async () => {
      const { data, error } = await supabase.from("player").select("*").eq("id", "me").maybeSingle();
      if (error) throw error;
      if (!data) {
        // Defensive: insert if missing
        const { data: created, error: insErr } = await supabase
          .from("player")
          .insert({ id: "me" })
          .select()
          .single();
        if (insErr) throw insErr;
        return created;
      }
      return data;
    },
  });

export const questsQuery = () =>
  queryOptions({
    queryKey: ["quests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quests")
        .select("*")
        .order("stage")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const completionsQuery = () =>
  queryOptions({
    queryKey: ["completions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quest_completions")
        .select("*")
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const checkInsQuery = () =>
  queryOptions({
    queryKey: ["check_ins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("check_ins")
        .select("*")
        .order("check_in_date", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data;
    },
  });

export const badgesQuery = () =>
  queryOptions({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("badges").select("*");
      if (error) throw error;
      return data;
    },
  });

export const badgeAwardsQuery = () =>
  queryOptions({
    queryKey: ["badge_awards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badge_awards")
        .select("*")
        .order("awarded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const aiBreakdownsQuery = () =>
  queryOptions({
    queryKey: ["ai_breakdowns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_breakdowns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
