import { defineStore } from "pinia";

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useChatStore = defineStore("chat", {
  state: () => ({
    // chats: [{ id, title, messages: [{role,text}], createdAt }]
    chats: [],
    currentId: null
  }),
  getters: {
    current: (state) => {
      return state.chats.find((c) => c.id === state.currentId) || null;
    }
  },

  actions: {
    // 创建一个新会话并切换到该会话
    createChat() {
      const id = genId();
      const chat = { id, title: "新对话", messages: [], createdAt: Date.now() };
      this.chats.unshift(chat);
      this.currentId = id;
      return id;
    },

    // 选择已有会话
    selectChat(id) {
      if (this.chats.find((c) => c.id === id)) this.currentId = id;
    },


    addUser(text) {
      if (!this.currentId) this.createChat();
      const c = this.chats.find((x) => x.id === this.currentId);
      if (!c) return;
      c.messages.push({ role: "user", text });
      // 如果是第一条 user 消息，更新标题简略为该文本的前 20 字
      if ((!c.title || c.title === "新对话") && text) {
        const t = text.length > 20 ? text.slice(0, 20) + "..." : text;
        c.title = t;
      }
    },

    addAI(text) {
      if (!this.currentId) this.createChat();
      const c = this.chats.find((x) => x.id === this.currentId);
      if (!c) return;
      c.messages.push({ role: "ai", text });
    },

    clearCurrent() {
      const c = this.chats.find((x) => x.id === this.currentId);
      if (c) c.messages = [];
    },

    removeChat(id) {
      this.chats = this.chats.filter((c) => c.id !== id);
      if (this.currentId === id) this.currentId = this.chats.length ? this.chats[0].id : null;
    }
  },

  persist: true
});
