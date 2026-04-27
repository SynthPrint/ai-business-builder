import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { STAGES } from "@/lib/game";
import { toast } from "sonner";

export function AddQuestCard() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<string>(STAGES[0].key);
  const [xp, setXp] = useState<number>(100);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from("quests").insert({
        title: title.trim(),
        description: description.trim() || "Custom quest",
        stage,
        xp_reward: Math.max(10, Math.min(1000, Number(xp) || 50)),
        is_ai_generated: false,
        sort_order: 999,
      });
      if (error) throw error;
      toast.success("Quest added!", { description: "Find it in your Quests list." });
      setTitle("");
      setDescription("");
      setXp(100);
      qc.invalidateQueries({ queryKey: ["quests"] });
    } catch (e) {
      toast.error("Could not add quest", { description: e instanceof Error ? e.message : "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
          <PlusCircle className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <h2 className="font-semibold">Add a quest manually</h2>
          <p className="text-xs text-muted-foreground">Create your own quests without AI</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="quest-title" className="text-xs">Title</Label>
          <Input
            id="quest-title"
            placeholder="e.g. Cold-email 20 local accountants"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
        </div>

        <div>
          <Label htmlFor="quest-desc" className="text-xs">Description</Label>
          <Textarea
            id="quest-desc"
            placeholder="What does completing this look like?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="resize-none"
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Stage</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="quest-xp" className="text-xs">XP reward</Label>
            <Input
              id="quest-xp"
              type="number"
              min={10}
              max={1000}
              step={10}
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
            />
          </div>
        </div>

        <Button onClick={submit} disabled={busy} className="w-full font-semibold">
          {busy ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Adding…</>
          ) : (
            <><Plus className="h-4 w-4 mr-2" />Add quest</>
          )}
        </Button>
      </div>
    </div>
  );
}
