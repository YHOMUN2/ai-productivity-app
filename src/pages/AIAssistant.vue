<script setup>
import { ref, nextTick, onMounted, computed } from "vue";
import { chatWithAI } from "@/api/ai";
import { useChatStore } from "@/stores/chat";
import { useUserStore } from "@/stores/user";
import { saveChatHistory } from "@/api/chat-with-history";
import ChatWindow from "@/components/ChatWindow.vue";
import { ElMessage } from "element-plus";

const chat = useChatStore();
const user = useUserStore();
const loading = ref(false);
const chatWindowRef = ref(null);
const typingMessageIndex = ref(-1);
const savingToDb = ref(false);

function extractAIText(res) {
  try {
    if (!res) return "[无回应]";
    if (res.data && typeof res.data.answer === "string") return res.data.answer;
    const choices = res.data && res.data.choices;
    if (Array.isArray(choices) && choices.length) {
      const msg = choices[0].message || choices[0];
      const content = msg.content;
      if (Array.isArray(content)) return content.map((c) => c.text || c).join("");
      if (typeof content === "string") {
        if (msg.reasoning_content && typeof msg.reasoning_content === "string") {
          return content + "\n\n" + msg.reasoning_content;
        }
        return content;
      }
      if (content && typeof content.text === "string") return content.text;
      if (msg.reasoning_content && typeof msg.reasoning_content === "string") return msg.reasoning_content;
    }
    if (res.data && res.data.data && typeof res.data.data.answer === "string") return res.data.data.answer;
    return "[无回应]";
  } catch (e) {
    return "[解析返回出错]";
  }
}

async function handleSendMessage(inputText) {
  const text = inputText.trim();
  if (!text || loading.value) return;
  chat.addUser(text);
  await nextTick();
  loading.value = true;
  try {
    chat.addAI("");
    const aiMessageIndex = chat.current.messages.length - 1;
    typingMessageIndex.value = aiMessageIndex;
    const res = await chatWithAI([{ role: "user", content: text }]);
    const aiText = extractAIText(res);
    if (chat.current && aiMessageIndex < chat.current.messages.length) {
      chat.current.messages[aiMessageIndex].text = aiText;
    }
    
    // 自动保存到 Supabase（如果用户已登录）
    if (user.user?.id) {
      savingToDb.value = true;
      try {
        await saveChatHistory(chat.current, user.user.id);
      } catch (error) {
        console.error("Failed to save to Supabase:", error);
        // 不中断用户交互，仅在后台记录错误
      } finally {
        savingToDb.value = false;
      }
    }
  } catch (e) {
    const errorIndex = chat.current?.messages.length - 1;
    if (errorIndex >= 0) {
      chat.current.messages[errorIndex].text = "❌ AI 服务异常，请稍后重试";
    }
    console.error("chatWithAI error:", e);
  } finally {
    loading.value = false;
    typingMessageIndex.value = -1;
    if (chatWindowRef.value) {
      await nextTick();
      chatWindowRef.value.scrollToBottom();
    }
  }
}

async function handleSaveConversation() {
  const current = chat.current;
  if (!current) return;

  try {
    savingToDb.value = true;
    
    // 如果用户已登录，保存到 Supabase
    if (user.user?.id) {
      await saveChatHistory(current, user.user.id);
      ElMessage.success('对话已保存到云端');
    } else {
      // 未登录时，仅导出为本地文件
      const conversation = JSON.stringify(current, null, 2);
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(conversation));
      element.setAttribute("download", `conversation-${current.id}.json`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      ElMessage.success('对话已导出为本地文件');
    }
  } catch (error) {
    console.error("Save conversation error:", error);
    ElMessage.error('保存失败，请重试');
  } finally {
    savingToDb.value = false;
  }
}

onMounted(() => {
  if (!chat.currentId) {
    chat.createChat();
  }
});

const currentMessages = computed(() => {
  if (!chat.current || !Array.isArray(chat.current.messages)) return [];
  return chat.current.messages.map((msg, idx) => ({
    ...msg,
    isTyping: !loading.value && idx === typingMessageIndex.value && msg.role === "ai",
    timestamp: msg.timestamp || Date.now()
  }));
});

function newChat() {
  chat.createChat();
  typingMessageIndex.value = -1;
}

function selectChat(id) {
  chat.selectChat(id);
  typingMessageIndex.value = -1;
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
  <div class="ai-assistant-page">
    <aside class="conversation-sidebar">
      <div class="sidebar-header">
        <el-button type="primary" size="large" class="new-chat-btn" @click="newChat">
          ➕ 新对话
        </el-button>
      </div>
      <div class="conversation-list">
        <div v-for="conv in chat.chats" :key="conv.id" :class="['conversation-item', { active: conv.id === chat.currentId }]" @click="selectChat(conv.id)">
          <div class="conv-title">{{ conv.title }}</div>
          <div class="conv-meta">{{ formatTime(conv.createdAt) }}</div>
          <el-button type="danger" text size="small" class="delete-btn" @click.stop="removeChat(conv.id)" icon="Delete" />
        </div>
        <div v-if="!chat.chats.length" class="empty-state">暂无对话<br />点击"新对话"开始</div>
      </div>
    </aside>
    <main class="chat-main">
      <ChatWindow ref="chatWindowRef" :messages="currentMessages" :is-loading="loading" @send="handleSendMessage" @save-conversation="handleSaveConversation" />
    </main>
    <div v-if="savingToDb" class="save-indicator">
      <span class="spinner"></span>
      保存中...
    </div>
  </div>
</template>

<style scoped>
.ai-assistant-page { display: flex; height: calc(100vh - 60px); background: var(--bg-base); position: relative; }
.conversation-sidebar { width: 280px; background: var(--bg-surface); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; overflow: hidden; transition: all 0.2s ease; }
.sidebar-header { padding: var(--spacing-md); border-bottom: 1px solid var(--border-color); }
.new-chat-btn { width: 100%; height: 40px; font-size: 14px; font-weight: 500; border-radius: var(--radius-md); transition: all 0.15s ease; }
.new-chat-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.conversation-list { flex: 1; overflow-y: auto; padding: var(--spacing-sm); display: flex; flex-direction: column; gap: var(--spacing-xs); }
.conversation-list::-webkit-scrollbar { width: 4px; }
.conversation-list::-webkit-scrollbar-track { background: transparent; }
.conversation-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }
.conversation-list::-webkit-scrollbar-thumb:hover { background: var(--text-tertiary); }
.conversation-item { padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-md); cursor: pointer; background: transparent; transition: all 0.15s ease; position: relative; }
.conversation-item:hover { background: var(--hover-bg); }
.conversation-item.active { background: var(--accent-light); color: var(--accent); }
.conv-title { font-size: 13px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
.conversation-item.active .conv-title { color: var(--accent); }
.conv-meta { font-size: 11px; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.delete-btn { position: absolute; right: var(--spacing-sm); top: 50%; transform: translateY(-50%); opacity: 0; transition: opacity 0.15s ease; }
.conversation-item:hover .delete-btn { opacity: 1; }
.empty-state { color: var(--text-tertiary); font-size: 12px; text-align: center; padding: var(--spacing-lg); line-height: 1.8; }
.chat-main { flex: 1; display: flex; flex-direction: column; padding: var(--spacing-md); overflow: hidden; }
@media (max-width: 768px) { .ai-assistant-page { flex-direction: column; } .conversation-sidebar { width: 100%; height: 200px; border-right: none; border-bottom: 1px solid var(--border-color); } .chat-main { flex: 1; } }
.save-indicator { position: fixed; bottom: 20px; right: 20px; background: var(--accent); color: white; padding: 12px 16px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 8px; font-size: 12px; box-shadow: var(--shadow-lg); z-index: 1000; }
.spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
