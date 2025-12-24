/**
 * Supabase 连接诊断脚本
 * 在浏览器控制台中运行此代码来检查所有连接问题
 */

console.log('=== Supabase 连接诊断开始 ===\n');

// 1. 检查环境变量
console.log('📋 步骤 1: 检查环境变量');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
console.log('');

// 2. 检查 Supabase 客户端
console.log('📋 步骤 2: 检查 Supabase 客户端');
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);
console.log('✅ Supabase 客户端已创建:', supabase);
console.log('');

// 3. 检查当前认证状态
console.log('📋 步骤 3: 检查当前认证状态');
const session = await supabase.auth.getSession();
console.log('当前 session:', session);
console.log('');

// 4. 检查 profiles 表连接
console.log('📋 步骤 4: 检查 profiles 表连接');
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);
console.log('profiles 表查询结果:');
console.log('- 数据:', data);
console.log('- 错误:', error);
console.log('');

// 5. 尝试注册测试
console.log('📋 步骤 5: 尝试注册测试（不验证邮箱情况）');
const testEmail = `test-${Date.now()}@example.com`;
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: testEmail,
  password: 'Test123456!',
  options: {
    data: {
      full_name: 'Test User'
    }
  }
});
console.log('注册结果:');
console.log('- 用户:', signUpData?.user);
console.log('- 错误:', signUpError);
if (signUpData?.user) {
  console.log('- 用户 ID:', signUpData.user.id);
  console.log('- 用户邮箱:', signUpData.user.email);
}
console.log('');

// 6. 检查 profiles 表是否自动创建
if (signUpData?.user) {
  console.log('📋 步骤 6: 检查 profiles 表是否自动创建');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signUpData.user.id)
    .single();
  console.log('Profile 查询结果:');
  console.log('- Profile 数据:', profileData);
  console.log('- 错误:', profileError);
  if (profileError?.code === 'PGRST116') {
    console.warn('⚠️ 警告: Profile 未找到（触发器可能未执行）');
  }
}

console.log('=== 诊断完成 ===');
