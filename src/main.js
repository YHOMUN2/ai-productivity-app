import { createApp } from "vue";
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from "./AppLayout.vue";
import router from "./router";
import pinia from "./stores";
import { testSupabaseConnection } from "./utils/supabaseTest";

const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.use(pinia);

// 全局错误处理：捕获来自浏览器插件或第三方脚本的错误
app.config.errorHandler = (err, instance, info) => {
  const errMsg = err?.message || '';
  const errStack = err?.stack || '';
  
  // 忽略浏览器插件错误（已知的浏览器插件干扰）
  const pluginPatterns = [
    '/hybridaction',
    'zybTracker',
    'v[w] is not a function',
    'g[y] is not a function',
    'chrome-extension://',
    'A listener indicated an asynchronous response',
    'message channel closed'
  ];
  
  if (pluginPatterns.some(pattern => errMsg.includes(pattern) || errStack.includes(pattern))) {
    // 静默处理浏览器插件错误，不输出到控制台
    return;
  }
  
  // 其他应用错误正常处理
  console.error('应用错误:', err, info);
};

// 处理未捕获的 Promise 拒绝
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonMsg = reason?.message || String(reason);
    
    // 过滤浏览器插件相关的 Promise 拒绝
    const pluginPatterns = [
      '/hybridaction',
      'zybTracker',
      'v[w] is not a function',
      'g[y] is not a function',
      'chrome-extension://',
      'A listener indicated an asynchronous response',
      'message channel closed',
      'toLowerCase'
    ];
    
    if (pluginPatterns.some(pattern => reasonMsg.includes(pattern))) {
      event.preventDefault(); // 阻止浏览器插件错误冒泡
    }
  });
}

app.mount("#app");

// 开发环境：测试 Supabase 连接
if (import.meta.env.DEV) {
  testSupabaseConnection();
}

import "./assets/theme.css";
