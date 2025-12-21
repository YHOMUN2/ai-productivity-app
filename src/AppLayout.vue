<template>
  <div class="app-container">

    <!-- 🟦 顶部导航 -->
    <nav class="navbar">
      <div class="nav-left">
        <div class="logo">⚡</div>
        <div class="title">AI 效率工作台</div>
      </div>

      <div class="nav-center">
        <button @click="goto('/')" class="nav-link" :class="{ active: isActive('/') }">首页</button>
        <button @click="goto('/ai')" class="nav-link" :class="{ active: isActive('/ai') }">AI 助手</button>
        <button @click="goto('/note')" class="nav-link" :class="{ active: isActive('/note') }">笔记</button>
        <button @click="goto('/tools')" class="nav-link" :class="{ active: isActive('/tools') }">工具</button>
        <button @click="goto('/pdf')" class="nav-link" :class="{ active: isActive('/pdf') }">PDF</button>
      </div>

      <div class="nav-right">
        <button class="icon-btn" @click="theme.toggle()">
          {{ theme.theme === 'light' ? '🌙' : '☀️' }}
        </button>

        <a class="icon-btn" title="MYBLOG" href="http://localhost:4000/" target="_blank" rel="noopener noreferrer">
          🐙
        </a>
      </div>
    </nav>

    <!-- 页面主体 -->
    <main class="page-body">
      <router-view />
    </main>

  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { useRouter } from 'vue-router';

const theme = useThemeStore();
const router = useRouter();

// 监听主题变化并同步到 <html>
watch(
  () => theme.theme,
  (val) => {
    document.documentElement.setAttribute('data-theme', val);
  },
  { immediate: true }
);

function goto(path) {
  router.push(path);
}

// 检查当前路由是否激活
function isActive(path) {
  return router.currentRoute.value.path === path;
}
</script>

<style scoped>
/* 整体布局 */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 顶部导航条 */
.navbar {
  position: sticky;
  top: 0;
  z-index: 30;

  height: 60px;
  padding: 0 24px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  backdrop-filter: blur(12px);
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  border-bottom: 1px solid var(--border);

  transition: background 0.2s;
}

/* 左侧 LOGO + 标题 */
.nav-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-size: 22px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

/* 中间导航链接 */
.nav-center {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  padding: 6px 8px;
  color: var(--text);
  opacity: 0.8;

  border-radius: 6px;
  transition: 0.2s;
}

.nav-link:hover {
  opacity: 1;
  background: var(--card-bg);
}

/* 激活状态样式 */
.nav-link.active {
  color: var(--nav-active);
  opacity: 1;
  font-weight: 600;
}

/* 右侧图标按钮 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-btn {
  border: none;
  background: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 20px;
  line-height: 1;
  color: var(--text);
  opacity: 0.8;

  transition: 0.2s;
}

.icon-btn:hover {
  opacity: 1;
}

/* 页面主体 */
.page-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
