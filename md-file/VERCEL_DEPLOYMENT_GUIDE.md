# Vercel 部署指南

## 概述

本项目是一个融合了 **AI 聊天功能** 和 **Supabase 后端** 的 Vue 3 应用，部署到 Vercel 作为无服务器函数。

### 架构设计

```
┌─────────────────────────────────────────────────────┐
│  浏览器（Vue 3 前端）                                │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   /api/chat                  直连 Supabase
   (大模型代理)              (用户数据, RLS)
        │
        ▼
  火山引擎 ARK API

```

---

## 前置条件

### 1️⃣ 环境要求
- Node.js >= 16
- npm 或 yarn
- Vercel 账户（https://vercel.com）
- Supabase 项目（https://supabase.com）

### 2️⃣ 获取必要的密钥

#### Supabase
登录 Supabase Dashboard，找到你的项目设置（Settings）：
- **VITE_SUPABASE_URL** - 项目 URL
- **VITE_SUPABASE_PUBLISHABLE_KEY** - 匿名公钥（anon key）
- **SUPABASE_SERVICE_ROLE_KEY** - 服务角色密钥（service role key）⚠️ 保密

#### 大模型 API（字节跳动火山引擎）
1. 访问 https://console.volcengine.com
2. 创建或获取 ARK API Key
3. 记下 **VOLC_API_KEY**

---

## 本地开发设置

### 1. 克隆并安装依赖

```bash
git clone <your-repo-url>
cd ai-productivity-app
npm install
```

### 2. 配置本地环境变量

创建 `.env.local` 文件（已有示例模板 `.env.example`）：

```env
# Supabase 前端配置（VITE_ 前缀可在前端访问）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Supabase 服务端配置（仅服务器使用）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# 大模型 API
VOLC_API_KEY=ark-...
```

### 3. 启动本地开发服务器

```bash
npm run dev
```

访问 http://localhost:5173（Vite 前端）

**同时启动后端代理服务器**（新终端）：
```bash
npm run dev:server
```
（确保 `package.json` 中有 `dev:server` 脚本）

### 4. 测试 API 端点

#### 测试 AI 聊天
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}]}'
```

#### 测试 Supabase 代理
```bash
curl -X POST http://localhost:3001/api/supabase \
  -H "Content-Type: application/json" \
  -d '{
    "action":"select",
    "table":"profiles",
    "filters":{}
  }'
```

---

## Vercel 部署步骤

### 1️⃣ 连接 GitHub 仓库

1. 登录 Vercel (https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择你的 GitHub 仓库
4. Vercel 会自动检测到这是 Vite 项目

### 2️⃣ 配置构建设置

在 Vercel 项目设置中：

**Build & Output Settings:**
- **Framework Preset**: Vite
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist`

### 3️⃣ 设置环境变量

在 Vercel 项目的 **Settings → Environment Variables** 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | 前端可访问 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | 前端可访问 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | ⚠️ 仅 API 端点使用 |
| `VOLC_API_KEY` | `ark-...` | ⚠️ 仅 API 端点使用 |

**⚠️ 重要：**
- `VITE_` 前缀的变量会被编译进前端代码（公开）
- 不带 `VITE_` 前缀的仅在 Serverless Function 中可用

### 4️⃣ 部署

推送代码到 GitHub 主分支：

```bash
git add .
git commit -m "feat: configure for Vercel deployment"
git push origin main
```

Vercel 会自动检测到推送，开始构建和部署。

访问 https://your-project-name.vercel.app

---

## 验证部署

### 1. 测试前端加载

访问 https://your-project-name.vercel.app，确保页面加载正常。

### 2. 测试 API 端点

#### 测试 AI 聊天 API
```bash
curl -X POST https://your-project-name.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hello"}]}'
```

#### 测试 Supabase 代理 API
```bash
curl -X POST https://your-project-name.vercel.app/api/supabase \
  -H "Content-Type: application/json" \
  -d '{
    "action":"select",
    "table":"profiles",
    "filters":{}
  }'
```

### 3. 测试前端功能

1. **Supabase 认证**：注册和登录
2. **AI 聊天**：在 AI 助手页面发送消息
3. **数据持久化**：查看对话是否保存到 Supabase

---

## 常见问题

### ❌ API 返回 401/403

**原因**：环境变量未正确设置
**解决**：
```bash
# 验证 Vercel 上的环境变量
vercel env list
```

### ❌ CORS 错误

**原因**：前端跨域请求被拒绝
**解决**：已在 `api/chat.js` 和 `api/supabase.js` 中设置 CORS 头

### ❌ "Method not allowed" (405)

**原因**：HTTP 方法错误
**解决**：所有 API 端点只接受 POST 请求和 OPTIONS（CORS 预检）

### ❌ Supabase 连接失败

**原因**：
1. `SUPABASE_SERVICE_ROLE_KEY` 错误或泄露
2. Supabase 项目已删除
3. RLS 策略过于严格

**解决**：
```bash
# 重新生成密钥
# 1. 登录 Supabase
# 2. Project Settings → API
# 3. 复制新的密钥到 Vercel
```

---

## 生产环境最佳实践

### ✅ 安全检查清单

- [ ] 服务端密钥（无 `VITE_` 前缀）已添加到 Vercel
- [ ] `.env.local` 文件已添加到 `.gitignore`（不提交敏感信息）
- [ ] Supabase RLS 策略已配置（仅允许用户访问自己的数据）
- [ ] API 请求添加了速率限制
- [ ] 错误消息不暴露敏感信息

### 🔒 Supabase RLS 示例

```sql
-- 用户只能访问自己的个人资料
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 用户只能更新自己的个人资料
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

### 🚀 性能优化

1. **启用 Vercel 缓存**：
   ```json
   {
     "headers": [{
       "source": "/api/(.*)",
       "headers": [{
         "key": "Cache-Control",
         "value": "public, max-age=60"
       }]
     }]
   }
   ```

2. **优化 API 响应时间**：
   - 避免大文件传输
   - 使用异步操作
   - 添加超时控制

### 📊 监控

使用 Vercel Analytics 监控：
- 页面加载时间
- API 响应时间
- 错误率

---

## 故障排查

### 查看构建日志

Vercel Dashboard → 项目 → Deployments → 选择部署 → Logs

### 检查运行时日志

```bash
# 使用 Vercel CLI
vercel logs <deployment-url>
```

### 本地重现 Vercel 环境

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目根目录运行本地环境
vercel dev
```

---

## 相关文档

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/)
- [Vue 3 Guide](https://vuejs.org/)

---

## 常见命令

```bash
# 本地开发
npm run dev

# 构建生产版本
npm run build:vercel

# 预览构建结果
npm run preview

# 使用 Vercel CLI 本地运行
vercel dev

# 查看环境变量
vercel env list

# 拉取生产环境变量到本地
vercel env pull
```

---

祝部署顺利！有任何问题，请查阅相关文档或联系技术支持。
