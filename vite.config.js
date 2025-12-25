import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  base: "/ai-productivity-app/",
  plugins: [vue()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});

