import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('==== 1️⃣ 查询 profiles 表 ====');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
  if (profilesError) console.log('查询 profiles 失败:', profilesError);
  else console.log('profiles 数据:', profiles);

  console.log('\n==== 2️⃣ 插入测试比赛数据到 matches 表 ====');
  const { data: insertData, error: insertError } = await supabase
    .from('matches')
    .insert([
      { home_team: 'Arsenal', away_team: 'Chelsea', league: 'Premier League', match_time: new Date() },
      { home_team: 'Real Madrid', away_team: 'Barcelona', league: 'La Liga', match_time: new Date() },
      { home_team: 'Bayern Munich', away_team: 'Dortmund', league: 'Bundesliga', match_time: new Date() },
    ]);
  if (insertError) console.log('插入 matches 失败:', insertError);
  else console.log('插入成功:', insertData);

  console.log('\n==== 3️⃣ 查询 matches 表最新数据 ====');
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .order('match_time', { ascending: true });
  if (matchesError) console.log('查询 matches 失败:', matchesError);
  else console.log('matches 数据:', matches);
}

main().catch(console.error);