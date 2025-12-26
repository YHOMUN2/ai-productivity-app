/**
 * 前端 Supabase 操作模块
 * 
 * 设计原则：
 * ✅ 直接用户操作（符合 RLS）→ 前端直连 Supabase（使用 anon key）
 * ✅ 后台操作（需要 service key）→ 调用 /api/supabase
 * 
 * 路由表：
 * 用户认证 → 直连 Supabase（使用 @supabase/supabase-js Auth）
 * 用户数据 → 直连 Supabase（RLS 保护）
 * 管理操作 → /api/supabase（服务端密钥）
 */

import { supabase } from '@/lib/supabaseClient';
import axios from 'axios';

// 自动根据环境选择 API 端点
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3001'
  : '';

/**
 * ===== 直连 Supabase 的操作（前端，anon key）=====
 */

/**
 * 获取当前用户
 */
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * 获取当前用户会话
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * 用户注册
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) throw error;
  return data;
}

/**
 * 用户登录
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

/**
 * 用户登出
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * 获取用户个人资料
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * 更新用户个人资料
 */
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * 上传头像到 Supabase Storage
 */
export async function uploadAvatar(userId, file) {
  const fileName = `${userId}_${Date.now()}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`public/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // 获取公开 URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(`public/${fileName}`);

  return publicUrl;
}

/**
 * ===== 调用服务端 API 的操作（需要 service key）=====
 */

/**
 * 通用 Supabase 操作（调用服务端 API）
 * 
 * 示例：
 * await supabaseApi('select', 'tasks', {}, {})
 * await supabaseApi('insert', 'tasks', { title: 'New task', user_id: 'xxx' })
 */
export async function supabaseApi(action, table, data = {}, filters = {}) {
  const response = await axios.post(`${API_BASE}/api/supabase`, {
    action,
    table,
    data,
    filters
  });
  return response.data.data;
}

/**
 * 获取所有任务（仅管理员）
 */
export async function getAllTasks() {
  return supabaseApi('select', 'tasks', {}, {});
}

/**
 * 删除用户及其所有数据（仅管理员）
 */
export async function deleteUserAndData(userId) {
  // 删除用户的任务
  await supabaseApi('delete', 'tasks', {}, { user_id: userId });
  
  // 删除用户的个人资料（如果没有级联删除的话）
  await supabaseApi('delete', 'profiles', {}, { id: userId });
  
  // 调用 Supabase Auth API 删除用户（需要管理员密钥，这里仅作示例）
  return true;
}

/**
 * 批量更新任务状态（仅管理员）
 */
export async function batchUpdateTaskStatus(taskIds, status) {
  const updates = [];
  for (const taskId of taskIds) {
    updates.push(
      supabaseApi('update', 'tasks', { status }, { id: taskId })
    );
  }
  return Promise.all(updates);
}

export default {
  // 认证
  getUser,
  getSession,
  signUp,
  signIn,
  signOut,
  
  // 个人资料
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  
  // 高级操作
  supabaseApi,
  getAllTasks,
  deleteUserAndData,
  batchUpdateTaskStatus
};
