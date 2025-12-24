<template>
  <div
    class="quick-access-card"
    :class="{ 'is-focused': isFocused }"
    tabindex="0"
    :aria-label="`快速入口：${title}，${sub}`"
    @click="navigate"
    @keydown="handleKeydown"
    @focus="isFocused = true"
    @blur="isFocused = false"
  >
    <UICard 
      :title="title"
      :sub="sub"
      size="normal"
      class="quick-card primary-card"
    >
      <slot>
        <p class="default-content">{{ description }}</p>
      </slot>
    </UICard>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import UICard from '@/components/UICard.vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  sub: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  path: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const isFocused = ref(false);

function navigate() {
  router.push(props.path).catch(err => {
    console.error('导航失败:', err);
  });
}

function handleKeydown(event) {
  // 按 Enter 或 Space 键触发导航
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    navigate();
  }
}
</script>

<style scoped>
/* ========== 快速入口卡片容器 ========== */
.quick-access-card {
  outline: none;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-md);
}

/* 焦点状态（键盘导航） */
.quick-access-card:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* 焦点可见性（仅在键盘导航时显示外围焦点框） */
.quick-access-card:focus:not(:focus-visible) {
  outline: none;
}

.quick-access-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* 被聚焦的卡片样式增强 */
.quick-access-card.is-focused {
  /* 样式通过 :focus-visible 伪类处理，避免双重效果 */
}

/* 响应式鼠标悬停（仅在非触摸设备上） */
@media (hover: hover) {
  .quick-access-card:hover {
    transform: translateY(-2px);
  }
}

/* ========== 内部卡片样式 ========== */
.quick-card {
  height: 100%;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-access-card:hover .quick-card,
.quick-access-card:focus-visible .quick-card {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg) !important;
  border-color: var(--accent-light);
}

/* ========== 默认内容样式 ========== */
.default-content {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* ========== 可访问性提示 ========== */
@supports selector(:focus-visible) {
  /* 现代浏览器支持 :focus-visible，优化焦点显示 */
  .quick-access-card:focus {
    outline: none;
  }

  .quick-access-card:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
  .quick-access-card {
    /* 移动设备上调整焦点框距离 */
  }

  .quick-access-card:focus-visible {
    outline-offset: 1px;
  }
}
</style>
