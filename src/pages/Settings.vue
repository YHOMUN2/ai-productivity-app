<template>
  <div class="settings-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>设置</h1>
      <p class="header-subtitle">管理您的账号和应用偏好</p>
    </div>

    <!-- 设置卡片 -->
    <div class="settings-content">
      <!-- 1. 主题设置 -->
      <div class="settings-card">
        <div class="card-header">
          <h2 class="card-title">
            <el-icon><Monitor /></el-icon>
            外观
          </h2>
          <p class="card-description">选择应用的显示风格</p>
        </div>

        <div class="card-body">
          <!-- 主题模式选择 -->
          <div class="setting-group">
            <div class="setting-label">
              <span class="label-text">主题模式</span>
              <span class="label-description">选择浅色、深色或跟随系统设置</span>
            </div>

            <div class="setting-control">
              <el-radio-group v-model="currentTheme" @change="handleThemeChange" size="large">
                <el-radio-button label="light" class="theme-option">
                  <el-icon><Sunny /></el-icon>
                  <span>浅色</span>
                </el-radio-button>
                <el-radio-button label="dark" class="theme-option">
                  <el-icon><Moon /></el-icon>
                  <span>深色</span>
                </el-radio-button>
                <el-radio-button label="auto" class="theme-option">
                  <el-icon><Monitor /></el-icon>
                  <span>跟随系统</span>
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <!-- 预览说明 -->
          <div class="preview-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>实时应用主题变化，无需刷新页面</span>
          </div>
        </div>
      </div>

      <!-- 2. 语言设置 -->
      <div class="settings-card">
        <div class="card-header">
          <h2 class="card-title">
            <el-icon><ChatDotSquare /></el-icon>
            语言
          </h2>
          <p class="card-description">选择应用显示语言</p>
        </div>

        <div class="card-body">
          <div class="setting-group">
            <div class="setting-label">
              <span class="label-text">界面语言</span>
              <span class="label-description">当前支持简体中文，其他语言敬请期待</span>
            </div>

            <div class="setting-control">
              <el-select
                v-model="currentLanguage"
                disabled
                class="language-select"
                placeholder="选择语言"
              >
                <el-option label="简体中文" value="zh-CN" />
              </el-select>
              <span class="comingsoon-badge">敬请期待</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 账号信息 -->
      <div class="settings-card">
        <div class="card-header">
          <h2 class="card-title">
            <el-icon><User /></el-icon>
            账号信息
          </h2>
          <p class="card-description">您的账号基本信息</p>
        </div>

        <div class="card-body">
          <!-- 邮箱信息 -->
          <div class="setting-group">
            <div class="setting-label">
              <span class="label-text">邮箱地址</span>
              <span class="label-description">用于登录和接收通知</span>
            </div>

            <div class="setting-control readonly">
              <div class="readonly-field">
                <el-icon><Message /></el-icon>
                <span>{{ userStore.userEmail || '未设置' }}</span>
              </div>
            </div>
          </div>

          <!-- 注册时间 -->
          <div class="setting-group">
            <div class="setting-label">
              <span class="label-text">账号创建时间</span>
              <span class="label-description">您第一次注册账号的时间</span>
            </div>

            <div class="setting-control readonly">
              <div class="readonly-field">
                <el-icon><Clock /></el-icon>
                <span>{{ formatDate(userStore.user?.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- 账号状态 -->
          <div class="setting-group">
            <div class="setting-label">
              <span class="label-text">账号状态</span>
              <span class="label-description">显示您的账号当前状态</span>
            </div>

            <div class="setting-control readonly">
              <div class="status-badge active">
                <el-icon><CircleCheckFilled /></el-icon>
                <span>活跃</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 登出 -->
      <div class="settings-card danger-zone">
        <div class="card-header">
          <h2 class="card-title">
            <el-icon><SwitchButton /></el-icon>
            账号管理
          </h2>
          <p class="card-description">执行账号相关操作</p>
        </div>

        <div class="card-body">
          <div class="setting-group">
            <div class="setting-label">
              <span class="label-text">退出登录</span>
              <span class="label-description">安全退出当前账号</span>
            </div>

            <div class="setting-control">
              <el-button
                type="danger"
                @click="handleLogout"
                :loading="isLoggingOut"
                size="large"
              >
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/stores/theme';
import { useUserStore } from '@/stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Monitor,
  Sunny,
  Moon,
  ChatDotSquare,
  User,
  Message,
  Clock,
  CircleCheckFilled,
  SwitchButton,
  InfoFilled
} from '@element-plus/icons-vue';

const router = useRouter();
const themeStore = useThemeStore();
const userStore = useUserStore();

// 状态
const currentTheme = ref('light');
const currentLanguage = ref('zh-CN');
const isLoggingOut = ref(false);

/**
 * 初始化当前主题
 */
onMounted(() => {
  currentTheme.value = themeStore.theme || 'light';
});

/**
 * 处理主题变化
 */
function handleThemeChange(newTheme) {
  themeStore.setTheme(newTheme);
  ElMessage.success(`已切换至${getThemeName(newTheme)}模式`);
}

/**
 * 获取主题名称
 */
function getThemeName(theme) {
  const names = {
    light: '浅色',
    dark: '深色',
    auto: '自动'
  };
  return names[theme] || '未知';
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
  if (!dateString) return '未知';
  
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (err) {
    return '未知';
  }
}

/**
 * 处理退出登录
 */
async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？此操作将清除您的登录状态。',
      '退出登录',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    isLoggingOut.value = true;

    // 执行退出登录
    const { success, error } = await userStore.logout();

    if (success) {
      ElMessage.success('已安全退出登录');
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push('/login');
      }, 800);
    } else {
      ElMessage.error(error || '退出登录失败');
    }
  } catch (err) {
    // 用户取消确认
  } finally {
    isLoggingOut.value = false;
  }
}
</script>

<style scoped lang="css">
.settings-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: var(--bg-base);
  color: var(--text-primary);
  min-height: 100vh;
  max-width: 900px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-lg);
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
}

.header-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-weight: 400;
}

/* 设置内容 */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* 设置卡片 */
.settings-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;
}

.settings-card:hover {
  border-color: var(--border-dark);
  box-shadow: var(--shadow-sm);
}

.settings-card.danger-zone {
  border-color: var(--error);
  background: linear-gradient(
    to bottom,
    var(--bg-surface),
    color-mix(in srgb, var(--error) 2%, var(--bg-surface))
  );
}

/* 卡片头部 */
.card-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.card-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
}

.card-title .el-icon {
  font-size: 1.2rem;
  color: var(--accent);
}

.card-description {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 400;
}

/* 卡片内容 */
.card-body {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* 设置组 */
.setting-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  align-items: start;
}

@media (max-width: 768px) {
  .setting-group {
    grid-template-columns: 1fr;
  }
}

/* 设置标签 */
.setting-label {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.label-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
}

.label-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 设置控制 */
.setting-control {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.setting-control.readonly {
  pointer-events: none;
}

/* 只读字段 */
.readonly-field {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.95rem;
  flex: 1;
  word-break: break-all;
}

.readonly-field .el-icon {
  flex-shrink: 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* 状态徽章 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
}

.status-badge.active {
  background: color-mix(in srgb, var(--success) 15%, transparent);
  color: var(--success);
}

.status-badge.active .el-icon {
  font-size: 1rem;
}

/* 主题选项 */
.theme-option {
  min-width: 100px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.theme-option .el-icon {
  font-size: 1.1rem;
}

/* 语言选择 */
.language-select {
  flex: 1;
}

.comingsoon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-md);
  margin-left: var(--spacing-md);
  background: color-mix(in srgb, var(--warning) 15%, transparent);
  color: var(--warning);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 提示信息 */
.preview-hint {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: color-mix(in srgb, var(--info) 10%, transparent);
  border-left: 3px solid var(--info);
  border-radius: var(--radius-md);
  color: var(--info);
  font-size: 0.9rem;
}

.preview-hint .el-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .settings-container {
    padding: var(--spacing-md);
    gap: var(--spacing-lg);
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .card-header {
    padding: var(--spacing-md);
  }

  .card-body {
    padding: var(--spacing-md);
  }

  .setting-group {
    gap: var(--spacing-md);
  }

  .settings-card {
    border-radius: var(--radius-md);
  }
}
</style>
