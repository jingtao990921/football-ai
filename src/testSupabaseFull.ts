// src/testSupabaseFull.ts
import { createClient } from '@supabase/supabase-js';

// —— 替换成你自己 Supabase 的 URL 和 ANON key —— 
const supabaseUrl = "https://yxwtgumhdyybcnfpxvam.supabase.co";
const supabaseAnonKey = "sb_publishable_UDFhiDKi-094qXr1XXBnSg_RsvQRZgP";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
    try {
        console.log("==== 1️⃣ 查询 profiles 表 ====");
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
        if (profilesError) console.log('查询 profiles 失败:', profilesError);
        else console.table(profilesData);

        console.log("\n==== 2️⃣ 插入测试比赛数据到 matches 表 ====");
        const { data: insertData, error: insertError } = await supabase
            .from('matches')
            .insert([
                {
                    home_team: 'Test Home',
                    away_team: 'Test Away',
                    league: 'Test League',
                    match_time: new Date().toISOString(),
                    created_at: new Date().toISOString()
                }
            ])
            .select(); // 选中返回插入的数据
        if (insertError) console.log('插入 matches 失败:', insertError);
        else console.log('插入成功:', insertData);

        console.log("\n==== 3️⃣ 查询 matches 表最新数据 ====");
        const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
        if (matchesError) console.log('查询 matches 失败:', matchesError);
        else console.table(matchesData);

    } catch (err) {
        console.log('执行出错:', err);
    }
}

runTest();