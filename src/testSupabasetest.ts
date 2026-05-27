// src/testSupabasetest.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config(); // 🔹 必须，加载 .env 文件

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// 检查是否成功读取
if (!supabaseUrl || !supabaseKey) {
    throw new Error('supabaseUrl or supabaseKey missing! 请检查 .env 文件');
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('==== 1️⃣ 查询 profiles 表 ====');
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
    if (profileError) console.log('查询 profiles 失败:', profileError);
    else console.log('profiles 数据:', profiles);

    console.log('\n==== 2️⃣ 插入测试比赛数据到 matches 表 ====');
    const matchData = [
        { home_team: 'Arsenal', away_team: 'Chelsea', league: 'Premier League', match_time: new Date().toISOString() },
        { home_team: 'Real Madrid', away_team: 'Barcelona', league: 'La Liga', match_time: new Date().toISOString() },
    ];
    const { data: insertData, error: insertError } = await supabase.from('matches').insert(matchData);
    if (insertError) console.log('插入 matches 失败:', insertError);
    else console.log('插入 matches 成功:', insertData);

    console.log('\n==== 3️⃣ 查询 matches 表最新数据 ====');
    const { data: matches, error: matchesError } = await supabase.from('matches').select('*').order('match_time', { ascending: true });
    if (matchesError) console.log('查询 matches 失败:', matchesError);
    else console.log('matches 数据:', matches);
}

main().catch(console.error);