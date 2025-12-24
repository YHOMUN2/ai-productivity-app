# Supabase Profiles 表和触发器设置指南

## 概述

这个指南将帮助你在 Supabase 中正确设置 `public.profiles` 表和自动同步机制，用于与 Supabase Auth 系统集成。

## 架构说明

```
┌─────────────────────────────────────────────────────────────┐
│                    认证流程                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Registration:                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 用户输入: name, email, password                     │   │
│  │          ↓                                          │   │
│  │ signUp(email, password, {data: {full_name: name}}) │   │
│  │          ↓                                          │   │
│  │ ✅ auth.users 表创建记录                           │   │
│  │          ↓                                          │   │
│  │ 🔥 Trigger 自动触发                               │   │
│  │          ↓                                          │   │
│  │ ✅ public.profiles 自动创建记录                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  User Login:                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 用户输入: email, password                           │   │
│  │          ↓                                          │   │
│  │ signInWithPassword(email, password)                 │   │
│  │          ↓                                          │   │
│  │ ✅ auth.users 验证凭证                             │   │
│  │          ↓                                          │   │
│  │ 📊 Query public.profiles 验证数据完整性            │   │
│  │          ↓                                          │   │
│  │ ✅ 返回 {user, profile, session, error}           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 表结构

### auth.users（由 Supabase 管理 - 无需创建）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 用户唯一标识（主键） |
| email | text | 登录邮箱 |
| encrypted_password | text | 加密密码（Supabase 管理） |
| raw_user_meta_data | jsonb | 用户元数据（包含 full_name） |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### public.profiles（需要创建）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PRIMARY KEY, FOREIGN KEY -> auth.users.id | 用户唯一标识 |
| name | varchar(255) | NOT NULL | 用户名（来自 full_name metadata） |
| email | varchar(255) | NOT NULL, UNIQUE | 邮箱地址 |
| created_at | timestamp with time zone | DEFAULT now() | 创建时间 |
| updated_at | timestamp with time zone | DEFAULT now() | 更新时间 |

## 设置步骤

### 步骤 1：创建 Profiles 表

在 Supabase 控制台的 **SQL Editor** 中执行以下 SQL：

```sql
-- 创建 public.profiles 表
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- 添加注释
COMMENT ON TABLE public.profiles IS '用户个人资料表，与 auth.users 一一对应';
COMMENT ON COLUMN public.profiles.id IS '用户 UUID，关联 auth.users.id';
COMMENT ON COLUMN public.profiles.name IS '用户名，来自 auth signup 时的 full_name metadata';
COMMENT ON COLUMN public.profiles.email IS '用户邮箱，来自 auth.users.email';
```

### 步骤 2：创建数据库触发器函数

在 Supabase 控制台的 **SQL Editor** 中执行以下 SQL：

```sql
-- 创建触发器函数
-- 当 auth.users 表中创建新用户时，自动在 profiles 表中创建对应记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    -- 尝试从 metadata 中读取 full_name，否则使用邮箱前缀
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- 如果触发器失败，记录错误但不阻止用户创建
  RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;
```

### 步骤 3：创建触发器

在 Supabase 控制台的 **SQL Editor** 中执行以下 SQL：

```sql
-- 创建触发器
-- 当 auth.users 表插入新记录时，触发 handle_new_user 函数
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

### 步骤 4：配置行级安全策略（RLS）

在 Supabase 控制台中，为 `public.profiles` 表启用 RLS 并配置策略：

#### 4.1 启用 RLS

在 Supabase 控制台：
1. 点击 **Authentication** → **Policies**
2. 在 `public.profiles` 表上启用 **Enable RLS**

#### 4.2 创建 SELECT 策略

```sql
-- 允许用户查看自己的 profile
CREATE POLICY "Enable read for authenticated users"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
);

-- 或者允许任何认证用户查看所有 profiles（如果需要展示用户列表）
-- CREATE POLICY "Enable read for authenticated users"
-- ON public.profiles
-- FOR SELECT
-- USING (auth.role() = 'authenticated');
```

#### 4.3 创建 INSERT 策略（可选）

通常由触发器自动插入，但为了安全，可以禁止直接插入：

```sql
-- 禁止用户直接插入 profile（由触发器自动创建）
CREATE POLICY "Block direct inserts"
ON public.profiles
FOR INSERT
WITH CHECK (false);
```

#### 4.4 创建 UPDATE 策略

```sql
-- 允许用户更新自己的 profile
CREATE POLICY "Enable update for users to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 或者禁止所有更新（如果 profile 只读）
-- CREATE POLICY "Block updates"
-- ON public.profiles
-- FOR UPDATE
-- WITH CHECK (false);
```

#### 4.5 创建 DELETE 策略

```sql
-- 禁止删除（由 CASCADE 删除 auth.users 时自动删除）
CREATE POLICY "Block deletes"
ON public.profiles
FOR DELETE
WITH CHECK (false);
```

## 测试设置

### 使用 SQL Editor 测试

```sql
-- 1. 查看 profiles 表结构
\d public.profiles

-- 2. 查询所有 profiles
SELECT * FROM public.profiles;

-- 3. 查询特定用户的 profile
SELECT * FROM public.profiles WHERE email = 'user@example.com';

-- 4. 查看触发器
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' AND event_object_table = 'auth.users';
```

### 使用应用测试

1. **注册新用户**：
   - 打开应用，点击"立即注册"
   - 输入用户名、邮箱、密码
   - 提交表单

2. **验证 Profiles 创建**：
   - 进入 Supabase 控制台
   - 打开 **Editor** → **public** → **profiles** 表
   - 应该看到新创建的用户记录

3. **测试登录**：
   - 返回应用，输入邮箱和密码
   - 如果登录成功，说明整个流程正常工作
   - 检查浏览器控制台是否有错误信息

## 常见问题

### Q: 注册后登录出现"用户数据不完整，无法登录"错误

**原因**：触发器未正确执行，profile 未创建

**解决**：
1. 检查触发器是否存在：
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE event_object_table = 'auth.users' AND trigger_name = 'on_auth_user_created';
   ```

2. 检查 profiles 表中是否有该用户的记录：
   ```sql
   SELECT * FROM public.profiles WHERE email = 'your-email@example.com';
   ```

3. 检查触发器函数的日志：
   ```sql
   -- 手动测试触发器函数
   SELECT public.handle_new_user((
     'test-id'::uuid,
     'test@example.com',
     'test-password',
     jsonb_build_object('full_name', 'Test User'),
     NOW(),
     NOW()
   ));
   ```

### Q: 触发器创建后不起作用

**原因**：
- Supabase Auth 中禁用了触发器
- 触发器函数有语法错误
- RLS 策略阻止了插入

**解决**：
1. 使用 SQL Editor 直接插入测试数据：
   ```sql
   INSERT INTO public.profiles (id, email, name)
   VALUES (
     gen_random_uuid(),
     'test@example.com',
     'Test User'
   );
   ```
   如果此操作失败，可能是 RLS 策略问题

2. 检查触发器函数的权限：
   ```sql
   SELECT routine_name, routine_schema
   FROM information_schema.routines
   WHERE routine_name = 'handle_new_user';
   ```

### Q: 如何更新用户的 profile 信息

前端代码示例：

```javascript
// src/api/supabase.js 中添加
export const updateProfile = async (credentials) => {
  const { name, email } = credentials;
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) return { error: userError };

  const { data, error } = await supabase
    .from('profiles')
    .update({ name, email, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();

  return { data, error };
};
```

### Q: 如何删除用户

注意：删除 auth.users 会级联删除 profiles 记录（由 ON DELETE CASCADE 定义）

```javascript
// 使用 Supabase Admin API（仅在后端使用）
// 删除用户时，profile 会自动被删除
```

## 文件修改总结

本次更新涉及以下文件修改：

| 文件 | 修改内容 | 状态 |
|------|--------|------|
| `src/api/supabase.js` | 更新 signUp 和 signIn 函数支持 profiles 表 | ✅ 已完成 |
| `src/stores/user.js` | 更新 register/login 方法支持 name 字段和 profile 数据 | ✅ 已完成 |
| `src/pages/Register.vue` | 添加 name 字段和验证规则 | ✅ 已完成 |
| `src/pages/login.vue` | 使用新的 login 方法（无需修改） | ✅ 兼容 |

## 核心 API 更新

### signUp 函数

```javascript
// 接收凭证对象，包含 name 字段
const { user, session, error } = await signUp({
  email: 'user@example.com',
  password: 'secure-password',
  name: 'User Name'
});

// 返回值
// {
//   user: Supabase User 对象,
//   session: 登录会话,
//   error: 错误信息或 null
// }
```

### signIn 函数

```javascript
// 接收凭证对象
const { user, profile, session, error } = await signIn({
  email: 'user@example.com',
  password: 'secure-password'
});

// 返回值
// {
//   user: Supabase User 对象,
//   profile: profiles 表中的数据,
//   session: 登录会话,
//   error: 错误信息或 null
// }
```

## 下一步

1. ✅ 在 Supabase 中创建 profiles 表
2. ✅ 创建触发器函数和触发器
3. ✅ 配置 RLS 策略
4. ✅ 测试注册和登录流程
5. 🔲 （可选）添加用户信息编辑功能

## 相关文档

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Supabase RLS 文档](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL 触发器文档](https://www.postgresql.org/docs/current/sql-createtrigger.html)
