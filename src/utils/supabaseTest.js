/**
 * Supabase 连接测试
 * 验证 Supabase 配置是否正确
 */

import { getUser, getSession } from '@/api/supabase';

export const testSupabaseConnection = async () => {
  console.log('🔍 正在测试 Supabase 连接...');
  
  try {
    // 测试 1: 获取当前会话
    const { session, error: sessionError } = await getSession();
    
    if (sessionError) {
      console.warn('⚠️  获取会话失败（这是正常的，因为用户未登录）');
    } else if (session) {
      console.log('✅ 会话获取成功:', session);
    } else {
      console.log('ℹ️  当前无活跃会话（用户未登录）');
    }
    
    // 测试 2: 获取当前用户
    const { user, error: userError } = await getUser();
    
    if (userError) {
      console.warn('⚠️  获取用户信息失败（这是正常的，因为用户未登录）');
    } else if (user) {
      console.log('✅ 用户信息获取成功:', user);
    } else {
      console.log('ℹ️  当前无登录用户');
    }
    
    console.log('✅ Supabase 客户端已成功初始化！');
    return true;
    
  } catch (err) {
    console.error('❌ Supabase 连接测试失败:', err);
    return false;
  }
};
