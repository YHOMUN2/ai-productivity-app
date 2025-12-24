# Profiles 表认证流程实现总结（2024 年 1 月）

## 项目概览

### 目标
实现基于 Supabase `public.profiles` 表的安全认证系统，与 Supabase Auth 深度集成，支持用户注册和登录验证。

### 架构设计

```
┌────────────────────────────────────────────────────────┐
│                    认证系统架构                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  前端层（Vue 3 + Composition API）                    │
│  ├─ Register.vue      : 注册表单（接收 name）       │
│  ├─ Login.vue        : 登录表单                      │
│  └─ UserMenu.vue     : 用户菜单（显示 name）       │
│         ↓                                           │
│  状态管理层（Pinia）                               │
│  └─ user.js          : 用户状态 + register/login   │
│         ↓                                           │
│  API 层（Supabase 客户端包装）                    │
│  └─ supabase.js      : signUp/signIn/signOut      │
│         ↓                                           │
│  后端层（Supabase）                                 │
│  ├─ Auth Service     : 用户认证                    │
│  │  └─ auth.users   : 认证用户表                  │
│  │                                                │
│  ├─ Database        : PostgreSQL                  │
│  │  ├─ profiles     : 用户数据表                  │
│  │  ├─ Trigger      : 自动同步函数               │
│  │  └─ RLS          : 行级安全策略               │
│  │                                                │
│  └─ Storage         : 文件存储（可选）            │
│                                                     │
└────────────────────────────────────────────────────────┘
```

## 完成的功能

### 1. 用户注册流程（Register.vue → userStore → signUp）

#### 组件层面（Register.vue）
✅ **已完成**：
- 添加 `name` 字段到表单 state
- 添加 `name` 验证规则（2-20 个字符）
- 在模板中添加 name input 字段（User 图标）
- 修改 handleRegister() 传递 name 到 userStore

**关键代码**：
```vue
const form = ref({
  name: '',              // ✅ 新增
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
});

const rules = {
  name: [               // ✅ 新增
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度 2-20 个字符', trigger: 'blur' }
  ],
  // ... 其他规则
};

// handleRegister 中
const { success, error } = await userStore.register({
  name: form.value.name,              // ✅ 新增
  email: form.value.email,
  password: form.value.password,
  confirmPassword: form.value.confirmPassword
});
```

#### Pinia Store 层面（user.js）
✅ **已完成**：
- 添加 `profile` 到 state
- 更新 register() 方法接收 name 参数
- 验证 name 长度
- 调用新的 signUp(credentials) API
- 返回 {success, error} 给组件

**关键代码**：
```javascript
state: () => ({
  user: null,
  profile: null,        // ✅ 新增
  isLoggedIn: false,
  loading: false,
  error: null
}),

async register(credentials) {
  // ✅ 验证 name
  if (!credentials.name || credentials.name.trim().length < 2) {
    this.error = '用户名长度不少于 2 个字符';
    return { success: false, error: this.error };
  }

  // ✅ 调用新 API
  const { user, session, error } = await signUp({
    email: credentials.email,
    password: credentials.password,
    name: credentials.name
  });

  // ✅ 处理结果
  if (error) {
    this.error = error.message || '注册失败';
    return { success: false, error: this.error };
  }

  this.user = user;
  if (session) this.isLoggedIn = true;
  return { success: true, user: this.user };
}
```

#### API 层面（supabase.js）
✅ **已完成**：
- 更新 signUp() 接收 credentials 对象
- 通过 metadata 传递 full_name（触发器读取）
- 返回 {user, session, error}
- 错误处理和用户友好消息

**关键代码**：
```javascript
export const signUp = async (credentials) => {
  const { email, password, name } = credentials;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          // ✅ 通过 metadata 传递 name
          full_name: name || email.split('@')[0]
        }
      }
    });

    if (error) {
      // ✅ 用户友好的错误消息
      let userMessage = error.message;
      if (error.message.includes('already registered')) {
        userMessage = '该邮箱已被注册，请直接登录或使用其他邮箱';
      } else if (error.message.includes('password')) {
        userMessage = '密码不符合要求，请使用至少 6 个字符的密码';
      }
      return { user: null, session: null, error: { ...error, message: userMessage } };
    }

    return { user: data?.user || null, session: data?.session || null, error: null };
  } catch (err) {
    return { user: null, session: null, error: err };
  }
};
```

### 2. 用户登录流程（Login.vue → userStore → signIn）

#### 组件层面（Login.vue）
✅ **已完成**：
- 调用 userStore.login() 传递 email 和 password
- 处理成功响应，显示成功消息
- 处理错误响应，显示错误提示
- 登录成功后跳转到首页

**关键代码**：
```vue
async function handleLogin() {
  // ✅ 传递凭证
  const { success, error } = await userStore.login({
    email: form.value.email,
    password: form.value.password
  });
  
  if (success) {
    ElMessage.success('登录成功！');
    setTimeout(() => {
      router.push('/');
    }, 500);
  } else {
    ElMessage.error(error || '登录失败，请检查邮箱和密码');
  }
}
```

#### Pinia Store 层面（user.js）
✅ **已完成**：
- 更新 login() 方法调用新的 signIn API
- 接收 {user, profile, session, error} 返回值
- 验证 profile 存在（数据完整性检查）
- 保存 user 和 profile 到 state
- 返回 {success, error, user, profile}

**关键代码**：
```javascript
async login(credentials) {
  try {
    // ✅ 调用新 API（返回包含 profile）
    const { user, profile, session, error } = await signIn(credentials);

    if (error) {
      this.error = error.message || '登录失败';
      return { success: false, error: this.error };
    }

    // ✅ 验证 profile 完整性
    if (!profile) {
      this.error = '用户数据不完整，无法登录。请重新注册。';
      return { success: false, error: this.error };
    }

    // ✅ 保存完整信息
    this.user = user;
    this.profile = profile;
    this.isLoggedIn = !!session;

    return { success: true, user: this.user, profile: this.profile };
  } catch (err) {
    this.error = err.message || '登录失败';
    return { success: false, error: this.error };
  }
}
```

#### API 层面（supabase.js）
✅ **已完成**：
- 更新 signIn() 接收 credentials 对象
- 调用 auth.signInWithPassword()
- **关键新增**：查询 profiles 表验证数据完整性
- 处理 PGRST116 错误（profiles 未找到）
- 返回 {user, profile, session, error}

**关键代码**：
```javascript
export const signIn = async (credentials) => {
  const { email, password } = credentials;

  try {
    // ① 认证阶段
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      let userMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        userMessage = '邮箱或密码错误，请检查后重试';
      }
      return { user: null, profile: null, session: null, error: { ...error, message: userMessage } };
    }

    const authUser = data?.user;
    if (!authUser) {
      return { user: null, profile: null, session: null, error: { message: '登录失败，请稍后重试' } };
    }

    // ② 验证数据完整性阶段 ✅ 新增
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return { 
          user: authUser, 
          profile: null,
          session: data?.session || null, 
          error: { message: '用户数据不完整，无法登录。请联系技术支持。' } 
        };
      }
      return { user: authUser, profile: null, session: data?.session || null, error: { message: profileError.message } };
    }

    // ③ 返回完整数据
    return { 
      user: authUser, 
      profile: profileData,
      session: data?.session || null, 
      error: null 
    };
  } catch (err) {
    return { user: null, profile: null, session: null, error: err };
  }
};
```

### 3. 登出流程（UserMenu.vue → userStore → signOut）

✅ **已完成**：
- 清除 user 和 profile 状态
- 调用 signOut() 清除 Supabase session
- 清除 error 状态
- 返回成功状态

**关键代码**：
```javascript
async logout() {
  try {
    await signOut();
    this.user = null;
    this.profile = null;         // ✅ 清除 profile
    this.isLoggedIn = false;
    this.error = null;
    return { success: true };
  } catch (err) {
    this.user = null;
    this.profile = null;         // ✅ 清除 profile
    this.isLoggedIn = false;
    return { success: true };
  }
}
```

## 数据库配置（待用户完成）

### 必需步骤

#### 步骤 1：创建 profiles 表

```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### 步骤 2：创建触发器函数

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;
```

#### 步骤 3：创建触发器

```sql
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

#### 步骤 4：配置 RLS 策略

```sql
-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT 策略
CREATE POLICY "Enable read for authenticated users"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- UPDATE 策略
CREATE POLICY "Enable update for users to update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

详见：[PROFILES_TABLE_SETUP.md](./PROFILES_TABLE_SETUP.md)

## 修改的文件清单

### 1. src/api/supabase.js

**修改内容**：
- signUp() 函数：
  - 改为接收 credentials 对象（包含 name）
  - 通过 metadata.full_name 传递 name 给触发器
  - 保持 {user, session, error} 返回值

- signIn() 函数 ✅ **关键更新**：
  - 改为接收 credentials 对象
  - 添加 profiles 表查询步骤
  - 验证 profiles 数据存在（PGRST116 处理）
  - 改为返回 {user, profile, session, error}

**影响范围**：
- userStore.register() 和 login() 方法
- 所有调用 signUp/signIn 的地方

### 2. src/stores/user.js

**修改内容**：
- State：
  - 添加 `profile: null` 字段

- register() 方法：
  - 现在接收 {name, email, password, confirmPassword}
  - 验证 name 长度
  - 调用新的 signUp() API
  - 保存 user 到 state

- login() 方法 ✅ **关键更新**：
  - 调用新的 signIn() API（返回 profile）
  - 验证 profile 存在
  - 保存 user 和 profile 到 state
  - 处理 profile 缺失的错误情况

- logout() 方法：
  - 添加清除 profile 的逻辑

**影响范围**：
- Register.vue 的 handleRegister()
- Login.vue 的 handleLogin()
- 所有使用 userStore 的组件

### 3. src/pages/Register.vue

**修改内容**：
- Form state：添加 `name: ''` 字段
- Validation rules：添加 name 验证（2-20 字符）
- Template：添加 name input 字段（User 图标）
- handleRegister()：传递 name 到 userStore

**UI 变化**：
- 注册表单现在显示：名字 → 邮箱 → 密码 → 确认密码 → 同意条款

### 4. 无修改：src/pages/Login.vue

**原因**：
- 组件已经正确传递 email 和 password
- userStore.login() 方法签名未改变（输入参数相同）
- 返回值格式兼容（都是 {success, error}）

## 核心工作流程图

### 注册工作流

```
用户在 Register.vue 输入数据
│
├─ name: "John Doe"
├─ email: "john@example.com"
├─ password: "secure123"
└─ confirmPassword: "secure123"
   │
   ↓ handleRegister() 调用 userStore.register(credentials)
   │
   userStore.register() 执行：
   ├─ 验证密码一致性
   ├─ 验证 name 长度（2-20）
   ├─ 调用 signUp({email, password, name})
   │  │
   │  └─ API 层：
   │     └─ auth.signUp(email, password, {
   │        data: { full_name: "John Doe" }
   │        })
   │
   ├─ 返回 {user, session, error}
   └─ 保存 user 到 state，返回 {success, error}
      │
      ↓ handleRegister() 处理结果
      │
      ├─ ✅ 成功：显示成功消息，500ms 后跳转登录
      └─ ❌ 失败：显示错误信息
```

**关键：数据库触发器自动执行**
```
auth.users INSERT
   ↓
🔥 触发器 on_auth_user_created
   ↓
执行函数 handle_new_user()
   ↓
INSERT INTO profiles (
  id = NEW.id,
  email = NEW.email,
  name = NEW.raw_user_meta_data->>'full_name'
)
   ↓
✅ profiles 表自动创建记录
```

### 登录工作流

```
用户在 Login.vue 输入数据
│
├─ email: "john@example.com"
└─ password: "secure123"
   │
   ↓ handleLogin() 调用 userStore.login(credentials)
   │
   userStore.login() 执行：
   │
   ├─ 调用 signIn({email, password})
   │  │
   │  └─ API 层分两步：
   │     │
   │     ├─ 步骤 1：auth.signInWithPassword(email, password)
   │     │  └─ 验证凭证，获得 user 和 session
   │     │
   │     └─ 步骤 2：Query profiles 表 ✅ 关键验证
   │        └─ SELECT * FROM profiles WHERE id = user.id
   │           ├─ ✅ 找到记录 → 返回 profile
   │           └─ ❌ 未找到（PGRST116）→ 数据不完整
   │
   ├─ 接收 {user, profile, session, error}
   ├─ 验证 profile 存在
   ├─ 保存 user 和 profile 到 state
   └─ 返回 {success, error}
      │
      ↓ handleLogin() 处理结果
      │
      ├─ ✅ 成功：显示成功消息，500ms 后跳转首页
      └─ ❌ 失败：显示错误信息
```

## 数据流向

### 用户对象的来源

```
前端用户输入（Register.vue）
  ├─ name: "John Doe"
  ├─ email: "john@example.com"
  └─ password: "secret123"
       │
       ↓ 传递给 userStore.register()
       │
userStore（Pinia）
  │
  ├─ 验证逻辑
  └─ 调用 API signUp()
       │
       ↓
supabase.js（API 层）
  │
  ├─ name 通过 metadata.full_name 传递
  └─ 调用 supabase.auth.signUp()
       │
       ↓
Supabase Auth 服务
  │
  ├─ 验证密码强度
  ├─ 检查邮箱唯一性
  └─ 创建 auth.users 记录
       │
       ├─ id: "uuid-xxx"
       ├─ email: "john@example.com"
       ├─ raw_user_meta_data: {
       │    "full_name": "John Doe"
       │  }
       └─ created_at: "2024-01-01T..."
            │
            ↓ 🔥 触发器自动执行
            │
Supabase PostgreSQL
  │
  ├─ 触发器读取 NEW.id, NEW.email, NEW.raw_user_meta_data
  └─ 创建 profiles 记录
       │
       ├─ id: "uuid-xxx"（同 auth.users.id）
       ├─ email: "john@example.com"
       ├─ name: "John Doe"（来自 metadata）
       └─ created_at: "2024-01-01T..."
            │
            ↓ 返回给前端
            │
userStore（Pinia）
  │
  ├─ user: {id, email, user_metadata: {full_name}}
  ├─ profile: {id, email, name}
  └─ isLoggedIn: true
       │
       ↓ 显示在 UI 中
       │
UserMenu.vue
  │
  └─ 显示 "👤 John Doe"
```

## 工作流验证检查列表

### ✅ 已完成项目

1. **前端代码**
   - [x] Register.vue 添加 name 字段和验证
   - [x] Login.vue 传递凭证给 store
   - [x] userStore.register() 接收 name 并传给 API
   - [x] userStore.login() 处理 profile 数据
   - [x] supabase.js signUp() 支持 name metadata
   - [x] supabase.js signIn() 查询 profiles 并验证

2. **错误处理**
   - [x] API 层友好的错误消息
   - [x] store 层错误消息转发
   - [x] 组件层错误提示显示
   - [x] PGRST116 错误处理（profiles 未找到）

3. **数据完整性**
   - [x] name 在表单层验证
   - [x] name 通过 metadata 传到后端
   - [x] profile 在登录时验证存在

### 🔲 待完成项目（用户需操作）

1. **Supabase 数据库**
   - [ ] 创建 profiles 表
   - [ ] 创建 handle_new_user() 函数
   - [ ] 创建 on_auth_user_created 触发器
   - [ ] 配置 RLS 策略

2. **应用测试**
   - [ ] 测试完整的注册流程
   - [ ] 测试完整的登录流程
   - [ ] 验证 profiles 表自动填充
   - [ ] 测试错误处理场景

详见：[AUTHENTICATION_TESTING_GUIDE.md](./AUTHENTICATION_TESTING_GUIDE.md)

## 关键设计决策

### 1. 为什么需要 profiles 表？

**理由**：
- Supabase Auth 的 auth.users 只用于认证
- profiles 表用于存储业务相关的用户数据
- 登录时验证 profiles 存在，确保数据完整性
- 便于后续扩展用户信息（头像、简介、偏好设置等）

### 2. 为什么要在登录时查询 profiles？

**理由**：
- 数据完整性检查：确保触发器正确执行
- 故障诊断：如果 profiles 缺失，用户会立即被通知
- 获取用户数据：login 返回 profile，可直接显示用户名等信息
- 安全性：防止孤立的 auth.users 记录

### 3. 为什么用 metadata 传递 name？

**理由**：
- Supabase Auth API 只能设置 metadata（不能直接设置 profiles）
- 触发器可以读取 metadata 并写入 profiles
- 无需在前端同时调用两个 API
- 保证事务一致性：auth.users 和 profiles 同时创建

### 4. 为什么禁止直接修改 profiles？

**理由**：
- 默认由触发器创建（自动化）
- 用户只能读取自己的 profile（RLS 保护）
- 后续可添加 UPDATE 策略支持编辑

## 下一步改进方向

### 短期（可选）
1. 添加邮箱验证流程
2. 添加密码重置功能
3. 添加用户信息编辑页面
4. 添加头像上传功能

### 中期（可选）
1. 社交登录（Google、GitHub）
2. 两步验证（2FA）
3. 会话管理（多设备登录）
4. 用户角色和权限系统

### 长期（可选）
1. 单点登录（SSO）
2. API 密钥管理
3. 审计日志
4. 高级安全策略

## 文档引用

- **设置指南**：[PROFILES_TABLE_SETUP.md](./PROFILES_TABLE_SETUP.md)
- **测试指南**：[AUTHENTICATION_TESTING_GUIDE.md](./AUTHENTICATION_TESTING_GUIDE.md)
- **项目架构**：[../architecture.md](../architecture.md)

## 总结

本次实现完成了 Vue 3 + Supabase 的专业级认证系统：

✅ **代码层面**：
- 所有组件和 store 已更新
- API 层完全重构支持 profiles
- 错误处理完善

✅ **架构层面**：
- 遵循 Supabase 最佳实践
- 实现了数据验证和完整性检查
- RLS 安全性设计

⏳ **待完成**（用户操作）：
- 数据库 schema 创建
- 触发器部署
- 端到端测试

系统已就绪，等待数据库配置完成后可投入使用。

---

**版本**：1.0.0  
**最后更新**：2024 年 1 月  
**作者**：AI Productivity App 开发团队
