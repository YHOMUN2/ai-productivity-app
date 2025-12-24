<template>
  <el-container class="app-layout">
    <!-- 顶部导航栏 -->
    <el-header class="layout-header">
      <div class="header-content">
        <!-- 左侧：Logo 与应用名称 -->
        <div class="header-left">
          <div class="logo">⚡</div>
          <h1 class="app-title">AI 效率工作台</h1>
        </div>

        <!-- 中间：导航菜单 -->
        <nav class="header-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="['nav-item', { active: isActive(item.path) }]"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <!-- 右侧：工具栏（主题切换、用户菜单等） -->
        <div class="header-right">
          <!-- 主题切换器 -->
          <ThemeSwitcher />

          <a
            class="icon-btn"
            href="http://localhost:4000/"
            target="_blank"
            rel="noopener noreferrer"
            title="访问服务器"
            aria-label="访问服务器"
          >
            🔗
          </a>

          <!-- 用户菜单（未来扩展） -->
          <div class="user-section">
            <UserMenu v-if="isAuthenticated" />
            <el-button
              v-else
              type="primary"
              size="small"
              @click="goToLogin"
              class="login-btn"
            >
              登录
            </el-button>
          </div>
        </div>
      </div>
    </el-header>

    <!-- 主容器：侧边栏（可选）+ 主内容区 -->
    <el-container class="layout-body">
      <!-- 侧边栏（可选，当前隐藏） -->
      <el-aside
        v-if="showSidebar"
        class="layout-sidebar"
        width="240px"
      >
        <slot name="sidebar">
          <div class="sidebar-placeholder">侧边栏区域</div>
        </slot>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>

    <!-- 底部页脚（可选） -->
    <el-footer
      v-if="showFooter"
      class="layout-footer"
      height="auto"
    >
      <div class="footer-content">
        <p>&copy; 2024 AI 效率工作台. 所有权利保留。</p>
      </div>
    </el-footer>
  </el-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import UserMenu from '@/components/UserMenu.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const userStore = useUserStore()

// Props
defineProps({
  showSidebar: { type: Boolean, default: false },
  showFooter: { type: Boolean, default: false }
})

// 导航菜单配置
const navItems = ref([
  { path: '/', label: '首页' },
  { path: '/ai-assistant', label: 'AI 助手' },
  { path: '/notes', label: '笔记' },
  { path: '/tools', label: '工具' },
  { path: '/pdf', label: 'PDF' }
])

// 计算认证状态
const isAuthenticated = computed(() => userStore.isAuthenticated)

// 检查当前路由是否匹配
function isActive(path) {
  return route.path === path
}

// 跳转到登录页
function goToLogin() {
  router.push('/login').catch(err => {
    console.error('导航到登录页失败:', err)
  })
}

// 监听主题变化，同步到 HTML 属性
watch(
  () => themeStore.theme,
  (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
  },
  { immediate: true }
)
</script>

<style scoped>
/* 全局容器 */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-primary);
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* 顶部导航栏 */
.layout-header {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.2s ease;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 var(--spacing-lg);
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

/* 左侧：Logo 和标题 */
.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 200px;
}

.logo {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  letter-spacing: 0.5px;
}

/* 中间：导航菜单 */
.header-nav {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  justify-content: center;
}

.nav-item {
  padding: 8px var(--spacing-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  height: 36px;
  position: relative;
}

.nav-item:hover {
  color: var(--text-primary);
  background: var(--hover-bg);
}

.nav-item.active {
  color: var(--accent);
  font-weight: 600;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--spacing-md);
  right: var(--spacing-md);
  height: 3px;
  background: var(--accent);
  border-radius: 1.5px 1.5px 0 0;
  animation: slideInUp 0.2s ease;
}

@keyframes slideInUp {
  from {
    transform: translateY(2px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 右侧：工具栏 */
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 100px;
  justify-content: flex-end;
}

.icon-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.15s ease;
  text-decoration: none;
}

.icon-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
  border-color: var(--border-light);
}

.icon-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.icon-btn:active {
  background: var(--active-bg);
}

/* 用户菜单区域 */
.user-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-left: var(--spacing-md);
}

.login-btn {
  border-radius: var(--radius-md);
  font-weight: 500;
  height: 32px;
}

/* 主容器 */
.layout-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 侧边栏 */
.layout-sidebar {
  background: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  padding: var(--spacing-md);
}

.sidebar-placeholder {
  color: var(--text-tertiary);
  font-size: 12px;
  text-align: center;
  padding: var(--spacing-lg);
}

/* 主内容区 */
.layout-main {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  background: var(--bg-base);
}

/* 页脚 */
.layout-footer {
  background: var(--bg-surface);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--text-tertiary);
  font-size: 12px;
  text-align: center;
}

.footer-content p {
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-content {
    padding: 0 var(--spacing-md);
  }

  .app-title {
    font-size: 16px;
  }

  .header-nav {
    gap: 4px;
  }

  .nav-item {
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .header-left {
    min-width: auto;
    gap: var(--spacing-sm);
  }

  .logo {
    font-size: 24px;
  }

  .app-title {
    font-size: 14px;
  }

  .header-nav {
    gap: 0;
    overflow-x: auto;
  }

  .nav-item {
    font-size: 12px;
    padding: 8px 10px;
    white-space: nowrap;
  }

  .header-right {
    min-width: auto;
    gap: 6px;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .layout-main {
    padding: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .header-left {
    min-width: 0;
  }

  .app-title {
    display: none;
  }

  .header-content {
    padding: 0 var(--spacing-md);
  }
}

/* 无障碍：焦点可见性 */
.nav-item:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* 平滑滚动 */
.layout-main {
  scroll-behavior: smooth;
}

.layout-sidebar {
  scroll-behavior: smooth;
}
</style>
