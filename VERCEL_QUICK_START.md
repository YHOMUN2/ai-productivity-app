# Vercel 部署快速参考

## ✅ 已完成的工作

### 1. 创建 Serverless Function
- **文件**：`api/chat.js`
- **功能**：接收前端请求，转发给 Volces ARK API，净化返回结果
- **支持**：自动 CORS，环境变量自动读取

### 2. 更新前端代码
- **ai.js**：自动切换 API 端点
- **ocr.js**：自动切换 API 端点
- **原理**：根据 `import.meta.env.DEV` 判断环境

### 3. 创建部署文档
- **文件**：`VERCEL_DEPLOYMENT.md`
- **内容**：详细的部署指南、常见问题、测试方法

---

## 🚀 部署步骤（3 步）

### Step 1: 推送代码到 GitHub
```bash
git add .
git commit -m "feat: 迁移到 Vercel Serverless Functions"
git push
```

### Step 2: 连接 Vercel
访问 [vercel.com](https://vercel.com)：
1. 点击 "New Project"
2. 导入你的 GitHub 仓库
3. 配置环境变量：`VOLC_API_KEY=...`
4. 点击 "Deploy"

### Step 3: 验证部署
```bash
# 测试 API
curl https://your-vercel-domain.vercel.app/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"model":"doubao-seed-1-6-251015","messages":[{"role":"user","content":"test"}]}'
```

---

## 📊 环境对应关系

| 场景 | `import.meta.env.DEV` | API 端点 | 命令 |
|------|-------------------|---------|------|
| 本地开发 | `true` | `http://localhost:3001/api/chat` | `npm run dev` + `node server.js` |
| Vercel 部署 | `false` | `/api/chat` | 自动 |

---

## ⚙️ 本地测试

### 方式一：使用 Vercel CLI（推荐）
```bash
npm install -g vercel
vercel login
vercel dev
# 访问 http://localhost:3000
```

### 方式二：分别运行前后端
```bash
# 终端 1：启动前端
npm run dev
# 访问 http://localhost:5173

# 终端 2：启动后端
node server.js
# 监听 http://localhost:3001
```

---

## 🔑 环境变量位置

| 位置 | 变量 | 说明 |
|------|------|------|
| `.env` (本地) | `VOLC_API_KEY` | 本地开发使用 |
| Vercel 仪表板 | `VOLC_API_KEY` | 云部署使用 |

---

## 📋 部署检查清单

- [ ] `.env` 包含正确的 `VOLC_API_KEY`
- [ ] Vercel 环境变量已配置
- [ ] `api/chat.js` 已创建
- [ ] `src/api/ai.js` 已更新（支持 `API_BASE`）
- [ ] `src/api/ocr.js` 已更新（支持 `API_BASE`）
- [ ] 代码已推送到 GitHub
- [ ] Vercel 部署成功
- [ ] 前端聊天功能可用
- [ ] OCR 功能可用

---

## 🆘 快速排查

### API 返回 404？
```javascript
// 检查：api/chat.js 是否存在
// 检查：export default function handler 是否正确
```

### API 返回 401/403？
```javascript
// 检查：VOLC_API_KEY 是否正确
// 检查：Vercel 环境变量是否已设置
// 检查：API Key 是否过期
```

### 前端仍调用 localhost:3001？
```javascript
// 检查：import.meta.env.DEV 的值
// 检查：npm run build 是否成功
// 检查：生产构建中是否使用相对路径
```

### CORS 错误？
```javascript
// api/chat.js 已设置 CORS 头
// 检查：Vercel 配置是否正确
// 检查：前端请求头是否正确
```

---

## 📖 相关文件

- **`api/chat.js`** - Vercel Serverless Function
- **`server.js`** - 本地开发 Express 服务器
- **`src/api/ai.js`** - 聊天 API（已更新）
- **`src/api/ocr.js`** - OCR API（已更新）
- **`VERCEL_DEPLOYMENT.md`** - 详细部署指南

---

## 💡 最佳实践

✅ **推荐做法**：
- 本地开发时运行 `node server.js`
- 生产环境使用 Vercel 自动部署
- 使用环境变量管理 API Key
- 定期检查 Vercel 部署日志

❌ **避免做法**：
- 将 API Key 硬编码在代码中
- 在 git 中提交 `.env` 文件
- 混合使用多个 API 端点
- 忘记配置 Vercel 环境变量
