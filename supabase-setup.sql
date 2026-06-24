-- ============================================================
--  Do It For Me — Supabase Database Setup Script (v2)
--  Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================

-- ── STEP 1: Disable email confirmation so users can log in immediately ───────
-- Go to: Authentication → Providers → Email → Toggle OFF "Confirm email"
-- OR run the line below (only works if you have admin/service role access):
-- UPDATE auth.config SET confirm_email = false;
-- Most users should do this via the Dashboard UI instead.


-- ── STEP 2: Create the notes table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── STEP 3: Indexes ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS notes_user_id_idx   ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON public.notes(created_at DESC);

-- ── STEP 4: Enable Row Level Security ────────────────────────────────────────
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- ── STEP 5: RLS Policies ─────────────────────────────────────────────────────
-- Drop existing policies first so re-running this script is safe
DROP POLICY IF EXISTS "Users can view their own notes"   ON public.notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

CREATE POLICY "Users can view their own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- ── STEP 6: Auto-update updated_at trigger ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notes_updated_at ON public.notes;
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ── STEP 7: Grant permissions to anon and authenticated roles ────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.notes TO authenticated;
GRANT SELECT ON public.notes TO anon;

-- ============================================================
--  IMPORTANT — After running this SQL, do ONE more thing:
--
--  1. Go to: Authentication → Providers → Email
--  2. Toggle OFF "Confirm email"
--  3. Click Save
--
--  This lets users register and log in immediately without
--  needing to click a confirmation email.
-- ============================================================