import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Loader2, Lightbulb, Wrench, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateBreakdown } from "@/lib/ai.functions";
import { toast } from "sonner";

type Breakdown = {
  next_tasks: { title: string; description: string; estimated_xp: number }[];
  bottlenecks: { name: string; why_it_matters: string; fix: string }[];
  motivation: string;
};

export function AiBreakdownCard() {
  const qc = useQueryClient();
  const [context, setContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Breakdown | null>(null);

  const run = async () => {
    setBusy(true);
    try {
      const res = await generateBreakdown({ data: { context } });
      if (res.error || !res.breakdown) {
        toast.error(res.error ?? "AI failed");
      } else {
        setResult(res.breakdown);
        qc.invalidateQueries({ queryKey: ["ai_breakdowns"] });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-card p-5 shadow-card relative overflow-hidden">
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">AI Coach: Next moves</h2>
            <p className="text-xs text-muted-foreground">Get tailored next tasks + bottleneck breakdown</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Textarea
            placeholder="What are you working on right now? (optional context — e.g. 'closing 2 leads, stuck on pricing')"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            className="resize-none"
            maxLength={2000}
          />
          <Button
            onClick={run}
            disabled={busy}
            className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 font-semibold"
          >
            {busy ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Thinking…</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Break down my next tasks</>
            )}
          </Button>
        </div>

        {result && (
          <div className="mt-5 space-y-4">
            <Section icon={<Lightbulb className="h-4 w-4" />} title="Next tasks" tone="primary">
              <ul className="space-y-2">
                {result.next_tasks.map((t, i) => (
                  <li key={i} className="rounded-lg border border-border bg-background/40 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm">{t.title}</div>
                      <span className="text-[10px] font-semibold text-xp shrink-0">~{t.estimated_xp} XP</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section icon={<Wrench className="h-4 w-4" />} title="Bottlenecks to fix" tone="warning">
              <ul className="space-y-2">
                {result.bottlenecks.map((b, i) => (
                  <li key={i} className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                    <div className="font-medium text-sm">{b.name}</div>
                    <p className="text-xs text-muted-foreground mt-1"><span className="text-foreground/80">Why:</span> {b.why_it_matters}</p>
                    <p className="text-xs text-muted-foreground mt-1"><span className="text-success">Fix:</span> {b.fix}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm italic">
              <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{result.motivation}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, children, tone }: { icon: React.ReactNode; title: string; children: React.ReactNode; tone: "primary" | "warning" }) {
  const toneClass = tone === "primary" ? "text-primary" : "text-warning";
  return (
    <div>
      <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${toneClass} mb-2`}>
        {icon} {title}
      </div>
      {children}
    </div>
  );
}
