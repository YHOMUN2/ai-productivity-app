# Supabase Profiles 认证流程完整测试指南

## 前置条件检查

在开始测试之前，请确保以下条件已满足：

### ✅ 环境配置

```bash
# 1. 检查 .env.local 文件是否存在且配置正确
- VITE_SUPABASE_URL=https://your-project.supabase.co
- VITE_SUPABASE_ANON_KEY=your-anon-key
```

### ✅ 数据库设置

检查 Supabase 控制台中是否完成：
- [ ] `public.profiles` 表已创建
- [ ] 触发器函数 `handle_new_user()` 已创建
- [ ] 触发器 `on_auth_user_created` 已创建
- [ ] RLS 策略已配置

### ✅ 代码更新

检查是否完成：
- [ ] `src/api/supabase.js` - signUp/signIn 已更新
- [ ] `src/stores/user.js` - register/login 已更新
- [ ] `src/pages/Register.vue` - name 字段已添加

## 测试流程

### 测试 1：应用启动检查

**目标**：确保应用正常启动，Supabase 客户端初始化成功

**步骤**：

1. 打开终端，运行开发服务器：
   ```bash
   npm run dev
   ```

2. 在浏览器中打开 `http://localhost:5173`

3. 打开浏览器开发者工具（F12）→ **Console** 选项卡

4. **预期输出**（应该看到以下日志）：
   ```
   ✅ Supabase 客户端已初始化
   ```

5. **故障排查**（如果看到错误）：
   ```
   ❌ 错误：未找到 Supabase 环境变量
   ```
   → 检查 `.env.local` 文件是否存在且配置正确

---

### 测试 2：注册流程

**目标**：创建新用户并验证 profiles 表自动填充

#### 步骤 2.1：打开注册页面

1. 点击首页的 "还没有账户？立即注册" 链接
2. 或直接访问 `http://localhost:5173/register`

#### 步骤 2.2：填写注册表单

```
用户名：test-user-001
邮箱：testuser001@example.com
密码：Test123456!
确认密码：Test123456!
同意条款：✅ 勾选
```

**关键点**：
- 用户名：2-20 个字符
- 邮箱：有效的邮箱格式
- 密码：至少 6 个字符
- 两次密码必须一致

#### 步骤 2.3：提交表单

1. 点击 "创建账户" 按钮
2. 观察控制台日志（F12 → Console）

**预期输出**：
```
📝 尝试注册: testuser001@example.com
✅ 注册成功
```

**预期 UI 反应**：
```
✅ "注册成功！正在跳转..."
```

#### 步骤 2.4：验证 profiles 表创建

1. 进入 Supabase 控制台
2. 点击 **Editor** → **public** → **profiles** 表
3. 查找邮箱为 `testuser001@example.com` 的记录

**预期数据**：
```json
{
  "id": "uuid-string",
  "name": "test-user-001",
  "email": "testuser001@example.com",
  "created_at": "2024-01-01T12:00:00+00:00",
  "updated_at": "2024-01-01T12:00:00+00:00"
}
```

**故障排查**：
- ❌ 找不到用户记录 → 触发器未执行，检查 `handle_new_user()` 函数
- ❌ name 字段为空 → full_name metadata 未正确传递
- ❌ email 不匹配 → 查看 auth.users 表是否有该用户

#### 步骤 2.5：检查 auth.users 表（可选）

1. 在 Supabase 控制台点击 **Authentication** → **Users**
2. 查找刚注册的用户
3. 点击用户，查看 **Metadata** 选项卡

**预期 Metadata**：
```json
{
  "full_name": "test-user-001"
}
```

---

### 测试 3：登录流程

**目标**：验证登录时自动查询并验证 profiles 数据

#### 步骤 3.1：打开登录页面

1. 注册完成后应自动重定向到登录页
2. 或手动访问 `http://localhost:5173/login`

#### 步骤 3.2：输入登录凭证

```
邮箱：testuser001@example.com
密码：Test123456!
```

#### 步骤 3.3：提交登录表单

1. 点击 "登录" 按钮
2. 观察控制台日志（F12 → Console）

**预期输出**：
```
🔐 尝试登录: testuser001@example.com
✅ Auth 登录成功，user.id: uuid-string
✅ 登录成功，profiles 信息: {...}
```

**预期 UI 反应**：
```
✅ "登录成功！"
(应自动跳转到首页)
```

#### 步骤 3.4：验证用户状态

1. 登录成功后，检查应用顶部的用户菜单
2. 应显示用户名（来自 profiles 表）

**预期显示**：
```
👤 test-user-001
```

**故障排查**：
- ❌ "用户数据不完整，无法登录" → profiles 表中找不到用户记录
  - 解决：重新注册，确保触发器执行
  
- ❌ "邮箱或密码错误" → 凭证不匹配
  - 解决：确认邮箱和密码输入正确
  
- ❌ 登录成功但没有显示用户名 → profile 数据未正确存储
  - 解决：检查 Supabase console 中 profiles 表的数据

---

### 测试 4：错误处理验证

**目标**：验证各种错误情况下的正确处理

#### 测试 4.1：邮箱已注册

**步骤**：
1. 尝试用已存在的邮箱再次注册
2. 期望错误：`该邮箱已被注册，请直接登录或使用其他邮箱`

#### 测试 4.2：密码格式错误

**步骤**：
1. 尝试注册时使用过短的密码（<6 字符）
2. 期望错误：`密码不符合要求，请使用至少 6 个字符的密码`

#### 测试 4.3：用户名验证

**步骤**：
1. 尝试用过短的用户名（<2 字符）
2. 期望错误：`用户名长度 2-20 个字符`

#### 测试 4.4：登录凭证错误

**步骤**：
1. 尝试用错误的密码登录
2. 期望错误：`邮箱或密码错误，请检查后重试`

#### 测试 4.5：profiles 数据不完整

**步骤**（需要手动数据库操作）：
1. 在 auth.users 表中直接创建用户（不通过应用）
2. 尝试登录该用户
3. 期望错误：`用户数据不完整，无法登录。请联系技术支持。`

---

### 测试 5：登出功能

**目标**：验证登出后正确清除用户状态

**步骤**：

1. 成功登录后
2. 点击右上角用户菜单
3. 点击 "退出登录" 按钮

**预期行为**：
```
✅ 用户菜单消失
✅ 重定向到登录页
✅ 页面显示 "还没有账户？立即注册"
```

**验证状态**：
1. 打开开发者工具 Console
2. 检查是否有 "退出登录" 相关的日志

---

### 测试 6：多用户场景

**目标**：验证应用能正确处理多个用户

**步骤**：

1. **创建第一个用户**：
   - 邮箱：user1@example.com
   - 用户名：User One

2. **登出第一个用户**

3. **创建第二个用户**：
   - 邮箱：user2@example.com
   - 用户名：User Two

4. **验证 Supabase console**：
   - 检查 profiles 表中应有两条记录
   - auth.users 表中应有两个用户

5. **分别登录验证**：
   - 用 user1 登录，验证显示 "User One"
   - 登出后用 user2 登录，验证显示 "User Two"

---

## 性能测试

### 测试 7：注册速度

**目标**：验证注册流程的响应时间

**步骤**：

1. 打开浏览器开发者工具 → **Network** 选项卡
2. 填写注册表单并提交
3. 观察网络请求

**预期结果**：
```
POST /auth/v1/signup - ~200-500ms
```

### 测试 8：登录速度

**步骤**：

1. 打开浏览器开发者工具 → **Network** 选项卡
2. 输入登录凭证并提交
3. 观察网络请求

**预期结果**：
```
POST /auth/v1/token - ~200-300ms
GET /rest/v1/profiles - ~100-200ms
总计：~300-500ms
```

---

## 调试技巧

### 查看完整的 Supabase 日志

在浏览器控制台中：

```javascript
// 启用 Supabase 调试模式
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(URL, KEY, {
  debug: true
});
```

### 检查存储的用户数据

```javascript
// 在浏览器控制台中运行
const userStore = useUserStore();
console.log('用户信息:', userStore.user);
console.log('Profile 信息:', userStore.profile);
console.log('登录状态:', userStore.isLoggedIn);
```

### 查看 Pinia 状态

1. 使用 Vue DevTools 扩展（如果已安装）
2. 打开 **Vue** 选项卡
3. 查看 **Pinia** 中的 user store 状态

### 手动测试 API 函数

```javascript
// 在浏览器控制台中测试
import { signUp, signIn } from '@/api/supabase';

// 测试注册
const signUpResult = await signUp({
  email: 'test@example.com',
  password: 'Test123456!',
  name: 'Test User'
});
console.log('注册结果:', signUpResult);

// 测试登录
const signInResult = await signIn({
  email: 'test@example.com',
  password: 'Test123456!'
});
console.log('登录结果:', signInResult);
```

---

## 检查清单

在认为测试完成前，请确保所有项目都已验证：

### 基础功能
- [ ] 应用启动时 Supabase 客户端初始化成功
- [ ] 注册表单能接收和验证用户名
- [ ] 注册成功后 profiles 表自动创建记录
- [ ] 登录时能查询 profiles 表并验证数据
- [ ] 登出功能正常工作
- [ ] 多用户场景下数据正确隔离

### 错误处理
- [ ] 邮箱已注册时显示正确错误信息
- [ ] 密码过短时显示正确错误信息
- [ ] 用户名长度错误时显示正确错误信息
- [ ] 登录凭证错误时显示正确错误信息
- [ ] profiles 数据不完整时显示警告

### 数据完整性
- [ ] auth.users 表有用户记录
- [ ] profiles 表有对应用户记录
- [ ] 用户名正确存储在 profiles.name
- [ ] 邮箱正确存储在 profiles.email
- [ ] 创建和更新时间戳正确

### UI/UX
- [ ] 注册页面显示 name 输入字段
- [ ] 登录成功后显示用户名
- [ ] 错误信息清晰易懂
- [ ] 加载状态正确显示
- [ ] 重定向逻辑正常工作

---

## 常见问题解决

### Q: 触发器不工作，profiles 表没有创建记录

**检查步骤**：

1. 确认触发器存在：
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_schema = 'public' AND event_object_table = 'auth.users';
   ```

2. 检查触发器函数：
   ```sql
   SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. 查看 auth.users 表中是否有新用户：
   ```sql
   SELECT id, email, raw_user_meta_data FROM auth.users ORDER BY created_at DESC LIMIT 1;
   ```

4. 手动插入测试：
   ```sql
   INSERT INTO public.profiles (id, email, name)
   SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', email)
   FROM auth.users 
   WHERE email = 'testuser001@example.com'
   ON CONFLICT DO NOTHING;
   ```

### Q: 登录时出现 "PGRST116" 错误

**解决**：
- 这个错误表示 profiles 表中找不到用户记录
- 手动在 Supabase console 中验证 profiles 表是否有该用户
- 如果没有，手动插入或重新注册

### Q: 前端无法连接到 Supabase

**检查**：
1. `.env.local` 文件中的 URL 和 Key 是否正确
2. Supabase 项目是否处于活跃状态
3. 网络连接是否正常
4. 浏览器控制台是否有 CORS 错误

---

## 下一步

完成所有测试后：

1. ✅ 提交代码变更
2. 🔲 配置邮件验证（如果需要）
3. 🔲 配置密码重置流程
4. 🔲 添加用户信息编辑功能
5. 🔲 配置社交登录（Google、GitHub 等）

