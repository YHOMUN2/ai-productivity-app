# ✅ Supabase 连接诊断 - 完整清单

> 按照此清单逐步操作，确保你的应用正确连接到 Supabase 的 profiles 表

---

## 🔴 阶段 1: 密钥配置检查（最常见的问题！）

### 任务 1.1: 检查 .env.local 密钥

你当前的 `.env.local` 显示：
```
VITE_SUPABASE_URL=https://ydltxcrkqfwbjzjvrfhp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_KlP5WpQctFVonFa_Z-9Yuw_uNHD6gie
```

⚠️ **问题**：`VITE_SUPABASE_ANON_KEY` 看起来不是标准的 Anon Key 格式！

### 任务 1.2: 从 Supabase 获取正确的 Anon Key

**操作步骤**：

1. 打开 Supabase 仪表板：https://supabase.com/dashboard
2. 找到项目并进入
3. 点击 **Settings** (左侧菜单最下面)
4. 点击 **API**
5. 在 "Anon (public) key" 下，点击 **Copy** 按钮

你会看到类似这样的密钥：
```
sb_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**长度应该是**：`sb_` 开头 + 40+ 个随机字符

### 任务 1.3: 更新 .env.local

用记事本或 VS Code 打开 `f:\Tool\ai-productivity-app\.env.local`：

```dotenv
VITE_SUPABASE_URL=https://ydltxcrkqfwbjzjvrfhp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_粘贴你从Supabase复制的密钥
```

**示例**（不是真实密钥）：
```dotenv
VITE_SUPABASE_URL=https://ydltxcrkqfwbjzjvrfhp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_7e8c9d0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p
```

✅ **保存文件**

### 任务 1.4: 重启开发服务器

```bash
# 在终端中
npm run dev
```

等待看到：
```
  Local:     http://localhost:5173/
```

---

## 🟡 阶段 2: 邮箱验证设置检查

你收到 "Email not confirmed" 错误，需要检查设置。

### 任务 2.1: 检查邮箱确认是否启用

**操作步骤**：

1. Supabase 仪表板
2. 点击左侧 **Authentication** (认证)
3. 点击 **Providers** (提供程序)
4. 找到 **Email** 选项
5. 查看是否有这样的设置：
   - ✅ "Confirm email" 已启用？
   - ✅ "Require email confirmation before signing in" 已启用？

### 任务 2.2: 选择修复方案

**方案 A：禁用邮箱确认（推荐用于开发）**

1. 点击 Email 的 **Edit** 或齿轮图标
2. 找到 "Confirm email" 或类似选项
3. 关闭（Toggle OFF）
4. 点击 **Save**

这样注册后就无需验证邮箱，可以直接登录。

**方案 B：添加测试邮箱（测试邮箱方案）**

1. 点击 Email 的 **Edit**
2. 找到 "Testing" 或 "Test email" 部分
3. 添加你的测试邮箱：`your-email@example.com`
4. 点击 **Add**

然后使用这个测试邮箱进行注册，会自动验证。

**方案 C：配置实际邮件服务（生产环境）**

1. 配置 SMTP 或使用邮件服务（Resend、SendGrid 等）
2. 用户会收到验证邮件
3. 点击邮件中的链接验证

**推荐**：开发阶段使用 **方案 A**（禁用邮箱确认）

### 任务 2.3: 清除浏览器缓存

1. 打开应用 http://localhost:5173
2. 按 **F12** 打开开发者工具
3. 右键点击刷新按钮，选择 "Empty cache and hard refresh"
4. 或点击 **Storage** → **Clear Site Data**

---

## 🟢 阶段 3: 应用连接测试

### 任务 3.1: 验证环境变量加载正确

1. 打开应用 http://localhost:5173
2. 按 **F12** 打开开发者工具
3. 点击 **Console** 选项卡
4. 复制并执行此代码：

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**预期输出**：
```
URL: https://ydltxcrkqfwbjzjvrfhp.supabase.co
Key: sb_xxxx...（不应该是 sb_publishable）
```

❌ **如果 Key 显示 undefined** → 重启开发服务器

### 任务 3.2: 测试 Supabase 客户端连接

在浏览器控制台执行：

```javascript
import supabase from '@/lib/supabaseClient.js';
console.log('Supabase client ready:', !!supabase);
```

**预期输出**：
```
Supabase client ready: true
```

### 任务 3.3: 测试 profiles 表查询

在浏览器控制台执行：

```javascript
import supabase from '@/lib/supabaseClient.js';

const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

console.log('Profiles query:', { data, error });
```

**预期输出 - 如果 profiles 表已创建**：
```
Profiles query: { 
  data: [ /* 用户记录 */ ], 
  error: null 
}
```

**预期输出 - 如果 profiles 表不存在**：
```
Profiles query: { 
  data: null, 
  error: { 
    code: '42P01',  // undefined relation
    message: 'relation "public.profiles" does not exist'
  }
}
```

---

## 🔵 阶段 4: 完整注册-登录流程测试

### 任务 4.1: 测试注册流程

1. 打开应用 `http://localhost:5173`
2. 点击 **"还没有账户？立即注册"**
3. 填写表单：
   - 用户名：`testuser-${Date.now()}` (例如 `testuser-1701234567`)
   - 邮箱：`test-${Date.now()}@example.com` (例如 `test-1701234567@example.com`)
   - 密码：`Test123456!`
   - 确认密码：`Test123456!`
   - 同意条款：✅ 勾选
4. 点击 **"创建账户"**

**预期结果**：
- ✅ 页面显示 "✅ 注册成功！正在跳转..."
- ✅ 500ms 后自动跳转到登录页
- ❌ 如果显示错误，记录错误信息

### 任务 4.2: 验证 Supabase 中的数据

打开 Supabase 仪表板，检查：

**检查 1: auth.users 表**
1. 点击 **Authentication** (认证)
2. 点击 **Users** (用户)
3. 应该看到你刚注册的用户
4. 点击该用户，检查：
   - Email: ✅ 正确的邮箱
   - Metadata: ✅ 包含 `full_name` 字段
   - Status: ✅ Active（活跃）

**检查 2: profiles 表**
1. 点击 **SQL Editor**
2. 执行查询：
```sql
SELECT * FROM profiles 
WHERE email = 'test-xxx@example.com';  -- 用你的测试邮箱替换
```

**预期结果**：
```
id      | name           | email                | created_at
--------|----------------|----------------------|----------
uuid... | testuser-xxx   | test-xxx@example.com | 2024-01-01
```

- ✅ `id` 匹配 auth.users.id
- ✅ `name` 是你输入的用户名
- ✅ `email` 是你输入的邮箱

### 任务 4.3: 测试登录流程

1. 保持在登录页 `http://localhost:5173/login`
2. 输入：
   - 邮箱：你刚注册的邮箱
   - 密码：你设置的密码
3. 点击 **"登录"**

**预期结果**：
- ✅ 页面显示 "✅ 登录成功！"
- ✅ 500ms 后自动跳转到首页
- ✅ 右上角显示用户菜单 "👤 你的用户名"
- ❌ 如果错误，记录错误信息

**可能的错误及解决**：

| 错误 | 原因 | 解决 |
|------|------|------|
| Email not confirmed | 启用了邮箱验证 | 禁用邮箱验证或使用测试邮箱 |
| Invalid login credentials | 邮箱或密码错误 | 检查输入，确保大小写正确 |
| 用户数据不完整 | profiles 表缺少用户 | 检查触发器是否执行 |

### 任务 4.4: 测试登出

1. 点击右上角用户菜单
2. 点击 **"退出登录"**

**预期结果**：
- ✅ 用户菜单消失
- ✅ 右上角显示 "登录" 按钮
- ✅ 自动跳转到登录页

---

## 🟣 阶段 5: 浏览器控制台完整诊断

如果上面的步骤有任何失败，运行完整诊断：

在浏览器控制台执行：

```javascript
// === Supabase 完整诊断 ===

import supabase from '@/lib/supabaseClient.js';

console.log('=== 环境配置 ===');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key (前 20 字符):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

console.log('\n=== 认证状态 ===');
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session ? '✅ 已登录' : '❌ 未登录');
if (session?.user) {
  console.log('  - User ID:', session.user.id);
  console.log('  - Email:', session.user.email);
}

console.log('\n=== profiles 表查询 ===');
const { data: profiles, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .limit(3);
console.log('结果:', profiles ? `✅ 找到 ${profiles.length} 条记录` : `❌ 错误: ${profileError?.message}`);
if (profiles?.length) {
  console.log('样本数据:', profiles[0]);
}

console.log('\n=== auth.users 查询 ===');
const { data: users, error: userError } = await supabase
  .from('auth.users')
  .select('*')
  .limit(3);
console.log('结果:', users ? `✅ 找到 ${users.length} 条用户` : `❌ 错误: ${userError?.message}`);

console.log('\n=== 触发器检查 ===');
const { data: triggers, error: triggerError } = await supabase
  .rpc('get_triggers');  // 如果你创建了 RPC 函数
console.log('触发器:', triggers || '需要手动在 SQL Editor 检查');

console.log('\n=== 诊断完成 ===');
```

**记录输出结果**，这会帮助排查问题。

---

## 📋 快速检查清单

在继续之前，确认以下项目：

- [ ] ✅ .env.local 中的 ANON_KEY 已更新为正确的 key（从 Supabase Settings → API 复制）
- [ ] ✅ 开发服务器已重启（npm run dev）
- [ ] ✅ 浏览器缓存已清除（F12 → Storage → Clear Site Data）
- [ ] ✅ 邮箱验证设置已检查（禁用或添加测试邮箱）
- [ ] ✅ Supabase 仪表板中可以看到 auth.users 和 profiles 表
- [ ] ✅ 在浏览器控制台能成功加载 Supabase 客户端
- [ ] ✅ 能查询 profiles 表（即使为空）

---

## 📞 如果仍有问题

请收集以下信息并告诉我：

1. 最新的 .env.local 内容（隐藏密钥最后部分）
2. 浏览器控制台的完整错误信息
3. Supabase SQL Editor 执行此查询的结果：
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name IN ('profiles', 'instruments');
   ```
4. 是否看到 profiles 表在 Supabase Editor 中

---

**下一步**：完成这些步骤后，你的应用应该能正常连接到 Supabase 的 profiles 表了！

