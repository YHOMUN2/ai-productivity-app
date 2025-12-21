

<template>
  <div class="app-container">

    <!-- 🟦 顶部导航 -->
    <nav class="navbar">
      <div class="nav-left">
        <div class="logo">⚡</div>
        <div class="title">AI 效率工作台</div>
      </div>

      <div class="nav-center">
        <button @click="goto('/')" class="nav-link">首页</button>
        <button @click="goto('/ai')" class="nav-link">AI 助手</button>
        <button @click="goto('/note')" class="nav-link">笔记</button>
        <button @click="goto('/tools')" class="nav-link">工具</button>
        <button @click="goto('/pdf')" class="nav-link">PDF</button>
      </div>

      <div class="nav-right">
        <button class="icon-btn" @click="theme.toggle()">
          {{ theme.theme === 'light' ? '🌙' : '☀️' }}
        </button>

        <a class="icon-btn" title="GitHub" href="http://localhost:4000/" target="_blank" rel="noopener noreferrer">
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
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

/* 去掉导航中链接的下划线，保持图标样式 */
.icon-btn {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
</style>

