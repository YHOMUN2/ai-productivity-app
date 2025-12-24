# 🔍 Supabase 连接诊断指南 - 一步步操作

## 问题诊断

你收到的错误是：
```
❌ Email not confirmed (邮箱未验证)
```

这有两种可能：

1. **Supabase 项目配置中启用了邮箱验证** → 用户注册后需要验证邮箱才能登录
2. **ANON_KEY 不正确** → 导致连接失败

让我们逐步诊断问题。

---

## 📋 诊断步骤

### 步骤 1️⃣ : 获取正确的 Supabase 密钥

#### 1.1 进入 Supabase 控制台

1. 打开 https://supabase.com/dashboard
2. 找到你的项目：`ai-productivity-app`
3. 点击项目进入

#### 1.2 获取 API 密钥

1. 点击左侧 **Settings** (设置)
2. 点击 **API** 选项
3. 你应该看到以下信息：

```
Project URL:      https://ydltxcrkqfwbjzjvrfhp.supabase.co
Anon key:         sb_xxxx...  (这个很重要！)
Service role key: sb_xxxx...  (后端使用，不要放在前端)
```

**⚠️ 关键**：`Anon key` 和 `Service role key` 是不同的！

#### 1.3 复制正确的密钥

- **VITE_SUPABASE_URL** = Project URL
- **VITE_SUPABASE_ANON_KEY** = Anon key （不是 Service role key）

📝 **当前错误**：你的 `.env.local` 中 ANON_KEY 看起来是 publishable key，需要更正。

---

### 步骤 2️⃣ : 更新 .env.local

#### 2.1 打开 .env.local 文件

在 VS Code 中打开：`f:\Tool\ai-productivity-app\.env.local`

#### 2.2 检查内容

```dotenv
VITE_SUPABASE_URL=https://ydltxcrkqfwbjzjvrfhp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_xxxxxx_xxxxxx_xxxxxx
```

⚠️ 如果 `VITE_SUPABASE_ANON_KEY` 以下列任何形式开头，都是**错误的**：
- `sb_publishable_...`
- `eyJ...`
- 或其他不以 `sb_` 后直接跟长字符串的形式

#### 2.3 从 Supabase 复制正确的密钥

1. 进入 Supabase 仪表板 → Settings → API
2. 找到 **Anon key** 部分
3. 点击 **Copy** 复制完整密钥
4. 粘贴到 `.env.local` 的 `VITE_SUPABASE_ANON_KEY` 后面

**完整示例**：
```dotenv
VITE_SUPABASE_URL=https://ydltxcrkqfwbjzjvrfhp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_7e8c9d0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p
```

#### 2.4 保存并重启应用

```bash
# 保存文件后，重启开发服务器
npm run dev
```

---

### 步骤 3️⃣ : 检查 Supabase 邮箱验证设置

#### 3.1 进入认证设置

1. Supabase 仪表板
2. 左侧点击 **Authentication** (认证)
3. 点击 **Providers** (提供程序)

#### 3.2 检查 Email 配置

1. 找到 **Email** 选项
2. 查看是否启用了 **Confirm email**（确认邮箱）

**如果启用了，有两个选择**：

**选项 A：禁用邮箱确认** （开发时推荐）
1. 点击 **Email** 的齿轮图标
2. 找到 **Require email confirmation** 或 **Confirm email**
3. **关闭** 这个选项
4. 点击 **Save** 保存

**选项 B：保持启用，但使用测试邮箱** （生产环保建议）
- 使用 Supabase 提供的测试邮箱
- 或配置实际的邮件服务

#### 3.3 检查邮箱模板

1. 点击 **Email** 的编辑按钮
2. 检查是否有邮件模板配置
3. 确保 `[Confirmation Link]` 指向正确的 URL

---

### 步骤 4️⃣ : 在浏览器中测试连接

#### 4.1 打开浏览器控制台

1. 打开你的应用 `http://localhost:5173`
2. 按 **F12** 打开开发者工具
3. 点击 **Console** 选项卡

#### 4.2 运行诊断代码

复制以下代码到浏览器控制台逐行执行：

```javascript
// ① 检查环境变量是否加载
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**预期结果**：
```
URL: https://ydltxcrkqfwbjzjvrfhp.supabase.co
Key: sb_xxxxxx...（不应该是 sb_publishable）
```

```javascript
// ② 测试 Supabase 客户端
import supabase from '@/lib/supabaseClient.js';
console.log('Supabase client:', supabase);
```

**预期结果**：
```
Supabase client: {auth: {...}, from: (...), ...}
```

```javascript
// ③ 测试 profiles 表连接
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log('Profiles 表查询:', { data, error });
```

**预期结果**：
- ✅ `data` 返回数组（可能为空 `[]`）
- ❌ 如果 `error`，会显示具体错误信息

```javascript
// ④ 测试注册
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: `test-${Date.now()}@example.com`,
  password: 'Test123456!',
  options: {
    data: { full_name: 'Test User' }
  }
});
console.log('注册结果:', { user: signUpData?.user, error: signUpError });
```

**预期结果**：
- ✅ 成功：返回 `user` 对象，含 `id` 和 `email`
- ❌ 邮箱需验证：会有错误提示

```javascript
// ⑤ 检查 profiles 表自动创建（如果注册成功）
if (signUpData?.user) {
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signUpData.user.id)
    .single();
  console.log('Profile:', { data: profileData, error: profileError });
}
```

**预期结果**：
- ✅ 触发器工作：返回 `{ id, name, email, ... }`
- ❌ 触发器未工作：`error.code === 'PGRST116'`（未找到）

---

### 步骤 5️⃣ : 检查 Supabase 中的实际数据

#### 5.1 查看 auth.users 表

1. Supabase 仪表板 → **Authentication** → **Users**
2. 应该看到你注册的用户列表
3. 点击用户，查看详情

**检查项**：
- [ ] 邮箱是否正确
- [ ] `Metadata` 中是否有 `full_name` 字段
- [ ] Email confirmed 状态（是否已验证）

#### 5.2 查看 profiles 表

1. Supabase 仪表板 → **SQL Editor**
2. 执行查询：

```sql
-- 查看所有 profiles
SELECT * FROM profiles;

-- 或查看特定用户
SELECT * FROM profiles WHERE email = 'your-email@example.com';
```

**检查项**：
- [ ] profiles 表是否存在
- [ ] 是否有用户记录
- [ ] `name` 字段是否被正确填充
- [ ] `created_at` 时间戳是否正确

#### 5.3 检查触发器是否执行

```sql
-- 查看触发器是否存在
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public' AND event_object_table = 'auth.users';

-- 应该看到：on_auth_user_created
```

#### 5.4 检查触发器函数

```sql
-- 查看触发器函数
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- 应该看到函数代码，检查 INSERT INTO profiles 语句
```

---

## 🔧 常见问题修复

### 问题 1: ANON_KEY 错误

**症状**：
- 400 Bad Request
- "Invalid API key" 错误

**修复**：
1. 确保 `VITE_SUPABASE_ANON_KEY` 从 Supabase Settings → API 复制
2. 不要使用 Service Role Key
3. 不要使用 publishable key

### 问题 2: Email not confirmed

**症状**：
```
❌ Email not confirmed
```

**修复方案 A - 禁用邮箱验证（开发环境）**：
1. Supabase → Authentication → Providers → Email
2. 关闭 **Confirm email**
3. 重新注册测试用户

**修复方案 B - 使用验证的邮箱（测试邮箱）**：
1. 在 Supabase 的 Email → Testing 中添加测试邮箱
2. 使用测试邮箱进行注册和登录

**修复方案 C - 生产环境中启用真实邮件**：
1. 配置 SMTP 或第三方邮件服务
2. 用户会收到验证邮件
3. 点击邮件中的链接验证

### 问题 3: profiles 表触发器未执行

**症状**：
- 注册成功，但 profiles 表中没有数据
- 登录报错 "用户数据不完整"

**修复**：
1. 检查触发器函数是否存在
2. 检查触发器是否启用
3. 重新创建触发器（从 [PROFILES_TABLE_SETUP.md](./PROFILES_TABLE_SETUP.md) 复制 SQL）

### 问题 4: 无法连接到 Supabase

**症状**：
- 所有请求都失败
- "Failed to fetch" 错误

**检查清单**：
- [ ] `VITE_SUPABASE_URL` 正确
- [ ] `VITE_SUPABASE_ANON_KEY` 正确
- [ ] 网络连接正常
- [ ] Supabase 项目状态正常（不在维护中）

---

## ✅ 完整测试流程（推荐）

一旦配置正确，按此流程验证：

### 1. 清除浏览器数据
```
F12 → Storage → Clear Site Data
```

### 2. 重启开发服务器
```bash
npm run dev
```

### 3. 打开应用
```
http://localhost:5173
```

### 4. 测试注册
- 点击 "立即注册"
- 填写表单：
  - 用户名：`testuser001`
  - 邮箱：`testuser001@example.com`
  - 密码：`Test123456!`
- 点击 "创建账户"

**预期**：
- ✅ 显示 "注册成功！正在跳转..."
- ✅ 自动跳转到登录页

### 5. 验证 Supabase 数据
在 Supabase console 检查：
- ✅ auth.users 中有该用户
- ✅ profiles 表中有该用户记录
- ✅ profile.name = "testuser001"

### 6. 测试登录
- 输入邮箱：`testuser001@example.com`
- 输入密码：`Test123456!`
- 点击 "登录"

**预期**：
- ✅ 显示 "登录成功！"
- ✅ 自动跳转到首页
- ✅ 显示用户菜单 "👤 testuser001"

### 7. 测试退出
- 点击用户菜单
- 点击 "退出登录"

**预期**：
- ✅ 用户菜单消失
- ✅ 显示 "登录" 按钮
- ✅ 跳转到登录页

---

## 📊 诊断信息收集表

运行以下命令并记录结果，用于问题排查：

```bash
# 1. 检查 .env.local 中的 URL（不要泄露完整的 key）
echo "URL: $(grep VITE_SUPABASE_URL .env.local)"

# 2. 检查应用版本
npm list @supabase/supabase-js

# 3. 检查 Node 版本
node --version
```

**记录**：
```
URL: https://ydltxcrkqfwbjzjvrfhp.supabase.co
@supabase/supabase-js: v2.x.x
Node: v18.x.x
```

---

## 🆘 如果以上都检查了仍有问题

请运行以下代码并记录输出：

```javascript
// 在浏览器 console 中执行
import supabase from '@/lib/supabaseClient.js';

// 完整诊断
console.log('=== 诊断信息 ===');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key 开头:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

const { data: session } = await supabase.auth.getSession();
console.log('当前 Session:', session);

const { data: profiles, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .limit(5);
console.log('Profiles 表:', { 行数: profiles?.length, 错误: profileError });

const { data: auth, error: authError } = await supabase
  .from('auth.users')
  .select('*')
  .limit(5);
console.log('Auth.users 表:', { 行数: auth?.length, 错误: authError });
```

将输出结果复制下来，用于进一步诊断。

---

## 📞 获取帮助

如果以上步骤都完成了但仍有问题，请提供：

1. ✅ Supabase Project URL（不要泄露密钥）
2. ✅ 浏览器控制台的完整错误信息
3. ✅ `npm run dev` 的启动日志
4. ✅ Supabase 中 profiles 表的 DDL（SQL 结构）
5. ✅ 触发器函数的代码

---

**提示**：所有敏感信息（API Key）不要分享给任何人！

