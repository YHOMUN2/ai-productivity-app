<template>
  <el-form
    class="standard-form"
    :model="formModel"
    :label-width="labelWidth"
    :size="size"
    @submit.prevent="handleSubmit"
  >
    <!-- 表单项插槽 - 允许自定义表单字段 -->
    <slot />

    <!-- 表单底部操作区 -->
    <div class="form-footer">
      <!-- 自定义按钮区（如果有的话） -->
      <slot name="footer">
        <!-- 默认提交按钮 -->
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          {{ submitButtonText }}
        </el-button>
        
        <!-- 重置按钮（可选） -->
        <el-button v-if="showReset" @click="handleReset">
          {{ resetButtonText }}
        </el-button>
      </slot>
    </div>
  </el-form>
</template>

<script setup>
import { ref } from 'vue';

// Props 定义
const props = defineProps({
  // 表单数据对象（v-model 替代品）
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  // 提交按钮文本
  submitButtonText: {
    type: String,
    default: '提交',
  },
  // 重置按钮文本
  resetButtonText: {
    type: String,
    default: '重置',
  },
  // 提交按钮加载状态
  submitLoading: {
    type: Boolean,
    default: false,
  },
  // 是否显示重置按钮
  showReset: {
    type: Boolean,
    default: true,
  },
  // 表单 label 宽度（Element Plus 标准值）
  labelWidth: {
    type: String,
    default: '100px',
  },
  // 表单尺寸：'large' / 'default' / 'small'
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['large', 'default', 'small'].includes(value),
  },
});

// Emits 定义
const emit = defineEmits(['submit', 'reset', 'update:modelValue']);

// 内部表单数据
const formModel = ref(props.modelValue);

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    formModel.value = { ...newVal };
  },
  { deep: true }
);

// 处理提交
function handleSubmit() {
  emit('submit', formModel.value);
}

// 处理重置
function handleReset() {
  formModel.value = {};
  emit('reset');
  emit('update:modelValue', {});
}
</script>

<script>
import { watch } from 'vue';
export default {
  name: 'StandardForm'
};
</script>

<style scoped>
/* ========== 表单容器样式 ========== */
.standard-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
  padding: 0;
  background-color: transparent;
}

/* ========== 表单项默认样式 ========== */
.standard-form :deep(.el-form-item) {
  margin-bottom: var(--spacing-md, 16px);
}

/* 表单项标签样式 */
.standard-form :deep(.el-form-item__label) {
  color: var(--text-primary);
  font-weight: 500;
}

/* 必填项红色星号 */
.standard-form :deep(.el-form-item.is-required > .el-form-item__label::before) {
  color: var(--error, #f56c6c);
}

/* 表单输入框焦点样式 */
.standard-form :deep(.el-input__wrapper) {
  background-color: var(--bg-surface);
  border-color: var(--border-color);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.standard-form :deep(.el-input__wrapper:hover) {
  border-color: var(--accent-light, #4f46e5);
}

.standard-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent, #4f46e5);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

/* 输入框文本颜色 */
.standard-form :deep(.el-input__inner) {
  color: var(--text-primary);
  background-color: transparent;
}

.standard-form :deep(.el-input__inner::placeholder) {
  color: var(--text-secondary);
}

/* 错误提示文本 */
.standard-form :deep(.el-form-item__error) {
  color: var(--error, #f56c6c);
  font-size: 12px;
  margin-top: 4px;
}

/* ========== 表单底部操作区 ========== */
.form-footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);
  margin-top: var(--spacing-lg, 24px);
  padding-top: var(--spacing-md, 16px);
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
}

/* 按钮样式 */
.form-footer :deep(.el-button) {
  min-width: 80px;
  border-radius: var(--radius-md, 4px);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* 主按钮 */
.form-footer :deep(.el-button.is-primary) {
  background-color: var(--accent, #4f46e5);
  border-color: var(--accent, #4f46e5);
  color: #ffffff;
}

.form-footer :deep(.el-button.is-primary:hover) {
  background-color: var(--accent-dark, #4338ca);
  border-color: var(--accent-dark, #4338ca);
}

/* 次按钮 */
.form-footer :deep(.el-button:not(.is-primary)) {
  color: var(--text-primary);
  border-color: var(--border-color);
  background-color: var(--bg-surface);
}

.form-footer :deep(.el-button:not(.is-primary):hover) {
  border-color: var(--accent-light, #4f46e5);
  color: var(--accent, #4f46e5);
}

/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
  .standard-form {
    gap: var(--spacing-sm, 8px);
  }

  .standard-form :deep(.el-form-item) {
    margin-bottom: var(--spacing-sm, 8px);
  }

  .form-footer {
    gap: var(--spacing-sm, 8px);
    margin-top: var(--spacing-md, 16px);
    padding-top: var(--spacing-sm, 8px);
  }

  /* 小屏幕上调整标签宽度 */
  .standard-form :deep(.el-form-item__label) {
    width: auto;
  }
}

@media (max-width: 480px) {
  .form-footer {
    flex-direction: column;
  }

  .form-footer :deep(.el-button) {
    width: 100%;
  }
}

/* ========== 暗色模式适配 ========== */
[data-theme="dark"] .standard-form {
  --text-primary: #e5e7eb;
  --text-secondary: #9ca3af;
  --bg-surface: #1f2937;
  --border-color: #374151;
  --accent: #6366f1;
  --accent-light: #818cf8;
  --accent-dark: #4f46e5;
}
</style>
