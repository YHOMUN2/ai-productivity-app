# Vercel Serverless 部署指南

## 📋 概述

已将后端 API 迁移到 Vercel Serverless Functions，支持以下两种运行方式：

### 开发环境
- 前端 + 本地 Node.js 服务器（3001 端口）
- 前端自动调用 `http://localhost:3001/api/chat`

### 生产环境（Vercel 部署）
- 前端 + Vercel Serverless Function
- 前端自动调用 `/api/chat`（相对路径，同域）

---

## 🚀 快速开始

### 步骤 1：准备环境变量

在项目根目录创建或更新 `.env` 文件：

```env
VOLC_API_KEY=your_api_key_here
```

**本地开发**：该文件被 Node.js 读取
**Vercel 部署**：需要在 Vercel 仪表板配置此环境变量

### 步骤 2：本地开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器（Vite）
npm run dev

# 在另一个终端启动后端 API 服务器
node server.js
```

前端自动检测 `import.meta.env.DEV` 为 `true`，调用 `http://localhost:3001/api/chat`

### 步骤 3：部署到 Vercel

#### 方式一：使用 Vercel CLI（推荐）

```bash
# 全局安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel
```

#### 方式二：连接 GitHub 仓库

1. 推送代码到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 点击 "New Project"
4. 选择你的 GitHub 仓库
5. 点击 "Import"
6. 在 "Environment Variables" 中添加 `VOLC_API_KEY`
7. 点击 "Deploy"

---

## ⚙️ 环境变量配置

### Vercel 仪表板配置

1. 登录 [vercel.com](https://vercel.com)
2. 选择你的项目
3. 点击 "Settings" → "Environment Variables"
4. 添加以下变量：

```
VOLC_API_KEY = your_api_key_here
```

5. 点击 "Save"

### 本地 .env 文件

```env
VOLC_API_KEY=c1676882-2cba-4320-9774-5a7bb2220b2e
VITE_SUPABASE_URL=https://ydltxcrkqfwbjzjvrfhp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_KlP5WpQctFVonFa_Z-9Yuw_uNHD6gie
```

---

## 📁 项目结构

```
ai-productivity-app/
├── api/
│   └── chat.js                 # ✨ Vercel Serverless Function
├── src/
│   ├── api/
│   │   ├── ai.js              # 更新：支持环境自动切换
│   │   ├── ocr.js             # 更新：支持环境自动切换
│   │   └── ...
│   └── ...
├── server.js                   # 本地开发用（3001 端口）
└── .env                        # 环境变量
```

---

## 🔄 自动环境切换原理

### 前端代码

```javascript
// 自动根据环境选择 API 端点
const API_BASE = import.meta.env.DEV 
  ? "http://localhost:3001"    // 开发环境
  : "";                         // 生产环境（相对路径）

// 调用 API
axios.post(`${API_BASE}/api/chat`, { ... })
```

### 工作流程

| 环境 | `import.meta.env.DEV` | API 端点 | 说明 |
|------|-------------------|---------|------|
| 本地开发 | `true` | `http://localhost:3001/api/chat` | 调用本地 Node.js 服务器 |
| Vercel 部署 | `false` | `/api/chat` | 调用 Vercel Serverless Function |

---

## 🧪 测试部署

### 本地测试 Serverless Function

使用 Vercel CLI 的本地模拟环境：

```bash
# 安装 Vercel CLI（如未安装）
npm install -g vercel

# 启动本地 Vercel 函数模拟环境
vercel dev
```

此命令会：
- 在 `http://localhost:3000` 启动前端
- 在 `http://localhost:3000/api/chat` 启动 Serverless Function

### 测试 API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seed-1-6-251015",
    "messages": [
      {
        "role": "user",
        "content": "Hello"
      }
    ]
  }'
```

---

## ⚠️ 常见问题

### Q1：部署后仍调用 localhost:3001？

**原因**：`import.meta.env.DEV` 未被正确设置

**解决**：
```javascript
// 检查环境变量
console.log('DEV Mode:', import.meta.env.DEV)
console.log('API Base:', API_BASE)

// 确保构建时使用生产模式
npm run build
```

### Q2：API 返回 403/401 错误？

**原因**：`VOLC_API_KEY` 未配置或无效

**解决**：
1. 验证本地 `.env` 文件中的 `VOLC_API_KEY`
2. 验证 Vercel 仪表板中配置的 `VOLC_API_KEY`
3. 重新部署以应用新的环境变量

### Q3：请求超时？

**原因**：Vercel Serverless Function 默认超时为 10 秒

**解决**：
- 减少请求体大小（特别是图片的 Base64）
- 如果需要更长超时，升级到 Vercel Pro
- 考虑使用流式传输处理大数据

### Q4：怎样同时支持本地开发和云部署？

已在代码中实现了自动切换！

```javascript
const API_BASE = import.meta.env.DEV ? "http://localhost:3001" : "";
```

- **本地开发**：需要运行 `node server.js` 在 3001 端口
- **云部署**：自动使用 `/api/chat`

---

## 📊 部署后检查清单

- [ ] `VOLC_API_KEY` 已在 Vercel 中配置
- [ ] 前端构建成功（`npm run build`）
- [ ] `/api/chat` 可以正常调用
- [ ] 聊天功能正常工作
- [ ] OCR 功能正常工作
- [ ] 不存在 CORS 错误
- [ ] 生产环境 URL 正确

---

## 🔗 相关链接

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [环境变量配置](https://vercel.com/docs/concepts/projects/environment-variables)
- [豆包 API 文档](https://www.volcengine.com/docs/82379)

---

## 📞 支持

如遇问题，请检查：
1. 本地 `.env` 文件是否正确配置
2. Vercel 环境变量是否已设置
3. 前端是否正确检测环境（打开浏览器控制台查看日志）
4. API Key 是否有效且未过期
