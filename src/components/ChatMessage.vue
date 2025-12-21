<template>
  <div :class="['msg', isUser ? 'user' : 'ai']">
    <div class="avatar">
      <img :src="isUser ? '/user.png' : '/ai.png'" alt="avatar" />
    </div>

    <div class="bubble" v-html="content"></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  isUser: { type: Boolean, default: false },
  content: { type: String, default: '' },
});
</script>

<style scoped>
.msg {
  display: flex;
  margin-bottom: 14px;
  align-items: flex-start;
}

.msg.user {
  flex-direction: row-reverse;
}

.msg .avatar {
  /* 保持头像和气泡间距 */
  margin: 0 8px;
}

.msg .avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.msg .bubble {
  max-width: 70%;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

/* 用户消息样式 */
.msg.user .bubble {
  background: #96c2f4;
  color: #fff;
  border-bottom-right-radius: 4px;
}

/* AI 消息样式 */
.msg.ai .bubble {
  background: #f2f5ff;
  color: #222;
  border-bottom-left-radius: 4px;
}
</style>
