import axios from "axios";

// 自动根据环境选择 API 端点
// 开发环境：使用本地 Node.js 服务器 (localhost:3001)
// 生产环境：使用 Vercel Serverless Function (相对路径 /api/chat)
const API_BASE = import.meta.env.DEV 
  ? "http://localhost:3001" 
  : "";

// 注意：system 提示由代理端统一注入，避免客户端重复或被用户覆盖导致的 instruction leakage。
export function chatWithAI(messages) {
  const msgs = Array.isArray(messages) ? messages.slice() : [];

  return axios.post(`${API_BASE}/api/chat`, {
    model: "doubao-seed-1-6-251015",
    messages: msgs
  });
}
