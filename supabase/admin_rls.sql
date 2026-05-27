-- =============================================================================
-- Football AI — Admin RLS（matches / predictions 写权限）
-- 在 fix_profiles_auth_complete.sql 之后执行
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS predictions_one_per_match_idx
    ON public.predictions (match_id);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_admin_insert" ON public.matches;
DROP POLICY IF EXISTS "matches_admin_update" ON public.matches;
DROP POLICY IF EXISTS "matches_admin_delete" ON public.matches;
DROP POLICY IF EXISTS "matches_select_all" ON public.matches;

CREATE POLICY "matches_select_all"
    ON public.matches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "matches_admin_insert"
    ON public.matches FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "matches_admin_update"
    ON public.matches FOR UPDATE TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "matches_admin_delete"
    ON public.matches FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "predictions_select_anon" ON public.predictions;
DROP POLICY IF EXISTS "predictions_admin_insert" ON public.predictions;
DROP POLICY IF EXISTS "predictions_admin_update" ON public.predictions;
DROP POLICY IF EXISTS "predictions_admin_delete" ON public.predictions;

CREATE POLICY "predictions_select_anon"
    ON public.predictions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "predictions_admin_insert"
    ON public.predictions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "predictions_admin_update"
    ON public.predictions FOR UPDATE TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "predictions_admin_delete"
    ON public.predictions FOR DELETE TO authenticated USING (public.is_admin());
