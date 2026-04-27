
-- Player profile (single user app)
CREATE TABLE public.player (
  id TEXT PRIMARY KEY DEFAULT 'me',
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_check_in DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quest catalog
CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL, -- idea_validation, lead_gen, client_onboarding, automation_delivery, scaling
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  badge_key TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quest completions
CREATE TABLE public.quest_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL DEFAULT 'me',
  xp_earned INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(quest_id, player_id)
);

-- Daily check-ins
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'me',
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  efficiency_score INTEGER, -- 1-10 self-rating
  bottleneck_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(player_id, check_in_date)
);

-- Badges catalog
CREATE TABLE public.badges (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'award',
  tier TEXT NOT NULL DEFAULT 'bronze'
);

-- Badge awards
CREATE TABLE public.badge_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key TEXT NOT NULL REFERENCES public.badges(key) ON DELETE CASCADE,
  player_id TEXT NOT NULL DEFAULT 'me',
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(badge_key, player_id)
);

-- AI breakdowns history
CREATE TABLE public.ai_breakdowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'me',
  prompt_context TEXT,
  next_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  bottlenecks JSONB NOT NULL DEFAULT '[]'::jsonb,
  motivation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS with permissive policies (single-user, no auth)
ALTER TABLE public.player ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_breakdowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all" ON public.player FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON public.quests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON public.quest_completions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON public.check_ins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON public.badges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON public.badge_awards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON public.ai_breakdowns FOR ALL USING (true) WITH CHECK (true);

-- Seed player row
INSERT INTO public.player (id) VALUES ('me') ON CONFLICT DO NOTHING;

-- Seed badges
INSERT INTO public.badges (key, name, description, icon, tier) VALUES
  ('first_step', 'First Step', 'Completed your very first quest', 'footprints', 'bronze'),
  ('bottleneck_buster', 'Bottleneck Buster', 'Identified and tackled 3 business bottlenecks', 'wrench', 'silver'),
  ('first_client_closer', 'First Client Closer', 'Closed your first paying client', 'handshake', 'gold'),
  ('idea_validator', 'Idea Validator', 'Validated your AI automation niche', 'lightbulb', 'bronze'),
  ('lead_magnet', 'Lead Magnet', 'Built a working lead generation system', 'magnet', 'silver'),
  ('automation_architect', 'Automation Architect', 'Delivered your first automation to a client', 'cpu', 'gold'),
  ('scale_master', 'Scale Master', 'Reached the scaling stage', 'trending-up', 'platinum'),
  ('streak_starter', 'Streak Starter', 'Checked in 3 days in a row', 'flame', 'bronze'),
  ('streak_warrior', 'Streak Warrior', '7-day check-in streak', 'flame', 'silver'),
  ('streak_legend', 'Streak Legend', '30-day check-in streak', 'flame', 'gold'),
  ('level_5', 'Apprentice', 'Reached level 5', 'star', 'bronze'),
  ('level_10', 'Operator', 'Reached level 10', 'star', 'silver'),
  ('level_20', 'Founder', 'Reached level 20', 'crown', 'gold')
ON CONFLICT (key) DO NOTHING;

-- Seed quests across the 5 stages
INSERT INTO public.quests (stage, title, description, xp_reward, badge_key, sort_order) VALUES
  -- Idea Validation
  ('idea_validation', 'Pick your niche', 'Choose 1 industry where your finance + Excel background gives you an edge (e.g. accounting firms, real estate, e-commerce ops).', 75, 'idea_validator', 1),
  ('idea_validation', 'List 10 painful bottlenecks', 'Write down 10 repetitive, manual processes in your target niche that AI/automation could eliminate.', 100, NULL, 2),
  ('idea_validation', 'Talk to 5 potential clients', 'Have 5 short discovery calls or DMs to validate the bottlenecks are real and worth paying to solve.', 150, NULL, 3),
  ('idea_validation', 'Define your offer', 'Write a 1-sentence offer: "I help [niche] save [X hours/week] by automating [process]."', 100, NULL, 4),

  -- Lead Generation
  ('lead_gen', 'Build a simple landing page', 'One page: who you help, what you automate, a CTA to book a call.', 100, NULL, 1),
  ('lead_gen', 'Set up an outreach list', 'Compile 50 targeted prospects in a spreadsheet with name, company, role, email.', 75, NULL, 2),
  ('lead_gen', 'Send 25 personalized outreach messages', 'Cold email or LinkedIn DMs referencing a specific bottleneck you can solve.', 125, 'lead_magnet', 3),
  ('lead_gen', 'Post 3 case-study style insights', 'Share automation wins or bottleneck breakdowns on LinkedIn to build authority.', 75, NULL, 4),

  -- Client Onboarding
  ('client_onboarding', 'Close your first client', 'Sign your first paid engagement, even if it''s a small pilot.', 300, 'first_client_closer', 1),
  ('client_onboarding', 'Run a discovery workshop', 'Map the client''s current process end-to-end and identify the top 3 bottlenecks.', 150, 'bottleneck_buster', 2),
  ('client_onboarding', 'Send a written proposal', 'Scope, deliverables, timeline, and price in a clean 1-page doc.', 100, NULL, 3),
  ('client_onboarding', 'Set up shared workspace', 'Slack/Notion/email cadence so the client always knows status.', 75, NULL, 4),

  -- Automation Delivery
  ('automation_delivery', 'Build your first automation', 'Ship a working automation (Zapier/Make/n8n/custom script) that removes a real bottleneck.', 250, 'automation_architect', 1),
  ('automation_delivery', 'Document the workflow', 'Loom video + 1-pager so the client can use and trust it without you.', 100, NULL, 2),
  ('automation_delivery', 'Measure time saved', 'Calculate hours/week saved and dollar impact. Send to the client.', 125, NULL, 3),
  ('automation_delivery', 'Get a testimonial', 'Ask the happy client for a 2-sentence written testimonial.', 100, NULL, 4),

  -- Scaling
  ('scaling', 'Productize your offer', 'Turn your custom work into a fixed-scope, fixed-price package.', 200, 'scale_master', 1),
  ('scaling', 'Hire your first contractor', 'Bring in a VA or junior automator to handle delivery work.', 250, NULL, 2),
  ('scaling', 'Build a referral loop', 'Ask every happy client for 2 intros and offer a referral incentive.', 150, NULL, 3),
  ('scaling', 'Hit $10k MRR', 'Reach $10,000 in monthly recurring or repeat revenue.', 500, NULL, 4)
ON CONFLICT DO NOTHING;
