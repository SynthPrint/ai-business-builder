import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { QuestList } from "@/components/QuestList";
import { questsQuery, completionsQuery } from "@/lib/queries";

export const Route = createFileRoute("/quests")({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(questsQuery());
    queryClient.ensureQueryData(completionsQuery());
  },
  head: () => ({
    meta: [
      { title: "Quests — AI Automation Quest" },
      { name: "description", content: "All quests across the 5 stages of building your AI automation agency." },
    ],
  }),
  component: QuestsPage,
});

function QuestsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Quests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          5 stages from idea validation to scaling. Complete quests to earn XP, badges, and level up.
        </p>
      </header>
      <Suspense fallback={<div className="h-96 rounded-xl bg-card animate-pulse" />}>
        <QuestList />
      </Suspense>
    </div>
  );
}
