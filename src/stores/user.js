/**
 * 用户状态管理 Store
 * 管理用户认证和登录状态
 * 
 * 核心原则：
 * - 头像只有一个权威来源：profile.avatar_url
 * - 所有页面都从这个 getter 读取头像
 * - 更新头像时，所有引用自动同步
 */

import { defineStore } from 'pinia';
import { signUp, signIn, signOut } from '@/api/supabase';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    profile: null,  // 包含 avatar_url（唯一的头像数据源）
    isLoggedIn: false,
    loading: false,
    error: null
  }),

  getters: {
    /**
     * 用户名 getter
     */
    userName: (state) => {
      if (!state.user) return '';
      return state.user.user_metadata?.full_name || state.user.email?.split('@')[0] || '用户';
    },

    /**
     * 用户邮箱 getter
     */
    userEmail: (state) => {
      return state.user?.email || '';
    },

    /**
     * 用户头像 getter - 唯一的头像数据来源
     * ⚠️ 所有页面必须通过这个 getter 获取头像，保证始终同步
     */
    userAvatar: (state) => {
      // 优先从 profile.avatar_url 读取（权威来源）
      if (state.profile?.avatar_url) {
        return state.profile.avatar_url;
      }
      // 降级方案：使用 DiceBear API 生成默认头像
      const email = state.user?.email || '';
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
    },

    /**
     * 用户 ID getter
     */
    userId: (state) => {
      return state.user?.id || '';
    },

    /**
     * 认证状态 getter
     */
    isAuthenticated: (state) => {
      return state.isLoggedIn && !!state.user;
    }
  },

  actions: {
    /**
     * 用户登录
     * 返回 {success, error, user?, profile?}
     * 如果 profiles 表中找不到用户数据，会返回错误
     */
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        // 调用新的 signIn，它会返回 {user, profile, session, error}
        const { user, profile, session, error } = await signIn(credentials);

        if (error) {
          this.error = error.message || '登录失败';
          this.isLoggedIn = false;
          this.user = null;
          this.profile = null;
          return { success: false, error: this.error };
        }

        // 如果没有 profile，说明用户数据不完整
        if (!profile) {
          this.error = '用户数据不完整，无法登录。请重新注册。';
          this.isLoggedIn = false;
          this.user = null;
          this.profile = null;
          return { success: false, error: this.error };
        }

        // 登录成功：保存用户和 profile 信息
        this.user = user;
        this.profile = profile;
        this.isLoggedIn = !!session;

        return { success: true, user: this.user, profile: this.profile };
      } catch (err) {
        this.error = err.message || '登录失败';
        this.isLoggedIn = false;
        this.user = null;
        this.profile = null;
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * 用户注册
     * credentials 应包含: {name, email, password, confirmPassword}
     * 返回 {success, error, user?}
     */
    async register(credentials) {
      this.loading = true;
      this.error = null;

      try {
        // 验证密码一致性
        if (credentials.password !== credentials.confirmPassword) {
          this.error = '两次输入的密码不一致';
          return { success: false, error: this.error };
        }

        // 验证 name 字段
        if (!credentials.name || credentials.name.trim().length < 2) {
          this.error = '用户名长度不少于 2 个字符';
          return { success: false, error: this.error };
        }

        // 调用新的 signUp，传递 name 字段
        const { user, session, error } = await signUp({
          email: credentials.email,
          password: credentials.password,
          name: credentials.name
        });

        if (error) {
          this.error = error.message || '注册失败';
          this.isLoggedIn = false;
          this.user = null;
          this.profile = null;
          return { success: false, error: this.error };
        }

        // 注册成功后，由于 Supabase trigger 会自动创建 profile，
        // 这里先保存 user 信息，实际 profile 会在用户首次登录时获取
        this.user = user;
        if (session) {
          this.isLoggedIn = true;
        }

        return { success: true, user: this.user };
      } catch (err) {
        this.error = err.message || '注册失败';
        this.isLoggedIn = false;
        this.user = null;
        this.profile = null;
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * 用户退出登录
     */
    async logout() {
      this.loading = true;

      try {
        await signOut();
        this.user = null;
        this.profile = null;
        this.isLoggedIn = false;
        this.error = null;
        return { success: true };
      } catch (err) {
        console.error('退出登录错误:', err);
        this.user = null;
        this.profile = null;
        this.isLoggedIn = false;
        return { success: true };
      } finally {
        this.loading = false;
      }
    },

    /**
     * 设置错误信息
     */
    setError(error) {
      this.error = error;
    },

    /**
     * 清空错误信息
     */
    clearError() {
      this.error = null;
    },

    /**
     * 更新用户个人资料
     * @param {Object} updates - 包含要更新的字段 {userName, userAvatar}
     */
    async updateProfile(updates) {
      this.loading = true;
      this.error = null;

      try {
        if (updates.userName) {
          this.user.user_metadata = {
            ...this.user.user_metadata,
            full_name: updates.userName
          };
        }

        if (updates.userAvatar && this.profile) {
          this.profile.avatar_url = updates.userAvatar;
        }

        // 模拟保存到数据库
        await new Promise(resolve => setTimeout(resolve, 500));

        return { success: true };
      } catch (err) {
        this.error = err.message || '更新失败';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * 更新用户头像
     * 
     * 流程：
     * 1. 只更新内存中的 profile.avatar_url
     * 2. Vue 响应式系统自动通知所有引用的组件
     * 3. 所有页面同时更新（无需刷新、无需 reload）
     * 
     * ⚠️ 注意：实际的数据库更新应在上传时一并完成，
     *          这里只是更新内存状态
     * 
     * @param {string} avatarUrl - 新的头像 URL（可以是数据 URL 或真实 URL）
     */
    updateAvatarInStore(avatarUrl) {
      // 更新 profile（唯一的数据源）
      if (this.profile) {
        this.profile.avatar_url = avatarUrl;
      }
      
      // 如果没有 profile，创建一个（备用方案）
      if (!this.profile) {
        this.profile = { avatar_url: avatarUrl };
      }
    },

    /**
     * 更新用户头像（包括数据库持久化）
     * 
     * @param {string} avatarUrl - 新头像 URL
     * @returns {Promise<{success, error}>}
     */
    async updateAvatar(avatarUrl) {
      this.loading = true;
      this.error = null;

      try {
        // 更新内存状态（立即生效）
        this.updateAvatarInStore(avatarUrl);

        // 模拟保存到数据库（实际项目中应调用真实 API）
        await new Promise(resolve => setTimeout(resolve, 500));

        return { success: true };
      } catch (err) {
        this.error = err.message || '更新头像失败';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    }
  },

  persist: true
});
