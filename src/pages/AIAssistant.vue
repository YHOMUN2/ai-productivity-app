<script setup>
import { ref, nextTick, onMounted, computed } from "vue";
import { chatWithAI } from "@/api/ai";
import { useChatStore } from "@/stores/chat";

const chat = useChatStore();
const input = ref("");
const loading = ref(false);

// 聊天区域 DOM
const chatBox = ref(null);

// 滚动到最底部
async function scrollToBottom() {
  await nextTick();
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }
}

// 从不同返回格式中提取 AI 文本的辅助函数
function extractAIText(res) {
  try {
    if (!res) return "[无回应]";

    if (res.data && typeof res.data.answer === "string") return res.data.answer;

    const choices = res.data && res.data.choices;
    if (Array.isArray(choices) && choices.length) {
      const msg = choices[0].message || choices[0];
      const content = msg.content;
      // 如果 content 是数组（分片），拼接所有 text
      if (Array.isArray(content)) return content.map((c) => c.text || c).join("");
      // 如果 content 是字符串（你的真实响应就是这种），优先返回
      if (typeof content === "string") {
        // 如果存在 reasoning_content，一并返回（可选）
        if (msg.reasoning_content && typeof msg.reasoning_content === "string") {
          return content + "\n\n" + msg.reasoning_content;
        }
        return content;
      }
      if (content && typeof content.text === "string") return content.text;
      // 兼容：有时回复在 msg.reasoning_content
      if (msg.reasoning_content && typeof msg.reasoning_content === "string") return msg.reasoning_content;
    }

    if (res.data && res.data.data && typeof res.data.data.answer === "string") return res.data.data.answer;

    return "[无回应]";
  } catch (e) {
    return "[解析返回出错]";
  }
}

// 发送消息到大模型并处理回复
async function send() {
  const text = input.value.trim();
  if (!text || loading.value) return;

  chat.addUser(text);
  input.value = "";
  scrollToBottom();

  loading.value = true;

  try {
    const res = await chatWithAI([
      {
        role: "user",
        content: text
      }
    ]);

    const aiText = extractAIText(res);
    chat.addAI(aiText);
  } catch (e) {
    chat.addAI("AI 服务异常");
    console.error("chatWithAI error:", e);
  }

  loading.value = false;
  scrollToBottom();
}

onMounted(() => {
  scrollToBottom();
});

const currentMessages = computed(() => {
  return (chat.current && Array.isArray(chat.current.messages)) ? chat.current.messages : [];
});

function newChat() {
  chat.createChat();
  // small delay to let UI update
  setTimeout(() => scrollToBottom(), 50);
}

function selectChat(id) {
  chat.selectChat(id);
  setTimeout(() => scrollToBottom(), 50);
}

function removeChat(id) {
  chat.removeChat(id);
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString();
}
</script>

<template>
  <div class="ai-shell">
    <!-- 左侧会话栏 -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <button class="new-chat" @click="newChat">＋ 新聊天</button>
      </div>

      <div class="chat-list">
        <div
          v-for="c in chat.chats"
          :key="c.id"
          class="chat-item"
          :class="{ active: c.id === chat.currentId }"
          @click="selectChat(c.id)"
        >
          <div class="title">{{ c.title }}</div>
          <div class="meta">{{ formatTime(c.createdAt) }}</div>
          <button class="del" @click.stop="removeChat(c.id)">×</button>
        </div>
        <div v-if="!chat.chats.length" class="empty">暂无会话，点击“新聊天”开始</div>
      </div>
    </aside>

    <!-- 右侧主区：聊天 -->
    <div class="ai-container">
      <!-- 聊天内容区 -->
      <div class="chat-box" ref="chatBox">
        <div v-for="(msg, i) in currentMessages" :key="i">
          <!-- 用户消息 -->
          <div v-if="msg.role === 'user'" class="bubble user">
            {{ msg.text }}
          </div>

          <!-- AI 消息 -->
          <div v-else class="bubble ai">
            {{ msg.text }}
          </div>
        </div>

        <!-- AI 正在回复 -->
        <div v-if="loading" class="bubble ai">
          正在生成...
        </div>
      </div>

      <!-- 输入区 -->
      <div class="input-area">
        <input
          v-model="input"
          @keyup.enter="send"
          placeholder="输入内容..."
          autofocus
        />
        <button @click="send" :disabled="loading">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  padding: 10px;
  box-sizing: border-box;
  position: relative;
}

.chat-box {
  /* 不再强制填满剩余高度，而是根据内容自适应，但限制最大高度，避免挤压输入区 */
  flex: 0 1 auto;
  max-height: calc(100vh - 10px);
  overflow-y: auto;
  padding: 10px;
  padding-bottom: 80px; /* 为固定在底部的输入区预留空间，避免最后一条被遮挡 */
}

.bubble {
  max-width: 70%;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.user {
  background-color: #409eff;
  color: white;
  margin-left: auto;
}

.ai {
  background: #e8e8e8;
  color: #333;
  margin-right: auto;
}

.input-area {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-top: 1px solid #ddd;
  background: #fff;
  position: sticky;
  bottom: 0;
  z-index: 20;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

button {
  padding: 10px 18px;
  border: none;
  background: #409eff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
}
</style>

<style scoped>
.ai-shell {
  display: flex;
  height: calc(100vh - 60px);
}

.sidebar {
  width: 260px;
  border-right: 1px solid #eee;
  background: linear-gradient(180deg, #fafafa, #fff);
  padding: 12px;
  box-sizing: border-box;
}

.sidebar-top {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.new-chat {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: none;
  background: #2d8cf0;
  color: white;
  cursor: pointer;
}

.chat-list { max-height: calc(100vh - 140px); overflow: auto; }
.chat-item {
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  background: transparent;
  cursor: pointer;
  position: relative;
}
.chat-item.active { background: #f0f6ff; }
.chat-item .title { font-size: 13px; color: #333; }
.chat-item .meta { font-size: 11px; color: #999; margin-top: 4px; }
.chat-item .del { position: absolute; right: 8px; top: 8px; border: none; background: transparent; color: #999; cursor: pointer; }
.empty { color: #888; padding: 16px; font-size: 13px; }

.ai-container { flex: 1; display: flex; flex-direction: column; }
.chat-box { flex: 0 1 auto; max-height: calc(100vh - 220px); overflow-y: auto; padding: 18px; padding-bottom: 80px; }
.input-area { display: flex; gap: 10px; padding: 14px; border-top: 1px solid #eee; background: #fff; position: sticky; bottom: 0; z-index: 20; }

.bubble { max-width: 70%; border-radius: 10px; padding: 12px 16px; margin-bottom: 12px; white-space: pre-wrap; word-break: break-word; }
.user { background-color: #409eff; color: white; margin-left: auto; }
.ai { background: #e4f0fd; color: #222; margin-right: auto; }

/* 更醒目的主区顶部样式（参考图片的中央搜索风格） */
.ai-container::before {
  content: "你好，光田云恒。";
  display: block;
  text-align: center;
  font-size: 30px;
  color: #32417b;
  margin: 18px 0 6px 0;
}

</style>
