# 如何从 Supabase 官方获取 SERVICE_ROLE_KEY

## ⚠️ 重要提示

**SUPABASE_SERVICE_ROLE_KEY** 是一个敏感的密钥，包含完全的数据库访问权限。请确保：

1. ✅ 从 **Supabase 官方获取**（不要使用任何人给你的密钥）
2. ✅ **不要在前端代码中使用**
3. ✅ **不要提交到 Git 公开仓库**
4. ✅ **仅在服务器环境中使用**（Vercel API 或自己的服务器）

---

## 📍 Supabase 获取密钥的位置

### 步骤 1：登录 Supabase Dashboard

访问 https://supabase.com/dashboard

用你的账号登录（邮箱/GitHub/Google）

### 步骤 2：选择你的项目

在项目列表中找到你的项目：
- 项目名称：`ai-productivity-app`
- 项目 ID：`ydltxcrkqfwbjzjvrfhp`（从 URL 可以看到）

点击进入这个项目

### 步骤 3：打开 Project Settings

在左侧菜单中找到 **Settings** 选项

点击进入 Settings

### 步骤 4：找到 API 页面

在 Settings 左侧菜单中找到 **API**

点击进入 API 页面

### 步骤 5：复制 Service Role Key

在 API 页面中，你会看到 "Project API keys" 部分：

```
┌─────────────────────────────────────────┐
│ Project API keys                        │
├─────────────────────────────────────────┤
│                                         │
│ anon public key:                        │
│ [复制] sb_publishable_...               │
│                                         │
│ service_role secret:                    │
│ [复制] eyJhbGciOiJIUzI1NiIs... (加密)   │
│                                         │
└─────────────────────────────────────────┘
```

你需要的是 **service_role secret**（第二个）

点击 [复制] 按钮，或者：
1. 点击密钥部分的眼睛图标👁️显示全部
2. 手动选择并复制

### 步骤 6：更新 .env.local

将复制的密钥粘贴到 `.env.local` 文件中：

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
```

---

## 🔍 密钥格式确认

你复制的密钥应该是这样的格式：

### ✅ 正确的格式

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjI0MDAwMDAwLCJleHAiOjI1MjQ2MDgwMDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

特征：
- 很长（通常 300+ 字符）
- 包含三个部分，用 `.` 分隔（JWT 格式）
- 以 `eyJhbGc...` 开头

### ❌ 错误的格式

```
sb_publishable_...  ❌ 这是公开密钥，不对
sk-...              ❌ 这看起来像 OpenAI 密钥
xxxxx               ❌ 太短了
```

---

## 📝 .env.local 文件配置完整例子

获取完密钥后，你的 `.env.local` 应该看起来像这样：

```env
# Supabase 前端配置
VITE_SUPABASE_URL=https://ydltxcrkqfwbjzjvrfhp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_KlP5WpQctFVonFa_Z-9Yuw_uNHD6gie

# Supabase 服务端配置（从官方复制的真实密钥）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbHR4Y3JrcWZ3YmpvendyZmhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzQwMjA3NiwiZXhwIjoxODg1MTY4MDc2fQ.你的实际密钥

# 大模型 API
VOLC_API_KEY=c1676882-2cba-4320-9774-5a7bb2220b2e
```

---

## ⚠️ 安全检查清单

- [ ] 密钥是从 **Supabase 官方网站** 复制的
- [ ] `.env.local` 文件 **不会被提交到 Git**（已在 `.gitignore` 中）
- [ ] 没有在前端代码中使用这个密钥
- [ ] 没有在 GitHub 上泄露这个密钥
- [ ] 运行了 `node check-env.js` 验证配置成功

---

## 🧪 验证配置

配置完后，运行验证脚本：

```bash
node check-env.js
```

预期输出：
```
✅ 所有环境变量都已配置！
```

---

## 万一密钥泄露了怎么办？

如果你不小心在 GitHub 上提交了这个密钥，或者怀疑被泄露了：

1. **立即在 Supabase 重新生成密钥**
   - Supabase Dashboard → Settings → API
   - 找到 "Regenerate" 或"重新生成"选项
   - 生成新的 service_role key

2. **更新 .env.local** 和 **Vercel 环境变量**
   - 删除旧密钥，使用新密钥

3. **如果密钥已在 Git 中提交**
   - 需要从 Git 历史中删除（使用 `git-filter-branch` 或 BFG）
   - 或联系 GitHub 支持

4. **监控 Supabase 账户**
   - 检查最近的活动日志

---

## 常见问题

### Q: 我看不到 service_role key？

A: 可能的原因：
1. 没有进入 API 页面（检查 Settings 菜单）
2. 需要点击密钥部分的 👁️ 图标来显示隐藏的密钥
3. 你的账户权限不够（需要 Owner 或 Admin）

### Q: 密钥长什么样？

A: Service role key 是一个 JWT 格式的令牌，看起来像：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbHR4Y3JrcWZ3YmpvendyZmhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzQwMjA3NiwiZXhwIjoxODg1MTY4MDc2fQ.xxxxxxxxxxxxxxxxxxx
```

### Q: 和 anon public key 有什么区别？

A:
| 密钥 | 用途 | 位置 |
|-----|------|------|
| **anon public key** | 前端直连，受 RLS 保护 | `VITE_SUPABASE_PUBLISHABLE_KEY` |
| **service_role key** | 后端操作，绕过 RLS | `SUPABASE_SERVICE_ROLE_KEY` |

### Q: 为什么不能在前端使用 service_role key？

A: 因为它拥有完全的数据库访问权限，会绕过 RLS（Row Level Security）安全策略。如果在前端暴露，任何用户都可以访问其他用户的数据。

---

现在去 Supabase 官网获取真实的密钥吧！👍
