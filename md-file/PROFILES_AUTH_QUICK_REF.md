# 🚀 Profiles 表认证系统 - 快速参考

> **最后更新**：2024 年 1 月 | **状态**：✅ 前端完成 | ⏳ 数据库待配置

## 📋 实现概览

| 组件/模块 | 文件 | 状态 | 修改内容 |
|----------|------|------|--------|
| Register 注册 | `src/pages/Register.vue` | ✅ | 添加 name 字段 |
| Login 登录 | `src/pages/login.vue` | ⚪ | 无需修改（已兼容） |
| User Store | `src/stores/user.js` | ✅ | 支持 name，验证 profile |
| Supabase API | `src/api/supabase.js` | ✅ | signUp/signIn 全面更新 |
| 数据库 profiles | Supabase SQL | ⏳ | 待创建 |
| 触发器函数 | Supabase SQL | ⏳ | 待创建 |

## 🔑 核心 API 变化

### signUp 函数

**原来**：
```javascript
signUp(email, password)
// → { user, session, error }
```

**现在**：
```javascript
signUp({ email, password, name })
// → { user, session, error }
// ✅ name 通过 metadata.full_name 传给触发器
```

### signIn 函数

**原来**：
```javascript
signIn(email, password)
// → { user, session, error }
```

**现在** ✅ **关键更新**：
```javascript
signIn({ email, password })
// → { user, profile, session, error }  // ✅ 新增 profile
// 新增验证：查询 profiles 表检查数据完整性
```

## 📦 状态管理更新

### 状态字段

```javascript
state: {
  user: null,       // Auth.users 数据
  profile: null,    // ✅ 新增：profiles 表数据
  isLoggedIn: false,
  loading: false,
  error: null
}
```

### 注册方法

**输入**：`{ name, email, password, confirmPassword }`  
**验证**：name 长度 2-20  
**返回**：`{ success, error }`

### 登录方法

**输入**：`{ email, password }`  
**新增验证**：profiles 表存在  
**返回**：`{ success, error, user?, profile? }`

## 🎯 快速开始（开发者）

### 1. 启动应用
```bash
npm run dev
# 访问 http://localhost:5173
```

### 2. 测试注册
- 打开 `/register` 页面
- 输入：用户名、邮箱、密码
- 看到：name 输入字段（✅ 已添加）

### 3. 创建数据库（Supabase）

在 SQL Editor 中复制粘贴：

```sql
-- 1. 创建 profiles 表
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. 创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- 3. 创建触发器
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. 启用 RLS 和创建策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### 4. 完整测试
1. 注册新用户 → 查看 Supabase console profiles 表
2. 登录该用户 → 应该成功
3. 用错误密码登录 → 显示错误

## 📚 详细文档

| 文档 | 用途 |
|------|------|
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | 完整的实现细节和工作流 |
| [PROFILES_TABLE_SETUP.md](./PROFILES_TABLE_SETUP.md) | 数据库 SQL 和 RLS 配置 |
| [AUTHENTICATION_TESTING_GUIDE.md](./AUTHENTICATION_TESTING_GUIDE.md) | 逐步测试指南 |

## ⚡ 关键代码片段

### Register.vue - 注册表单
```vue
<!-- 新增：用户名字段 -->
<el-form-item prop="name">
  <el-input v-model="form.name" placeholder="用户名" prefix-icon="User" />
</el-form-item>

<!-- 调用 store -->
const { success, error } = await userStore.register({
  name: form.value.name,
  email: form.value.email,
  password: form.value.password,
  confirmPassword: form.value.confirmPassword
});
```

### user.js - 注册和登录
```javascript
// 注册时：name → metadata.full_name → 触发器 → profiles.name
async register(credentials) {
  const { user, session, error } = await signUp({
    email: credentials.email,
    password: credentials.password,
    name: credentials.name
  });
  // ...
}

// 登录时：验证 profile 存在
async login(credentials) {
  const { user, profile, session, error } = await signIn(credentials);
  if (!profile) {
    this.error = '用户数据不完整，无法登录';
    return { success: false, error: this.error };
  }
  // ...
}
```

### supabase.js - API
```javascript
// signUp：通过 metadata 传递 name
export const signUp = async (credentials) => {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: { full_name: credentials.name }  // ✅ 触发器读取这个
    }
  });
  // ...
};

// signIn：查询 profiles 验证
export const signIn = async (credentials) => {
  const { data, error } = await supabase.auth.signInWithPassword(
    credentials.email,
    credentials.password
  );
  
  // ✅ 新增验证
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return { user, profile: profileData, session, error };
};
```

## 🔍 故障排查

### 问题 1：注册后无法登录

**错误**：`用户数据不完整，无法登录`

**原因**：触发器未执行，profiles 表中没有用户

**检查**：
```sql
-- 触发器是否存在
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- profiles 表是否有该用户
SELECT * FROM profiles WHERE email = 'your-email@example.com';
```

### 问题 2：name 字段验证不通过

**检查**：
```javascript
// 确保 name 长度 2-20 字符
if (name.length < 2 || name.length > 20) {
  // 显示错误
}
```

### 问题 3：邮箱已注册错误

**原因**：使用了已存在的邮箱  
**解决**：用新邮箱注册或使用登录功能

## ✅ 验证清单

- [ ] 应用启动无错误
- [ ] Supabase 客户端初始化成功
- [ ] Register 页面显示 name 字段
- [ ] 注册新用户成功
- [ ] profiles 表自动创建记录
- [ ] 登录该用户成功
- [ ] 错误处理正常（如邮箱已注册）

## 📝 核心流程

```
┌─────────────────┐
│   用户注册       │
└────────┬────────┘
         │ name, email, password
         ↓
    ┌─────────────────┐
    │ Register.vue    │
    └────────┬────────┘
             │ handleRegister()
             ↓
    ┌──────────────────┐
    │ userStore.js     │
    │ .register()      │
    └────────┬─────────┘
             │ { email, password, name }
             ↓
    ┌──────────────────┐
    │ supabase.js      │
    │ .signUp()        │
    └────────┬─────────┘
             │ metadata: { full_name: name }
             ↓
    ┌────────────────────────────┐
    │ Supabase Auth              │
    │ ✓ auth.users created       │
    │ 🔥 Trigger fires           │
    │ ✓ profiles auto created    │
    └────────┬───────────────────┘
             │ { user, session, error }
             ↓
    ┌──────────────────┐
    │ UI 显示结果       │
    │ 成功→跳转登录页   │
    │ 失败→显示错误     │
    └──────────────────┘
```

## 🎓 学习资源

- Supabase Auth：https://supabase.com/docs/guides/auth
- PostgreSQL 触发器：https://postgresql.org/docs/current/sql-createtrigger.html
- Pinia 状态管理：https://pinia.vuejs.org/

## 💡 提示

1. **开发时启用 Supabase 日志**：
   ```javascript
   // 在浏览器 console 中
   supabase.auth.onAuthStateChange((event, session) => {
     console.log('Auth event:', event, session);
   });
   ```

2. **快速测试 API**：
   ```javascript
   // 在浏览器 console 中
   import { signUp, signIn } from '@/api/supabase';
   const result = await signUp({ email: 'test@example.com', password: 'test123', name: 'Test' });
   console.log(result);
   ```

3. **查看用户数据**：
   ```javascript
   // 在任何地方
   const userStore = useUserStore();
   console.log('User:', userStore.user);
   console.log('Profile:', userStore.profile);
   ```

---

**需要帮助？**
- 📖 查看详细文档：[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- 🧪 参考测试指南：[AUTHENTICATION_TESTING_GUIDE.md](./AUTHENTICATION_TESTING_GUIDE.md)
- 🗄️ 数据库配置：[PROFILES_TABLE_SETUP.md](./PROFILES_TABLE_SETUP.md)
