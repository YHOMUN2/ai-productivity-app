import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    theme: "light" // light | dark
  }),

  actions: {
    toggle() {
      this.theme = this.theme === "light" ? "dark" : "light";
    },
    setTheme(t) {
      this.theme = t;
    }
  },

  persist: true
});
