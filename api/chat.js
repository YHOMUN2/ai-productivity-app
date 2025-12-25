/**
 * Vercel Serverless Function
 * 作用：作为 Volces ARK API 的代理，处理来自前端的聊天请求
 * 
 * 使用方式：
 * - 本地开发：npm run dev 运行 server.js，前端调用 http://localhost:3001/api/chat
 * - Vercel 部署：自动使用此文件，前端调用 /api/chat
 */

// 受信任的 system 提示，由代理端统一注入，强制覆盖客户端可能发送的 system
const TRUSTED_SYSTEM = {
  role: "system",
  content:
    "你是一个友好、自然、简洁的对话助手。只输出最终答案，不要输出推理过程、链式思考或任何内部分析；不要复述用户指令；不要输出元信息；在不知道时直接说不知道。回答风格自然、有温度。"
};

/**
 * 处理 POST /api/chat 请求
 */
export default async function handler(req, res) {
  // 仅允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 启用 CORS（Vercel 会自动处理，但为了兼容本地开发，显式设置）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const incoming = req.body || {};
    const incomingMessages = Array.isArray(incoming.messages) ? incoming.messages : [];

    // 移除客户端传来的任何 system role，防止 instruction leakage
    const userMessages = incomingMessages.filter((m) => !(m && m.role === "system"));

    // 构造发送到上游的安全 payload，强制使用 TRUSTED_SYSTEM
    const payload = {
      model: incoming.model || "doubao-seed-1-6-251015",
      messages: [TRUSTED_SYSTEM, ...userMessages]
    };

    // 获取 API Key
    const API_KEY = process.env.VOLC_API_KEY;

    // 如果没有配置 API_KEY，返回一个本地 mock 响应，方便调试
    if (!API_KEY) {
      console.warn("警告：未设置 VOLC_API_KEY，返回 mock 响应");
      const lastUser = userMessages.length ? userMessages[userMessages.length - 1] : { content: [{ text: "(no text)" }] };
      const text = typeof lastUser.content === 'string'
        ? lastUser.content
        : (lastUser.content?.[0]?.text || "(no text)");
      
      return res.status(200).json({ 
        data: { answer: `Mock 回复：${text}` },
        mock: true 
      });
    }

    // 调用 Volces ARK API
    const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    // 对上游返回进行净化，删除任何内部推理或链式思考字段，防止泄露模型内部分析
    try {
      const safe = JSON.parse(JSON.stringify(result));
      if (Array.isArray(safe.choices)) {
        for (const ch of safe.choices) {
          if (ch && ch.message && typeof ch.message === 'object') {
            delete ch.message.reasoning_content;
            delete ch.message.internal_reasoning;
            delete ch.message.chain_of_thought;
            delete ch.message.thoughts;
          }
          // 一些实现可能将 logprobs 或类似字段放在 choice 级别
          if (ch) {
            delete ch.logprobs;
          }
        }
      }
      if (safe.usage && safe.usage.completion_tokens_details) {
        delete safe.usage.completion_tokens_details.reasoning_tokens;
      }
      return res.status(200).json(safe);
    } catch (e) {
      // 若净化失败则回退到原始响应（不应该发生）
      console.error('Response sanitization failed:', e);
      return res.status(200).json(result);
    }

  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: "API error", details: err.message });
  }
}
