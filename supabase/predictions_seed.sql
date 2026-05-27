-- =============================================================================
-- Football AI — predictions 表 + 10 条测试 AI 预测
-- 在 Supabase Dashboard → SQL Editor 中整段粘贴执行
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. 创建 predictions 表
-- -----------------------------------------------------------------------------
create table if not exists public.predictions (
    id uuid primary key default gen_random_uuid(),
    match_id uuid not null references public.matches (id) on delete cascade,
    prediction_type text not null,
    prediction_text text not null,
    confidence numeric(5, 2) not null check (confidence >= 0 and confidence <= 100),
    analysis text not null,
    is_vip boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists predictions_match_id_idx on public.predictions (match_id);
create index if not exists predictions_created_at_idx on public.predictions (created_at desc);

comment on table public.predictions is 'AI match predictions linked to matches';
comment on column public.predictions.prediction_type is 'e.g. 1X2, Over/Under, BTTS, VIP Pick';
comment on column public.predictions.confidence is '0–100 confidence score';

-- -----------------------------------------------------------------------------
-- 2. RLS（允许匿名/登录用户读取；写入仅 service_role 或按需调整）
-- -----------------------------------------------------------------------------
alter table public.predictions enable row level security;

drop policy if exists "predictions_select_anon" on public.predictions;
create policy "predictions_select_anon"
    on public.predictions
    for select
    to anon, authenticated
    using (true);

-- 如需客户端插入预测，可取消下面注释：
-- drop policy if exists "predictions_insert_authenticated" on public.predictions;
-- create policy "predictions_insert_authenticated"
--     on public.predictions
--     for insert
--     to authenticated
--     with check (true);

-- -----------------------------------------------------------------------------
-- 3. 若 matches 不足 10 场，先补足测试比赛（可重复执行，按队名去重）
-- -----------------------------------------------------------------------------
insert into public.matches (home_team, away_team, league, match_time)
select v.home_team, v.away_team, v.league, v.match_time
from (
    values
        ('Arsenal', 'Chelsea', 'Premier League', now() + interval '1 day'),
        ('Liverpool', 'Manchester City', 'Premier League', now() + interval '2 days'),
        ('Manchester United', 'Tottenham', 'Premier League', now() + interval '3 days'),
        ('Real Madrid', 'Barcelona', 'La Liga', now() + interval '1 day'),
        ('Atletico Madrid', 'Sevilla', 'La Liga', now() + interval '4 days'),
        ('Bayern Munich', 'Borussia Dortmund', 'Bundesliga', now() + interval '2 days'),
        ('Inter Milan', 'AC Milan', 'Serie A', now() + interval '5 days'),
        ('Paris Saint-Germain', 'Marseille', 'Ligue 1', now() + interval '3 days'),
        ('Ajax', 'PSV', 'Eredivisie', now() + interval '6 days'),
        ('Benfica', 'Porto', 'Primeira Liga', now() + interval '7 days')
) as v(home_team, away_team, league, match_time)
where not exists (
    select 1
    from public.matches m
    where m.home_team = v.home_team
      and m.away_team = v.away_team
);

-- -----------------------------------------------------------------------------
-- 4. 删除这些测试比赛上的旧预测（避免重复执行时重复插入）
-- -----------------------------------------------------------------------------
delete from public.predictions p
using public.matches m
where p.match_id = m.id
  and (
      (m.home_team = 'Arsenal' and m.away_team = 'Chelsea')
      or (m.home_team = 'Liverpool' and m.away_team = 'Manchester City')
      or (m.home_team = 'Manchester United' and m.away_team = 'Tottenham')
      or (m.home_team = 'Real Madrid' and m.away_team = 'Barcelona')
      or (m.home_team = 'Atletico Madrid' and m.away_team = 'Sevilla')
      or (m.home_team = 'Bayern Munich' and m.away_team = 'Borussia Dortmund')
      or (m.home_team = 'Inter Milan' and m.away_team = 'AC Milan')
      or (m.home_team = 'Paris Saint-Germain' and m.away_team = 'Marseille')
      or (m.home_team = 'Ajax' and m.away_team = 'PSV')
      or (m.home_team = 'Benfica' and m.away_team = 'Porto')
  );

-- -----------------------------------------------------------------------------
-- 5. 插入 10 条 AI 预测（每条对应一场比赛）
-- -----------------------------------------------------------------------------
with target_matches as (
    select
        m.id,
        m.home_team,
        m.away_team,
        row_number() over (order by m.match_time asc, m.id asc) as rn
    from public.matches m
    where (m.home_team, m.away_team) in (
        ('Arsenal', 'Chelsea'),
        ('Liverpool', 'Manchester City'),
        ('Manchester United', 'Tottenham'),
        ('Real Madrid', 'Barcelona'),
        ('Atletico Madrid', 'Sevilla'),
        ('Bayern Munich', 'Borussia Dortmund'),
        ('Inter Milan', 'AC Milan'),
        ('Paris Saint-Germain', 'Marseille'),
        ('Ajax', 'PSV'),
        ('Benfica', 'Porto')
    )
),
seed_predictions as (
    select *
    from (
        values
            (
                1::int,
                '1X2'::text,
                'Home Win — Arsenal'::text,
                74::numeric,
                'Arsenal unbeaten in 6 at home; Chelsea missing two starters in defense.'::text,
                false::boolean
            ),
            (
                2,
                'Over/Under',
                'Over 2.5 Goals',
                68,
                'Last 4 H2H meetings averaged 3.4 goals; both sides rank top 5 for xG.',
                false
            ),
            (
                3,
                'BTTS',
                'Both Teams To Score — Yes',
                71,
                'United and Spurs concede regularly on the road; attack-minded setups expected.',
                false
            ),
            (
                4,
                '1X2',
                'Draw or Real Madrid',
                62,
                'El Clásico often tight; Madrid stronger depth but Barça strong at home.',
                false
            ),
            (
                5,
                'VIP Pick',
                'Under 2.5 Goals',
                81,
                'VIP: Atletico low-block away; Sevilla struggle to create vs top-6 sides.',
                true
            ),
            (
                6,
                '1X2',
                'Bayern Munich Win',
                77,
                'Bayern 8 wins in last 10; Dortmund poor record at Allianz Arena.',
                false
            ),
            (
                7,
                'VIP Pick',
                'Inter Milan Win',
                84,
                'VIP: Inter superior xG in derby data; Milan missing key midfielder.',
                true
            ),
            (
                8,
                'Over/Under',
                'Over 3.5 Goals',
                66,
                'Classique historically high-scoring; both attacks in strong form.',
                false
            ),
            (
                9,
                'BTTS',
                'Both Teams To Score — Yes',
                69,
                'Ajax–PSV derbies: BTTS landed in 7 of last 9 meetings.',
                false
            ),
            (
                10,
                'VIP Pick',
                'Benfica Win & Over 1.5',
                79,
                'VIP: Benfica dominant at home in O Clássico; Porto concede early often.',
                true
            )
    ) as v(
        rn,
        prediction_type,
        prediction_text,
        confidence,
        analysis,
        is_vip
    )
)
insert into public.predictions (
    match_id,
    prediction_type,
    prediction_text,
    confidence,
    analysis,
    is_vip
)
select
    tm.id,
    sp.prediction_type,
    sp.prediction_text,
    sp.confidence,
    sp.analysis,
    sp.is_vip
from seed_predictions sp
inner join target_matches tm on tm.rn = sp.rn;

-- -----------------------------------------------------------------------------
-- 6. 验证结果
-- -----------------------------------------------------------------------------
select
    m.league,
    m.home_team || ' vs ' || m.away_team as fixture,
    p.prediction_type,
    p.prediction_text,
    p.confidence,
    p.is_vip,
    left(p.analysis, 60) || '…' as analysis_preview
from public.predictions p
inner join public.matches m on m.id = p.match_id
order by p.created_at desc
limit 10;
