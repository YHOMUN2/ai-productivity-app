<template>
  <el-card class="chat-window-card">
    <!-- 卡片头部 -->
    <template #header>
      <div class="card-header">
        <span class="title">AI 对话</span>
        <el-button 
          type="primary" 
          text 
          size="small"
          @click="$emit('save-conversation')"
        >
          💾 保存对话
        </el-button>
      </div>
    </template>

    <!-- 消息列表（滚动容器） -->
    <div class="messages-container" ref="messagesBox">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="message-wrapper"
      >
        <ChatMessage
          :is-user="msg.role === 'user'"
          :content="msg.text"
          :is-typing="msg.isTyping"
        />
      </div>

      <!-- AI 正在回复状态 -->
      <div v-if="isLoading" class="message-wrapper loading-indicator">
        <div class="loading-bubble">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="input-area">
      <el-input
        v-model="inputValue"
        type="textarea"
        :rows="3"
        placeholder="输入你的问题或指令..."
        :disabled="isLoading"
        @keyup.ctrl.enter="$emit('send', inputValue)"
      />
      <div class="input-actions">
        <span class="hint">Ctrl+Enter 发送</span>
        <el-button
          type="primary"
          @click="$emit('send', inputValue)"
          :loading="isLoading"
          :disabled="!inputValue.trim() || isLoading"
        >
          发送
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import ChatMessage from './ChatMessage.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send', 'save-conversation'])

const inputValue = ref('')
const messagesBox = ref(null)

// 监听消息变化，自动滚动到底部
watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    scrollToBottom()
  }
)

watch(
  () => props.isLoading,
  async (newVal) => {
    if (newVal) {
      await nextTick()
      scrollToBottom()
    }
  }
)

function scrollToBottom() {
  if (messagesBox.value) {
    messagesBox.value.scrollTop = messagesBox.value.scrollHeight
  }
}

// 处理发送事件
const handleSend = () => {
  const text = inputValue.value.trim()
  if (text && !props.isLoading) {
    emit('send', text)
    inputValue.value = ''
  }
}

// 监听来自父组件的发送指令
defineExpose({
  send: handleSend,
  scrollToBottom
})
</script>

<style scoped>
.chat-window-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 消息列表区 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  background: var(--bg-surface);
  scroll-behavior: smooth;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: var(--bg-base);
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

.message-wrapper {
  animation: messageEnter 0.3s ease-out;
}

@keyframes messageEnter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 正在加载指示器 */
.loading-indicator {
  display: flex;
  justify-content: flex-start;
}

.loading-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--text-secondary);
  border-radius: 50%;
  animation: pulse 1.4s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 60%, 100% {
    opacity: 0.6;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-8px);
  }
}

/* 输入区 */
.input-area {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

:deep(.el-textarea__inner) {
  resize: none;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  transition: all 0.15s ease;
}

:deep(.el-textarea__inner:focus) {
  background: var(--bg-surface);
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-light);
}

:deep(.el-textarea__inner:disabled) {
  background: var(--disabled-bg);
  color: var(--disabled-text);
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 768px) {
  .chat-window-card {
    height: calc(100vh - 100px);
  }

  :deep(.el-textarea__inner) {
    font-size: 14px;
  }
}
</style>
