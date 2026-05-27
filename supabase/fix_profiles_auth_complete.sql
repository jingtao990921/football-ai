-- =============================================================================
-- Football AI — 完整修复：profiles + auth 同步 + trigger + RLS + admin 账号
-- 在 Supabase Dashboard → SQL Editor 中整段执行（可重复执行）
-- =============================================================================

-- ─── 1. 清理损坏的 trigger（含错误的 updated_at）────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;

-- 误挂在其它表上的 updated_at trigger（若存在）
DROP TRIGGER IF EXISTS set_updated_at ON auth.users;
DROP TRIGGER IF EXISTS handle_updated_at ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- ─── 2. 确保 profiles 表结构完整 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email text,
    username text NOT NULL,
    avatar_url text,
    vip_status boolean NOT NULL DEFAULT false,
    role text NOT NULL DEFAULT 'user',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vip_status boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- username 默认值（满足 NOT NULL，真正值由 trigger 写入）
ALTER TABLE public.profiles ALTER COLUMN username SET DEFAULT 'user';
ALTER TABLE public.profiles ALTER COLUMN vip_status SET DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE public.profiles ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.profiles ALTER COLUMN updated_at SET DEFAULT now();

-- 修复已有空 username
UPDATE public.profiles
SET username = coalesce(
    nullif(trim(username), ''),
    split_part(email, '@', 1),
    'user_' || substr(id::text, 1, 8)
)
WHERE username IS NULL OR trim(username) = '';

ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

-- 外键（若缺失）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'profiles_id_fkey'
          AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_id_fkey
            FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ─── 3. updated_at：仅 profiles 表 UPDATE 时更新 ───────────────────────────
CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_profiles_updated_at();

-- ─── 4. 新用户注册 → 自动写入 profiles ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_username text;
    v_meta_username text;
BEGIN
    v_meta_username := coalesce(
        nullif(trim(NEW.raw_user_meta_data ->> 'username'), ''),
        nullif(trim(NEW.raw_user_meta_data ->> 'full_name'), '')
    );

    v_username := coalesce(
        v_meta_username,
        nullif(trim(split_part(NEW.email, '@', 1)), ''),
        'user_' || substr(NEW.id::text, 1, 8)
    );

    -- 只保留安全字符
    v_username := regexp_replace(v_username, '[^a-zA-Z0-9_]', '', 'g');
    IF length(v_username) < 2 THEN
        v_username := 'user_' || substr(NEW.id::text, 1, 8);
    END IF;
    v_username := left(v_username, 30);

    INSERT INTO public.profiles (
        id,
        email,
        username,
        avatar_url,
        vip_status,
        role,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        v_username,
        NEW.raw_user_meta_data ->> 'avatar_url',
        false,
        'user',
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = COALESCE(NULLIF(public.profiles.username, ''), EXCLUDED.username),
        updated_at = now();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ─── 5. 同步所有 auth.users → profiles（含空表修复）────────────────────────
INSERT INTO public.profiles (
    id,
    email,
    username,
    avatar_url,
    vip_status,
    role,
    created_at,
    updated_at
)
SELECT
    u.id,
    u.email,
    left(
        coalesce(
            nullif(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'), ''),
            'user_' || substr(u.id::text, 1, 8)
        ),
        30
    ),
    u.raw_user_meta_data ->> 'avatar_url',
    false,
    'user',
    coalesce(u.created_at, now()),
    now()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- ─── 6. 指定管理员账号 ───────────────────────────────────────────────────────
UPDATE public.profiles p
SET
    email = u.email,
    username = 'jingtao',
    role = 'admin',
    vip_status = true,
    updated_at = now()
FROM auth.users u
WHERE u.email = 'jingtao990921@gmail.com'
  AND p.id = u.id;

INSERT INTO public.profiles (
    id, email, username, avatar_url, vip_status, role, created_at, updated_at
)
SELECT
    u.id,
    u.email,
    'jingtao',
    null,
    true,
    'admin',
    coalesce(u.created_at, now()),
    now()
FROM auth.users u
WHERE u.email = 'jingtao990921@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- ─── 7. is_admin() 辅助函数 ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    );
$$;

-- ─── 8. RLS：删除重复 policy 后重建 ─────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "profiles_select_own_or_admin"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own_or_admin"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (id = auth.uid() OR public.is_admin());

-- 匿名可读（可选，用于公开展示；不需要可注释掉）
DROP POLICY IF EXISTS "profiles_select_anon" ON public.profiles;

-- ─── 9. 验证 ───────────────────────────────────────────────────────────────
SELECT id, email, username, role, vip_status, created_at
FROM public.profiles
ORDER BY created_at DESC;

SELECT u.email, p.username, p.role, p.vip_status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id;
