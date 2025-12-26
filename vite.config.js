import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  // GitHub Pages 需要子路径，Vercel 部署在根域名用 '/'
  // 根据构建环境变量动态设置
  base: process.env.VITE_DEPLOY_ENV === 'github' ? '/ai-productivity-app/' : '/',
  plugins: [vue()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },

  build: {
    // 增加 chunk 大小警告限制到 2MB（只是警告，不影响打包）
    chunkSizeWarningLimit: 2000,
    
    // 启用 source map 用于调试（可选，调试后可关闭）
    sourcemap: false,
    
    // 使用更好的压缩算法
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // 禁用可能导致循环依赖和初始化顺序错误的优化
        reduce_vars: false,
        reduce_funcs: false,
        inline: 1,
        passes: 1,
        // 禁用所有可能重排初始化的优化
        toplevel: false,
        arguments: false
      },
      mangle: {
        // 保留某些关键字的原始名称，避免混淆导致的问题
        keep_fnames: true
      }
    },
    
    rollupOptions: {
      output: {
        // 使用函数方式进行手动分包
        manualChunks(id) {
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
        }
      }
    }
  }
});

