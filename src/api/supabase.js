/**
 * Supabase 客户端封装
 * 提供认证、用户管理和数据库操作的统一接口
 */

import { createClient } from '@supabase/supabase-js';

// Supabase 项目配置（从环境变量读取）
// 根据官方文档：https://supabase.com/docs/guides/getting-started/quickstarts/vue
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// 验证必要的环境变量
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ 错误：未找到 Supabase 环境变量 (VITE_SUPABASE_URL 或 VITE_SUPABASE_PUBLISHABLE_KEY)');
  throw new Error('Supabase 配置缺失');
}

// 创建 Supabase 客户端实例
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase 客户端已初始化');

/**
 * 用户注册
 * 
 * 流程：
 * 1. 调用 Supabase Auth.signUp() 创建用户
 * 2. 数据库触发器自动在 profiles 表中创建记录
 * 3. 返回结果和错误信息
 * 
 * @param {Object} credentials - { email, password, name }
 * @returns {Promise<{user, session, error}>}
 */
export const signUp = async (credentials) => {
  const { email, password, name } = credentials;

  try {
    console.log('📝 尝试注册:', email);
    
    // 步骤 1：调用 Supabase Auth 注册接口
    // 注意：name 通过 data.full_name 传递，触发器会读取并写入 profiles.name
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          // 将用户名存储在 user metadata 中
          // 触发器会读取这个字段并写入 profiles 表
          full_name: name || email.split('@')[0]
        }
      }
    });

    if (error) {
      console.error('❌ 注册失败:', error.message);
      
      // 提供用户友好的错误提示
      let userMessage = error.message;
      if (error.message.includes('already registered')) {
        userMessage = '该邮箱已被注册，请直接登录或使用其他邮箱';
      } else if (error.message.includes('password')) {
        userMessage = '密码不符合要求，请使用至少 6 个字符的密码';
      } else if (error.status === 400) {
        userMessage = '注册请求错误，请检查邮箱格式和密码';
      }
      
      return { 
        user: null, 
        session: null, 
        error: { ...error, message: userMessage } 
      };
    }

    console.log('✅ 注册成功');
    // 注册成功，触发器会自动创建 profiles 记录
    return { 
      user: data?.user || null, 
      session: data?.session || null, 
      error: null 
    };
  } catch (err) {
    console.error('❌ 注册异常:', err.message || err);
    return { 
      user: null, 
      session: null, 
      error: err 
    };
  }
};

/**
 * 用户登录
 * 
 * 流程：
 * 1. 调用 Supabase Auth.signInWithPassword() 登录
 * 2. 使用返回的 user.id 查询 profiles 表
 * 3. 验证 profiles 记录存在（确保数据完整性）
 * 4. 返回用户信息和 session
 * 
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{user, profile, session, error}>}
 */
export const signIn = async (credentials) => {
  const { email, password } = credentials;

  try {
    console.log('🔐 尝试登录:', email);
    
    // 步骤 1：调用 Supabase Auth 登录接口
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ 登录失败:', error.message);
      
      // 提供用户友好的错误提示
      let userMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        userMessage = '邮箱或密码错误，请检查后重试';
      } else if (error.message.includes('Email not confirmed')) {
        userMessage = '邮箱未验证，请检查邮件并验证账户';
      } else if (error.status === 400) {
        userMessage = '登录请求错误，请检查邮箱格式和密码';
      }
      
      return { 
        user: null, 
        profile: null,
        session: null, 
        error: { ...error, message: userMessage } 
      };
    }

    const authUser = data?.user;
    
    if (!authUser) {
      console.error('❌ 登录失败: 未获取到用户信息');
      return { 
        user: null, 
        profile: null,
        session: null, 
        error: { message: '登录失败，请稍后重试' } 
      };
    }

    console.log('✅ Auth 登录成功，user.id:', authUser.id);

    // 步骤 2：查询 profiles 表以获取用户的完整信息
    // 这一步非常关键，可以验证用户数据的完整性
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single(); // 期望返回单条记录

    if (profileError) {
      console.error('❌ 查询 profiles 失败:', profileError.message);
      
      // PGRST116 表示未找到记录
      if (profileError.code === 'PGRST116') {
        return { 
          user: authUser, 
          profile: null,
          session: data?.session || null, 
          error: { 
            message: '用户数据不完整，无法登录。请联系技术支持。' 
          } 
        };
      }

      return { 
        user: authUser, 
        profile: null,
        session: data?.session || null, 
        error: { message: profileError.message } 
      };
    }

    console.log('✅ 登录成功，profiles 信息:', profileData);

    // 步骤 3：返回完整的用户信息
    return { 
      user: authUser, 
      profile: profileData,
      session: data?.session || null, 
      error: null 
    };
  } catch (err) {
    console.error('❌ 登录异常:', err.message || err);
    return { 
      user: null, 
      profile: null,
      session: null, 
      error: err 
    };
  }
};

/**
 * 用户登出
 * @returns {Promise<{error}>}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: err };
  }
};

/**
 * 获取当前用户信息
 * @returns {Promise<{user, error}>}
 */
export const getUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (err) {
    return { user: null, error: err };
  }
};

/**
 * 获取当前会话
 * @returns {Promise<{session, error}>}
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  } catch (err) {
    return { session: null, error: err };
  }
};

/**
 * 监听认证状态变化
 * @param {Function} callback - 回调函数，接收 (event, session) 参数
 * @returns {Function} 取消监听函数
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );
  
  // 返回取消监听函数
  return () => {
    subscription?.unsubscribe();
  };
};

/**
 * 密码重置请求
 * @param {string} email - 用户邮箱
 * @returns {Promise<{error}>}
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { error };
  } catch (err) {
    return { error: err };
  }
};

/**
 * 更新用户密码
 * @param {string} newPassword - 新密码
 * @returns {Promise<{user, error}>}
 */
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { user: data.user, error };
  } catch (err) {
    return { user: null, error: err };
  }
};

/**
 * 更新用户信息
 * @param {Object} attributes - 要更新的属性（如 email, metadata 等）
 * @returns {Promise<{user, error}>}
 */
export const updateUser = async (attributes) => {
  try {
    const { data, error } = await supabase.auth.updateUser(attributes);
    return { user: data.user, error };
  } catch (err) {
    return { user: null, error: err };
  }
};

/* ============== 数据库操作 ============== */

/**
 * 通用数据库查询
 * @param {string} tableName - 表名
 * @returns {Object} Supabase query builder
 */
export const db = {
  /**
   * 查询数据
   * @param {string} tableName - 表名
   * @returns {Object} Supabase query builder
   */
  from: (tableName) => supabase.from(tableName),
  
  /**
   * 执行存储函数
   * @param {string} functionName - 函数名
   * @param {Object} params - 函数参数
   * @returns {Promise}
   */
  rpc: (functionName, params = {}) => supabase.rpc(functionName, params)
};

/**
 * 插入单条数据
 * @param {string} tableName - 表名
 * @param {Object} data - 要插入的数据
 * @returns {Promise<{data, error}>}
 */
export const insertData = async (tableName, data) => {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert([data])
      .select();
    return { data: result?.[0], error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * 更新数据
 * @param {string} tableName - 表名
 * @param {Object} data - 要更新的数据
 * @param {string} condition - 更新条件字段名 (如: 'id')
 * @param {*} value - 条件值
 * @returns {Promise<{data, error}>}
 */
export const updateData = async (tableName, data, condition, value) => {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq(condition, value)
      .select();
    return { data: result?.[0], error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * 删除数据
 * @param {string} tableName - 表名
 * @param {string} condition - 删除条件字段名 (如: 'id')
 * @param {*} value - 条件值
 * @returns {Promise<{error}>}
 */
export const deleteData = async (tableName, condition, value) => {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq(condition, value);
    return { error };
  } catch (err) {
    return { error: err };
  }
};

/**
 * 查询数据
 * @param {string} tableName - 表名
 * @param {Object} options - 查询选项
 * @returns {Promise<{data, error}>}
 */
export const queryData = async (tableName, options = {}) => {
  try {
    let query = supabase.from(tableName).select('*');

    // 处理条件过滤
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
    }

    // 处理排序
    if (options.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending !== false
      });
    }

    // 处理分页
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * 获取单条数据
 * @param {string} tableName - 表名
 * @param {string} condition - 条件字段名 (如: 'id')
 * @param {*} value - 条件值
 * @returns {Promise<{data, error}>}
 */
export const fetchOne = async (tableName, condition, value) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq(condition, value)
      .single();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * 导出原始 Supabase 客户端（高级用法）
 */
export default supabase;
