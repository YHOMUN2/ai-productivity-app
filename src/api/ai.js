import axios from "axios";

// 注意：system 提示由代理端统一注入，避免客户端重复或被用户覆盖导致的 instruction leakage。
export function chatWithAI(messages) {
  const msgs = Array.isArray(messages) ? messages.slice() : [];

  return axios.post("http://localhost:3001/api/chat", {
    model: "doubao-seed-1-6-251015",
    messages: msgs
  });
}
