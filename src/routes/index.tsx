import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { PlayerHeroCard } from "@/components/PlayerHeroCard";
import { CheckInCard } from "@/components/CheckInCard";
import { AiBreakdownCard } from "@/components/AiBreakdownCard";
import { AddQuestCard } from "@/components/AddQuestCard";
import { StageProgress } from "@/components/StageProgress";
import { RecentActivity } from "@/components/RecentActivity";
import { playerQuery, questsQuery, completionsQuery, checkInsQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(playerQuery());
    queryClient.ensureQueryData(questsQuery());
    queryClient.ensureQueryData(completionsQuery());
    queryClient.ensureQueryData(checkInsQuery());
  },
  head: () => ({
    meta: [
      { title: "Dashboard — AI Automation Quest" },
      { name: "description", content: "Track your XP, streaks, badges, and quest progress for your AI automation business." },
    ],
  }),
  component: Index,
});

function CardSkeleton({ h = "h-40" }: { h?: string }) {
  return <div className={`rounded-2xl border border-border bg-card ${h} animate-pulse`} />;
}

function Index() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 space-y-6">
      <Suspense fallback={<CardSkeleton h="h-44" />}>
        <PlayerHeroCard />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6 min-w-0">
          <AddQuestCard />
          <Suspense fallback={<CardSkeleton h="h-64" />}>
            <AiBreakdownCard />
          </Suspense>
          <Suspense fallback={<CardSkeleton h="h-64" />}>
            <StageProgress />
          </Suspense>
        </div>
        <div className="space-y-6">
          <Suspense fallback={<CardSkeleton h="h-56" />}>
            <CheckInCard />
          </Suspense>
          <Suspense fallback={<CardSkeleton h="h-56" />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
