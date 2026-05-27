import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://yxwtgumhdyybcnfpxvam.supabase.co";
const supabaseAnonKey = "sb_publishable_UDFhiDKi-094qXr1XXBnSg_RsvQRZgP";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.log('连接失败:', error);
    } else {
        console.log('查询成功，profiles 数据如下:');
        console.table(data);
    }
}

testConnection();