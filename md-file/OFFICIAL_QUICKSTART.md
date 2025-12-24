# ⚡ Supabase + Vue 快速开始指南（官方配置）

> 基于官方文档：https://supabase.com/docs/guides/getting-started/quickstarts/vue

## 📋 当前状态

| 组件 | 状态 | 操作 |
|------|------|------|
| 应用框架 | ✅ Vue 3 | 已完成 |
| Supabase 客户端 | ✅ 已安装 | 已完成 |
| 环境变量 | ⏳ 需配置 | **接下来**  |
| 邮箱验证 | ⏳ 需禁用 | **接下来** |
| 数据库 (profiles) | ✅ 已创建 | 已完成 |
| 触发器 | ✅ 已创建 | 已完成 |

---

## 🚀 快速开始（5 分钟）

### 第 1 步：验证环境配置

你的 `.env.local` 应该是这样的：

```dotenv
VITE_SUPABASE_URL=https://ydltxcrkqfwbjzjvrfhp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_KlP5WpQctFVonFa_Z-9Yuw_uNHD6gie
```

✅ **状态**：已正确配置（根据官方文档）

### 第 2 步：禁用邮箱验证

这是导致你 "Email not confirmed" 错误的原因。

**快速步骤**：
1. 打开 https://supabase.com/dashboard
2. 进入你的项目
3. **Authentication** → **Providers** → **Email**
4. 点击 **Edit** 或齿轮图标
5. 关闭 "Confirm email" 选项
6. 点击 **Save**

详细步骤：[DISABLE_EMAIL_VERIFICATION.md](./DISABLE_EMAIL_VERIFICATION.md)

### 第 3 步：重启开发服务器

```bash
# 关闭当前服务器（Ctrl+C）
# 清除缓存
npm run dev
```

### 第 4 步：测试注册和登录

1. 打开 http://localhost:5173
2. 点击 "立即注册"
3. 填写表单：
   - 用户名：`testuser`
   - 邮箱：`test@example.com`
   - 密码：`Test123456!`
4. 点击 "创建账户"

**预期结果**：
- ✅ "注册成功！正在跳转..."
- ✅ 跳转到登录页
- ✅ 用相同邮箱和密码登录
- ✅ 看到用户菜单 "👤 testuser"

---

## 📝 代码配置说明

### 官方推荐的环境变量

根据官方文档，只需要两个环境变量：

```dotenv
VITE_SUPABASE_URL=<your-project-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

**注意**：
- ✅ 使用 `PUBLISHABLE_KEY`（新标准）
- ❌ 不需要 `ANON_KEY`（旧标准）
- ❌ 不需要 `SERVICE_ROLE_KEY`（后端专用）

### 客户端初始化

你的 `src/lib/supabaseClient.js` 已经是正确的官方格式：

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
```

✅ **已更新**：所有 API 文件都使用 `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 🔧 完整的认证流程

### 注册流程

```
用户填写表单
  ↓
Register.vue handleRegister()
  ↓
userStore.register(credentials)
  ↓
supabase.js signUp()
  ↓
Auth Service 创建 auth.users 记录
  ↓
🔥 数据库触发器 handle_new_user()
  ↓
自动在 profiles 表创建用户记录
  ↓
✅ 显示 "注册成功"
```

### 登录流程

```
用户输入邮箱和密码
  ↓
Login.vue handleLogin()
  ↓
userStore.login(credentials)
  ↓
supabase.js signIn()
  ↓
Auth Service 验证凭证
  ↓
查询 profiles 表验证数据完整性
  ↓
✅ 返回用户和 profile 数据
  ↓
保存到 Pinia store
  ↓
显示用户菜单和用户名
```

---

## ✅ 验证连接（浏览器控制台）

打开应用，按 F12，在 Console 中执行：

```javascript
// 1. 检查环境变量
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
```

**预期输出**：
```
URL: https://ydltxcrkqfwbjzjvrfhp.supabase.co
Key: sb_publishable_KlP5WpQctFVonFa_Z-9Yuw_uNHD6gie
```

```javascript
// 2. 测试客户端连接
import supabase from '@/lib/supabaseClient.js';
console.log('Supabase ready:', !!supabase);
```

**预期输出**：
```
Supabase ready: true
```

```javascript
// 3. 测试 profiles 表
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log('Profiles:', { data, error });
```

**预期输出**（如果 profiles 表存在）：
```
Profiles: { data: [...], error: null }
```

---

## 📚 重要文档

| 文档 | 用途 |
|------|------|
| [DISABLE_EMAIL_VERIFICATION.md](./DISABLE_EMAIL_VERIFICATION.md) | 禁用邮箱验证（解决 "Email not confirmed" 错误） |
| [SUPABASE_CONNECT_CHECKLIST.md](./SUPABASE_CONNECT_CHECKLIST.md) | 完整的连接验证清单 |
| [PROFILES_TABLE_SETUP.md](./PROFILES_TABLE_SETUP.md) | profiles 表和触发器设置 |
| [SUPABASE_TROUBLESHOOTING.md](./SUPABASE_TROUBLESHOOTING.md) | 故障排查指南 |

---

## 🐛 常见问题

### Q: 仍然收到 "Email not confirmed" 错误

**原因**：邮箱验证仍然启用

**解决**：
1. 再次进入 Supabase Dashboard
2. Authentication → Providers → Email
3. 确保 "Confirm email" 是关闭的（OFF）
4. 重启开发服务器
5. 清除浏览器缓存（F12 → Storage → Clear Site Data）

### Q: 注册成功但 profiles 表没有数据

**原因**：触发器未执行

**解决**：
1. 检查触发器是否存在：
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```
2. 如果不存在，从 [PROFILES_TABLE_SETUP.md](./PROFILES_TABLE_SETUP.md) 复制 SQL 重新创建

### Q: 如何验证密钥是否正确

在浏览器控制台中：

```javascript
import supabase from '@/lib/supabaseClient.js';

// 如果能成功查询，说明密钥正确
const { data, error } = await supabase.from('profiles').select('*').limit(1);
if (error) {
  console.log('❌ 密钥或连接错误:', error);
} else {
  console.log('✅ 密钥正确，连接成功');
}
```

---

## 🎯 下一步

### 立即做

- [ ] 禁用邮箱验证（5 分钟）
- [ ] 重启开发服务器
- [ ] 测试注册和登录

### 完成验证后（可选）

- [ ] 添加邮箱验证（生产环境推荐）
- [ ] 配置密码重置功能
- [ ] 添加用户信息编辑页面
- [ ] 配置社交登录（Google、GitHub 等）

---

## 📖 官方资源

- 📚 [Supabase Vue Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/vue)
- 📚 [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- 📚 [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)

---

## 💡 提示

**为开发节省时间**：
```javascript
// 在浏览器控制台中快速测试注册
import { signUp } from '@/api/supabase.js';
const result = await signUp({
  email: `test-${Date.now()}@example.com`,
  password: 'Test123456!',
  name: 'Test User'
});
console.log(result);
```

---

**现在开始吧！** 🚀

1. 禁用邮箱验证
2. 重启开发服务器
3. 测试注册和登录
4. 享受使用 Supabase + Vue！

如有问题，参考 [SUPABASE_TROUBLESHOOTING.md](./SUPABASE_TROUBLESHOOTING.md)

