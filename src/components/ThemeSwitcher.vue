<template>
  <div class="theme-switcher">
    <button
      class="switcher-btn"
      :class="{ dark: isDark }"
      @click="toggleTheme"
      :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
      :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    >
      <!-- 太阳图标（亮色模式） -->
      <span class="icon sun-icon">☀️</span>
      
      <!-- 月亮图标（暗色模式） -->
      <span class="icon moon-icon">🌙</span>

      <!-- 滑块背景 -->
      <span class="slider"></span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

// 计算当前主题是否为暗色
const isDark = computed(() => themeStore.theme === 'dark')

// 切换主题
function toggleTheme() {
  themeStore.toggle()
}
</script>

<style scoped>
.theme-switcher {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 切换器按钮 */
.switcher-btn {
  position: relative;
  width: 52px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 4px;
  padding-right: 4px;
  overflow: hidden;
}

.switcher-btn:hover {
  border-color: var(--accent-light);
  background: var(--hover-bg);
}

.switcher-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.switcher-btn:active {
  transform: scale(0.98);
}

/* 图标 */
.icon {
  position: relative;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  transition: all 0.15s ease;
  z-index: 2;
}

/* 太阳图标 */
.sun-icon {
  opacity: 1;
  color: #f59e0b;
}

.switcher-btn.dark .sun-icon {
  opacity: 0.4;
}

/* 月亮图标 */
.moon-icon {
  opacity: 0.4;
  color: #3b82f6;
}

.switcher-btn.dark .moon-icon {
  opacity: 1;
}

/* 滑块背景 */
.slider {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: var(--accent-light);
  left: 4px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.switcher-btn.dark .slider {
  left: calc(100% - 24px);
  background: var(--accent);
}

/* 响应式 */
@media (max-width: 768px) {
  .switcher-btn {
    width: 48px;
    height: 26px;
  }

  .icon {
    width: 18px;
    height: 18px;
    font-size: 12px;
  }

  .slider {
    width: 18px;
    height: 18px;
    border-radius: 9px;
  }

  .switcher-btn.dark .slider {
    left: calc(100% - 22px);
  }
}

/* 暗色主题下的外观 */
html[data-theme='dark'] .switcher-btn {
  border-color: var(--border-color);
  background: var(--bg-secondary);
}

html[data-theme='dark'] .switcher-btn:hover {
  background: var(--hover-bg);
}

/* 无障碍：焦点样式确保清晰 */
.switcher-btn:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
