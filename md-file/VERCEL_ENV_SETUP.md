# Vercel 环境变量设置指南

## 问题
在 Vercel 部署时收到错误：
```
Environment Variable "VITE_SUPABASE_URL" references Secret "vite_supabase_url", which does not exist.
```

## 原因
`vercel.json` 中试图引用不存在的 Secrets。

## 解决方案

### 在 Vercel 控制面板中设置环境变量

1. **登录 Vercel**：https://vercel.com/dashboard

2. **找到你的项目**，点击进去

3. **进入 Settings（设置）**
   - 项目页面 → Settings 标签

4. **点击 Environment Variables**
   ```
   Settings → Environment Variables
   ```

5. **添加以下环境变量**：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | `https://ydltxcrkqfwbjzjvrfhp.supabase.co` | Supabase 项目 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_KlP5WpQctFVonFa_Z-9Yuw_uNHD6gie` | Supabase 公开密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | 从 Supabase 获取的完整密钥 | ⚠️ 服务端密钥，保密 |
| `VOLC_API_KEY` | 火山引擎 API 密钥 | AI 模型 API |

### 逐步操作

#### 步骤 1：添加 Supabase 前端配置

1. 在 Environment Variables 页面，点击"Add New"
2. 输入：
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://ydltxcrkqfwbjzjvrfhp.supabase.co`
3. 勾选：Production, Preview, Development
4. 点击"Save"

#### 步骤 2：添加 Supabase 公开密钥

1. 点击"Add New"
2. 输入：
   - **Name**: `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Value**: `sb_publishable_KlP5WpQctFVonFa_Z-9Yuw_uNHD6gie`
3. 勾选所有环境
4. 点击"Save"

#### 步骤 3：添加 Supabase 服务端密钥

1. 点击"Add New"
2. 输入：
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: （从 Supabase Project Settings → API 获取的完整 service role key）
3. ⚠️ **重要**：仅勾选 **Production** 环境（不要勾选 Preview/Development）
4. 点击"Save"

#### 步骤 4：添加大模型 API 密钥

1. 点击"Add New"
2. 输入：
   - **Name**: `VOLC_API_KEY`
   - **Value**: （你的火山引擎 API 密钥）
3. 勾选所有环境（或仅 Production）
4. 点击"Save"

### 完整的环境变量列表

```
VITE_SUPABASE_URL=https://ydltxcrkqfwbjzjvrfhp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_KlP5WpQctFVonFa_Z-9Yuw_uNHD6gie
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (完整密钥)
VOLC_API_KEY=ark-... (API 密钥)
```

## ⚠️ 重要安全提示

- 🔒 **SUPABASE_SERVICE_ROLE_KEY** 是敏感信息，只在服务器端使用
- 🔒 **VOLC_API_KEY** 也是敏感信息，不要在前端代码中暴露
- 检查 `.gitignore` 是否包含 `.env.local`（防止提交本地密钥）

## 验证部署

设置完环境变量后：

1. **触发重新部署**：
   - 点击项目 → Deployments
   - 选择最新部署 → 点击"Redeploy"
   - 或推送代码到 GitHub 自动触发

2. **检查部署日志**：
   - Deployments → 选择部署 → Logs
   - 查看是否有环境变量相关的错误

3. **测试 API**：
   ```bash
   curl -X POST https://your-project.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"test"}]}'
   ```

## 常见问题

### Q: 如何获取 SUPABASE_SERVICE_ROLE_KEY？

A: 
1. 登录 Supabase Dashboard
2. 选择你的项目
3. 进入 Project Settings → API
4. 在 "JWT Secret" 部分找到 "service_role key"
5. 复制完整的密钥

### Q: 为什么前端加载时出现 CORS 错误？

A: 确保 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY` 已正确设置

### Q: API 返回 401/403？

A: 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否正确，或 Supabase RLS 策略是否过于严格

## 下次部署

完成以上步骤后，下次推送代码到 GitHub 时，Vercel 会自动：
1. 读取环境变量
2. 进行构建
3. 部署到生产环境

无需再修改 `vercel.json`。
