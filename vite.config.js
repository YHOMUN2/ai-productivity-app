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
    // 增加 chunk 大小警告限制到 2MB（只是警告，不影响打包）
    chunkSizeWarningLimit: 2000,
    
    // 使用更好的压缩算法
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    },
    
    rollupOptions: {
      output: {
        // 使用函数方式进行手动分包
        manualChunks(id) {
          // Element Plus 按组件类别分包
          if (id.includes('node_modules/element-plus')) {
            if (id.includes('components/button') || id.includes('components/form') || id.includes('components/input') || id.includes('components/select')) {
              return 'element-form';
            }
            if (id.includes('components/table') || id.includes('components/tree') || id.includes('components/grid')) {
              return 'element-table';
            }
            if (id.includes('components/dropdown') || id.includes('components/menu') || id.includes('components/popover') || id.includes('components/tooltip')) {
              return 'element-menu';
            }
            if (id.includes('components/dialog') || id.includes('components/drawer') || id.includes('components/message')) {
              return 'element-dialog';
            }
            // 其他 Element Plus 组件打包到主库
            return 'element-plus-other';
          }
          
          // PDF.js 单独打包（最大的库）
          if (id.includes('pdfjs-dist')) {
            return 'pdf-js';
          }
          
          // Supabase 单独打包
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }
          
          // axios 单独打包
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
          
          // Vue 单独打包
          if (id.includes('node_modules/vue')) {
            return 'vue';
          }
        }
      }
    }
  }
});

