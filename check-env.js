#!/usr/bin/env node

/**
 * 环境变量检查脚本
 * 
 * 用途：验证本地 .env.local 配置是否正确
 * 使用：node check-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');

console.log('🔍 环境变量检查\n');

// 检查 .env.local 是否存在
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local 文件不存在');
  process.exit(1);
}

// 读取环境变量
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, value] = trimmed.split('=');
    if (key && value) {
      envVars[key] = value;
    }
  }
});

// 检查必要的环境变量
const requiredVars = {
  'VITE_SUPABASE_URL': '✅ Supabase URL（前端用）',
  'VITE_SUPABASE_PUBLISHABLE_KEY': '✅ Supabase 公开密钥（前端用）',
  'SUPABASE_SERVICE_ROLE_KEY': '🔒 Supabase 服务密钥（服务器用）',
  'VOLC_API_KEY': '🤖 大模型 API 密钥'
};

console.log('必要的环境变量检查：\n');

let allGood = true;
let frontendVarsOk = true;
let backendVarsOk = true;

Object.entries(requiredVars).forEach(([varName, desc]) => {
  const value = envVars[varName];
  
  if (!value) {
    console.log(`❌ 缺失: ${varName}`);
    console.log(`   ${desc}`);
    allGood = false;
    
    if (varName.startsWith('VITE_')) {
      frontendVarsOk = false;
    } else {
      backendVarsOk = false;
    }
  } else {
    const masked = value.substring(0, 10) + '...' + value.substring(value.length - 5);
    console.log(`✅ ${varName}`);
    console.log(`   ${desc}`);
    console.log(`   值: ${masked}`);
    console.log();
  }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('✅ 所有环境变量都已配置！');
  console.log('\n可以使用以下命令开始开发：');
  console.log('  npm run dev');
} else {
  console.log('\n⚠️  请参照 .env.example 补齐缺失的环境变量');
  console.log('\n解决步骤：');
  console.log('1. 打开 .env.local 文件');
  console.log('2. 参照 .env.example 添加缺失的变量');
  console.log('3. 重新运行此检查脚本');
  process.exit(1);
}

// 额外检查：警告关于 Vercel 部署
console.log('\n' + '='.repeat(50));
console.log('🚀 Vercel 部署提示：');
console.log('\n在 Vercel 控制面板中需要设置以下环境变量：');
console.log('  ✅ VITE_SUPABASE_URL');
console.log('  ✅ VITE_SUPABASE_PUBLISHABLE_KEY');
console.log('  🔒 SUPABASE_SERVICE_ROLE_KEY (仅 Production)');
console.log('  🤖 VOLC_API_KEY (仅 Production)');
console.log('\n详见: md-file/VERCEL_ENV_SETUP.md');
