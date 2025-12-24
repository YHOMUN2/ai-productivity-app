<template>
  <el-card 
    class="ui-card" 
    :class="[sizeClass, { 'with-subtitle': sub }]"
  >
    <!-- 卡片头部：标题 + 副标题 + 额外操作 -->
    <template #header v-if="title || sub || $slots.header">
      <div class="ui-card-header">
        <div class="ui-card-title-group">
          <h3 class="ui-card-title">{{ title }}</h3>
          <p v-if="sub" class="ui-card-subtitle">{{ sub }}</p>
        </div>
        <!-- 头部右侧操作区（通过 slot 扩展） -->
        <div v-if="$slots.header" class="ui-card-header-action">
          <slot name="header" />
        </div>
      </div>
    </template>

    <!-- 卡片主体内容 -->
    <div class="ui-card-body">
      <slot />
    </div>

    <!-- 卡片底部操作区（可选） -->
    <template v-if="$slots.footer" #footer>
      <div class="ui-card-footer">
        <slot name="footer" />
      </div>
    </template>
  </el-card>
</template>

<script setup>
import { computed } from 'vue';

// Props 定义
const props = defineProps({
  // 卡片标题
  title: {
    type: String,
    default: '',
  },
  // 副标题（显示在标题下方的较小文本）
  sub: {
    type: String,
    default: '',
  },
  // 卡片尺寸：'small' / 'normal' / 'large'
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['small', 'normal', 'large'].includes(value),
  },
  // 是否可悬停（悬停时提升阴影）
  hoverable: {
    type: Boolean,
    default: true,
  },
});

// 计算尺寸类名
const sizeClass = computed(() => {
  return `ui-card-${props.size}`;
});
</script>

<style scoped>
/* ========== 基础卡片样式 ========== */
.ui-card {
  border: 1px solid var(--border-color);
  background-color: var(--bg-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* 悬停效果 */
.ui-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--accent-light);
}

/* ========== 卡片头部 ========== */
.ui-card :deep(.el-card__header) {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.ui-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  width: 100%;
}

.ui-card-title-group {
  flex: 1;
  min-width: 0; /* 防止 flex item 溢出 */
}

.ui-card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.ui-card-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 头部右侧操作区 */
.ui-card-header-action {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

/* ========== 卡片主体 ========== */
.ui-card :deep(.el-card__body) {
  padding: var(--spacing-md);
  background-color: var(--bg-surface);
  color: var(--text-primary);
}

.ui-card-body {
  /* 内容通过 slot 插入 */
}

/* ========== 卡片底部 ========== */
.ui-card :deep(.el-card__footer) {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.ui-card-footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* ========== 尺寸变量 ========== */

/* 小尺寸卡片 */
.ui-card-small :deep(.el-card__header) {
  padding: var(--spacing-sm);
}

.ui-card-small :deep(.el-card__body) {
  padding: var(--spacing-sm);
}

.ui-card-small .ui-card-title {
  font-size: 0.95rem;
  font-weight: 600;
}

.ui-card-small .ui-card-subtitle {
  font-size: 0.8rem;
}

/* 正常尺寸卡片（默认） */
.ui-card-normal :deep(.el-card__header) {
  padding: var(--spacing-md);
}

.ui-card-normal :deep(.el-card__body) {
  padding: var(--spacing-md);
}

.ui-card-normal .ui-card-title {
  font-size: 1.1rem;
}

.ui-card-normal .ui-card-subtitle {
  font-size: 0.875rem;
}

/* 大尺寸卡片 */
.ui-card-large :deep(.el-card__header) {
  padding: var(--spacing-lg);
}

.ui-card-large :deep(.el-card__body) {
  padding: var(--spacing-lg);
}

.ui-card-large .ui-card-title {
  font-size: 1.3rem;
  margin-bottom: var(--spacing-xs);
}

.ui-card-large .ui-card-subtitle {
  font-size: 0.95rem;
  margin-top: 8px;
}

/* ========== 无标题变量 ========== */
.ui-card :deep(.el-card__header) {
  /* 默认显示 */
}

/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
  .ui-card :deep(.el-card__header) {
    padding: var(--spacing-sm);
  }

  .ui-card :deep(.el-card__body) {
    padding: var(--spacing-sm);
  }

  .ui-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .ui-card-header-action {
    width: 100%;
    justify-content: flex-start;
  }

  .ui-card-title {
    font-size: 1rem;
  }

  .ui-card-subtitle {
    font-size: 0.8rem;
  }

  .ui-card-large .ui-card-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .ui-card :deep(.el-card__header) {
    padding: var(--spacing-xs);
  }

  .ui-card :deep(.el-card__body) {
    padding: var(--spacing-xs);
  }

  .ui-card-title {
    font-size: 0.95rem;
  }

  .ui-card-subtitle {
    font-size: 0.75rem;
  }

  .ui-card-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .ui-card-footer button,
  .ui-card-footer :deep(.el-button) {
    width: 100%;
  }
}

/* ========== 无障碍 ========== */
.ui-card :deep(.el-card__header) a:focus-visible,
.ui-card :deep(.el-card__footer) button:focus-visible,
.ui-card :deep(.el-card__footer) :deep(.el-button:focus-visible) {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
