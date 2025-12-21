import { defineStore } from "pinia";

export const useNotesStore = defineStore("notes", {
  state: () => ({
    notes: [
      // 示例
      { id: Date.now(), title: "示例笔记", content: "# Hello\n这是示例笔记。" }
    ],
    activeId: null
  }),
  actions: {
    newNote() {
      const id = Date.now();
      const title = "新笔记";
      this.notes.unshift({ id, title, content: "" });
      this.activeId = id;
      return id;
    },
    deleteNote(id) {
      this.notes = this.notes.filter(n => n.id !== id);
      if (this.activeId === id) this.activeId = this.notes[0]?.id ?? null;
    },
    updateContent(id, content) {
      const n = this.notes.find(x => x.id === id);
      if (n) n.content = content;
    },
    rename(id, title) {
      const n = this.notes.find(x => x.id === id);
      if (n) n.title = title;
    },
    setActive(id) {
      this.activeId = id;
    },
    importNotes(arr) {
      // 简单覆盖/合并策略：加入到最前面
      arr.forEach(n => {
        n.id = n.id || Date.now() + Math.floor(Math.random() * 1000);
        this.notes.unshift(n);
      });
    },
    clearAll() {
      this.notes = [];
      this.activeId = null;
    }
  },
  persist: true // 需在 pinia 上启用 pinia-plugin-persistedstate
});
