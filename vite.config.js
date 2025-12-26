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
  },

  build: {
    // 增加 chunk 大小警告限制 (默认 500KB)
    chunkSizeWarningLimit: 1000,
    
    // 手动分包配置
    rollupOptions: {
      output: {
        manualChunks: {
          // Element Plus 单独打包
          'element-plus': ['element-plus'],
          // Supabase 单独打包
          'supabase': ['@supabase/supabase-js'],
          // 其他第三方库
          'utils': ['axios', 'dompurify', 'cors'],
          // Vue 相关
          'vue': ['vue']
        }
      }
    }
  }
});

