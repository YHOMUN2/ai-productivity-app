/**
 * Vercel Serverless Function - Supabase 代理
 * 作用：处理需要 service_role key 的 Supabase 操作（后台管理、权限校验等）
 * 
 * 使用方式：
 * - 直接来自前端的用户操作 → 直连 Supabase（使用 anon key）
 * - 需要服务端密钥的操作 → 调用这个 API
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 错误：未找到 Supabase 环境变量');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 处理 POST /api/supabase 请求
 * 
 * 请求体格式：
 * {
 *   "action": "select|insert|update|delete|rpc",
 *   "table": "table_name",
 *   "data": {...},
 *   "filters": {...}
 * }
 */
export default async function handler(req, res) {
  // 仅允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 启用 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, table, data, filters } = req.body;

    if (!action || !table) {
      return res.status(400).json({ error: 'Missing action or table' });
    }

    let result;

    switch (action) {
      case 'select':
        result = await supabase
          .from(table)
          .select('*')
          .match(filters || {});
        break;

      case 'insert':
        result = await supabase
          .from(table)
          .insert([data]);
        break;

      case 'update':
        result = await supabase
          .from(table)
          .update(data)
          .match(filters || {});
        break;

      case 'delete':
        result = await supabase
          .from(table)
          .delete()
          .match(filters || {});
        break;

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }

    return res.status(200).json({ data: result.data });

  } catch (err) {
    console.error('Supabase API Error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
