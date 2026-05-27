import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// 1. 使用 .env 文件里的 Supabase URL 和 Key
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("==== 1️⃣ 查询 profiles 表 ====");
    let { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

    if (profilesError) {
        console.log("查询 profiles 失败:", profilesError);
    } else {
        console.log("profiles 数据:", profiles);
    }

    // 如果 profiles 为空，插入测试用户
    if (!profiles || profiles.length === 0) {
        console.log("profiles 为空，插入测试用户...");
        const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([
                {
                    id: "test-admin-001",
                    email: "test-admin@example.com",
                    username: "testadmin",
                    role: "admin",
                    vip_status: true,
                },
            ])
            .select();

        if (insertError) console.log("插入测试用户失败:", insertError);
        else console.log("插入成功:", newProfile);
    }

    console.log("\n==== 2️⃣ 插入测试比赛数据到 matches 表 ====");
    const { data: newMatches, error: matchesError } = await supabase
        .from("matches")
        .insert([
            {
                home_team: "Arsenal",
                away_team: "Chelsea",
                league: "Premier League",
                match_time: new Date().toISOString(),
            },
            {
                home_team: "Real Madrid",
                away_team: "Barcelona",
                league: "La Liga",
                match_time: new Date().toISOString(),
            },
        ])
        .select();

    if (matchesError) console.log("插入 matches 失败:", matchesError);
    else console.log("插入成功:", newMatches);

    console.log("\n==== 3️⃣ 查询 matches 表最新数据 ====");
    const { data: matchesData, error: matchesQueryError } = await supabase
        .from("matches")
        .select("*")
        .order("match_time", { ascending: true });

    if (matchesQueryError) console.log("查询 matches 失败:", matchesQueryError);
    else console.log("matches 数据:", matchesData);
}

main().catch((err) => console.error("脚本执行异常:", err));