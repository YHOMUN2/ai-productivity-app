<template>
  <div :class="['message', isUser ? 'user' : 'ai']">
    <!-- 头像 -->
    <div class="avatar">
      <div :class="['avatar-icon', isUser ? 'user-icon' : 'ai-icon']">
        {{ isUser ? '👤' : '🤖' }}
      </div>
    </div>

    <!-- 消息气泡 -->
    <div class="bubble-wrapper">
      <div
        :class="['bubble', { typing: isTyping }]"
        :key="displayContent"
      >
        <!-- AI 打字机模式 -->
        <span v-if="isTyping && !isUser" class="typewriter-text">
          {{ displayContent }}<span class="cursor"></span>
        </span>
        <!-- 普通文本或用户消息 -->
        <span v-else>{{ displayContent }}</span>
      </div>
      <!-- 元数据（可选）-->
      <div class="message-meta">
        {{ formattedTime }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, computed, watch } from 'vue'

const props = defineProps({
  isUser: { type: Boolean, default: false },
  content: { type: String, default: '' },
  isTyping: { type: Boolean, default: false },
  timestamp: { type: [Number, String], default: null }
})

// 打字机显示内容
const displayContent = ref('')
const typingIndex = ref(0)

// 计算格式化的时间
const formattedTime = computed(() => {
  if (!props.timestamp) return ''
  const date = new Date(props.timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
})

// 监听内容变化，触发打字机效果
watch(
  () => props.content,
  (newContent) => {
    if (!newContent) {
      displayContent.value = ''
      typingIndex.value = 0
      return
    }

    // 如果是 AI 消息且已标记为 isTyping，启动打字机
    if (props.isTyping && !props.isUser) {
      displayContent.value = ''
      typingIndex.value = 0
      typeWriter(newContent)
    } else {
      // 非打字机模式，直接显示
      displayContent.value = newContent
      typingIndex.value = 0
    }
  },
  { immediate: true }
)

// 监听 isTyping 变化，如果从 true 变为 false，立即显示全部内容
watch(
  () => props.isTyping,
  (newVal) => {
    if (!newVal && displayContent.value !== props.content) {
      displayContent.value = props.content
      typingIndex.value = props.content.length
    }
  }
)

// 打字机动画函数
function typeWriter(text) {
  if (typingIndex.value < text.length) {
    displayContent.value = text.slice(0, typingIndex.value + 1)
    typingIndex.value++
    // 每 30ms 打一个字符（可根据需要调整速度）
    setTimeout(() => typeWriter(text), 30)
  }
}
</script>

<style scoped>
.message {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

/* 头像 */
.avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: var(--bg-secondary);
}

.avatar-icon.user-icon {
  background: var(--accent-light);
  color: var(--accent);
}

.avatar-icon.ai-icon {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

/* 气泡容器 */
.bubble-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 70%;
}

/* 气泡 */
.bubble {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
  color: var(--text-primary);
  background: var(--bg-secondary);
  transition: all 0.15s ease;
}

/* 用户消息 */
.message.user .bubble {
  background: var(--accent);
  color: #ffffff;
  border-bottom-right-radius: var(--radius-sm);
}

/* AI 消息 */
.message.ai .bubble {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom-left-radius: var(--radius-sm);
}

/* 打字机光标 */
.cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  background: currentColor;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}

/* 元数据 */
.message-meta {
  font-size: 12px;
  color: var(--text-tertiary);
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.message:hover .message-meta {
  opacity: 1;
}

/* 响应式 */
@media (max-width: 768px) {
  .bubble-wrapper {
    max-width: 85%;
  }

  .bubble {
    font-size: 13px;
    padding: 8px 12px;
  }
}

/* 暗色主题适配 */
html[data-theme='dark'] .avatar-icon.user-icon {
  background: var(--accent-light);
  color: var(--accent);
}

html[data-theme='dark'] .avatar-icon.ai-icon {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}
</style>
