import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InputSchema = z.object({
  context: z.string().max(2000).optional(),
});

type Breakdown = {
  next_tasks: { title: string; description: string; estimated_xp: number }[];
  bottlenecks: { name: string; why_it_matters: string; fix: string }[];
  motivation: string;
};

export const generateBreakdown = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ breakdown: Breakdown | null; error: string | null }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { breakdown: null, error: "AI is not configured." };
    }

    // Pull current state to ground the AI
    const [{ data: player }, { data: completions }, { data: quests }] = await Promise.all([
      supabaseAdmin.from("player").select("*").eq("id", "me").maybeSingle(),
      supabaseAdmin.from("quest_completions").select("quest_id, completed_at").eq("player_id", "me"),
      supabaseAdmin.from("quests").select("id, stage, title"),
    ]);

    const completedIds = new Set((completions ?? []).map((c) => c.quest_id));
    const remainingByStage: Record<string, string[]> = {};
    for (const q of quests ?? []) {
      if (completedIds.has(q.id)) continue;
      remainingByStage[q.stage] = remainingByStage[q.stage] ?? [];
      remainingByStage[q.stage].push(q.title);
    }

    const userContext = data.context?.trim() || "(none provided)";
    const stateSummary = `Level ${player?.level ?? 1}, ${player?.xp ?? 0} XP, streak ${player?.streak ?? 0}.
Completed quests: ${completions?.length ?? 0}.
Remaining quests by stage: ${JSON.stringify(remainingByStage)}.`;

    const systemPrompt = `You are an AI business coach for a solo founder building an AI-automation agency for small companies. The founder has a finance/Excel background and excels at finding bottlenecks. You give concrete, actionable next steps and identify the single biggest bottleneck to remove next. Be direct, motivational, no fluff. Always respond by calling the suggest_next_steps function.`;

    const userPrompt = `Current player state:\n${stateSummary}\n\nFounder context / what they're working on right now:\n${userContext}\n\nSuggest 3-5 concrete next tasks (title + 1-2 sentence description + estimated_xp 50-200), and 2-3 likely bottlenecks slowing them down with how to fix each. End with a short motivational line.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "suggest_next_steps",
          description: "Provide actionable next tasks and bottlenecks.",
          parameters: {
            type: "object",
            properties: {
              next_tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    estimated_xp: { type: "number" },
                  },
                  required: ["title", "description", "estimated_xp"],
                  additionalProperties: false,
                },
              },
              bottlenecks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    why_it_matters: { type: "string" },
                    fix: { type: "string" },
                  },
                  required: ["name", "why_it_matters", "fix"],
                  additionalProperties: false,
                },
              },
              motivation: { type: "string" },
            },
            required: ["next_tasks", "bottlenecks", "motivation"],
            additionalProperties: false,
          },
        },
      },
    ];

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools,
          tool_choice: { type: "function", function: { name: "suggest_next_steps" } },
        }),
      });

      if (res.status === 429) {
        return { breakdown: null, error: "Rate limit hit. Try again in a minute." };
      }
      if (res.status === 402) {
        return { breakdown: null, error: "AI credits exhausted. Add credits in Settings." };
      }
      if (!res.ok) {
        const txt = await res.text();
        console.error("AI gateway error", res.status, txt);
        return { breakdown: null, error: "AI request failed." };
      }

      const json = await res.json();
      const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        return { breakdown: null, error: "AI did not return a structured response." };
      }
      const parsed = JSON.parse(toolCall.function.arguments) as Breakdown;

      // Persist
      await supabaseAdmin.from("ai_breakdowns").insert({
        player_id: "me",
        prompt_context: userContext,
        next_tasks: parsed.next_tasks,
        bottlenecks: parsed.bottlenecks,
        motivation: parsed.motivation,
      });

      return { breakdown: parsed, error: null };
    } catch (err) {
      console.error("AI breakdown failed:", err);
      return { breakdown: null, error: "AI request failed." };
    }
  });
