/**
 * 融合 AI 聊天和 Supabase 存储的综合模块
 * 
 * 功能：
 * 1. 调用大模型 API 获取 AI 回复
 * 2. 保存聊天记录到 Supabase
 * 3. 支持本地 mock 模式（开发调试）
 */

import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

// 自动根据环境选择 API 端点
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3001'
  : '';

/**
 * 与 AI 聊天
 * 
 * @param {Array} messages - 消息数组，格式 [{ role: 'user'|'assistant', content: string }]
 * @param {Object} options - 选项
 * @returns {Promise} AI 响应
 */
export async function chatWithAI(messages, options = {}) {
  const msgs = Array.isArray(messages) ? messages.slice() : [];

  try {
    const response = await axios.post(`${API_BASE}/api/chat`, {
      model: options.model || 'doubao-seed-1-6-251015',
      messages: msgs
    });
    return response.data;
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}

/**
 * 保存聊天记录到 Supabase
 * 
 * @param {Object} conversation - 对话对象
 * @param {string} userId - 用户 ID
 * @returns {Promise} 保存结果
 */
export async function saveChatHistory(conversation, userId) {
  try {
    // 检查对话是否已存在
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversation.id)
      .single();

    if (existing) {
      // 更新现有对话
      const { error } = await supabase
        .from('conversations')
        .update({
          title: conversation.title,
          messages: JSON.stringify(conversation.messages),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      if (error) throw error;
      return { success: true, action: 'update' };
    } else {
      // 创建新对话
      const { error } = await supabase
        .from('conversations')
        .insert({
          id: conversation.id,
          user_id: userId,
          title: conversation.title,
          messages: JSON.stringify(conversation.messages),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true, action: 'create' };
    }
  } catch (error) {
    console.error('Save chat history error:', error);
    throw error;
  }
}

/**
 * 从 Supabase 获取对话历史
 * 
 * @param {string} userId - 用户 ID
 * @param {number} limit - 获取数量限制（默认 20）
 * @returns {Promise} 对话列表
 */
export async function getChatHistories(userId, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get chat histories error:', error);
    return [];
  }
}

/**
 * 获取单个对话的完整消息
 * 
 * @param {string} conversationId - 对话 ID
 * @returns {Promise} 对话详情
 */
export async function getChatDetail(conversationId) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) throw error;

    // 解析存储的 JSON 消息
    if (data && data.messages) {
      try {
        data.messages = JSON.parse(data.messages);
      } catch (e) {
        console.warn('Failed to parse messages JSON:', e);
      }
    }

    return data;
  } catch (error) {
    console.error('Get chat detail error:', error);
    throw error;
  }
}

/**
 * 删除对话
 * 
 * @param {string} conversationId - 对话 ID
 * @returns {Promise} 删除结果
 */
export async function deleteConversation(conversationId) {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete conversation error:', error);
    throw error;
  }
}

/**
 * 清除用户的所有对话（谨慎使用）
 * 
 * @param {string} userId - 用户 ID
 * @returns {Promise} 清除结果
 */
export async function clearAllConversations(userId) {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Clear all conversations error:', error);
    throw error;
  }
}

/**
 * 搜索对话（按标题或消息内容）
 * 
 * @param {string} userId - 用户 ID
 * @param {string} query - 搜索关键词
 * @returns {Promise} 搜索结果
 */
export async function searchConversations(userId, query) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .ilike('title', `%${query}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Search conversations error:', error);
    return [];
  }
}

export default {
  chatWithAI,
  saveChatHistory,
  getChatHistories,
  getChatDetail,
  deleteConversation,
  clearAllConversations,
  searchConversations
};
