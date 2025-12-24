# Supabase 配置说明

## 项目信息

- **项目名称**：YHOMUN2's ai-productivity-app
- **项目 URL**：https://ydltxcrkqfwbjzjvrfhp.supabase.co
- **Publishable API Key**：sb_publishable_KlP5WpQctFVonFa_Z-9Yuw_uNHD6gie

## 已配置的文件

### 1. **环境变量** (`.env`)
```dotenv
VITE_SUPABASE_URL=https://ydltxcrkqfwbjzjvrfhp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_KlP5WpQctFVonFa_Z-9Yuw_uNHD6gie
```

### 2. **Supabase 客户端** (`src/api/supabase.js`)
- ✅ 已导入 @supabase/supabase-js 库
- ✅ 创建了 Supabase 客户端实例
- ✅ 环境变量验证

## 提供的 API 接口

### 认证相关

#### signUp(email, password)
注册新用户
```javascript
import { signUp } from '@/api/supabase';

const { user, session, error } = await signUp('user@example.com', 'password123');
```

#### signIn(email, password)
用户登录
```javascript
import { signIn } from '@/api/supabase';

const { user, session, error } = await signIn('user@example.com', 'password123');
```

#### signOut()
用户登出
```javascript
import { signOut } from '@/api/supabase';

const { error } = await signOut();
```

#### getUser()
获取当前用户信息
```javascript
import { getUser } from '@/api/supabase';

const { user, error } = await getUser();
```

#### getSession()
获取当前会话
```javascript
import { getSession } from '@/api/supabase';

const { session, error } = await getSession();
```

#### onAuthStateChange(callback)
监听认证状态变化
```javascript
import { onAuthStateChange } from '@/api/supabase';

const unsubscribe = onAuthStateChange((event, session) => {
  console.log('认证事件:', event);
  console.log('会话信息:', session);
});

// 取消监听
unsubscribe();
```

#### resetPassword(email)
请求密码重置
```javascript
import { resetPassword } from '@/api/supabase';

const { error } = await resetPassword('user@example.com');
```

#### updatePassword(newPassword)
更新用户密码
```javascript
import { updatePassword } from '@/api/supabase';

const { user, error } = await updatePassword('newpassword123');
```

### 数据库操作

#### queryData(tableName, options)
查询数据表
```javascript
import { queryData } from '@/api/supabase';

// 基本查询
const { data, error } = await queryData('notes');

// 带过滤条件
const { data, error } = await queryData('notes', {
  filters: { user_id: '123' }
});

// 带排序和分页
const { data, error } = await queryData('notes', {
  filters: { status: 'active' },
  orderBy: { column: 'created_at', ascending: false },
  limit: 10,
  offset: 0
});
```

#### fetchOne(tableName, condition, value)
获取单条数据
```javascript
import { fetchOne } from '@/api/supabase';

const { data, error } = await fetchOne('notes', 'id', '123');
```

#### insertData(tableName, data)
插入新数据
```javascript
import { insertData } from '@/api/supabase';

const { data, error } = await insertData('notes', {
  title: '我的笔记',
  content: '笔记内容',
  user_id: 'current-user-id'
});
```

#### updateData(tableName, data, condition, value)
更新数据
```javascript
import { updateData } from '@/api/supabase';

const { data, error } = await updateData(
  'notes',
  { title: '更新的标题', updated_at: new Date() },
  'id',
  '123'
);
```

#### deleteData(tableName, condition, value)
删除数据
```javascript
import { deleteData } from '@/api/supabase';

const { error } = await deleteData('notes', 'id', '123');
```

### 原始查询

#### db.from(tableName)
直接访问 Supabase 查询构建器
```javascript
import { db } from '@/api/supabase';

const { data, error } = await db
  .from('notes')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

## 测试连接

应用启动时会自动在开发环境中运行 Supabase 连接测试。
可以在浏览器控制台中看到：

```
✅ Supabase 客户端已初始化
🔍 正在测试 Supabase 连接...
✅ Supabase 客户端已成功初始化！
```

## 下一步

### 任务 2.4：实现登录功能
- 在 Login.vue 中集成 signIn API
- 将用户信息存储到 Pinia store
- 实现错误处理和提示

### 任务 2.5：实现注册功能
- 在 Register.vue 中集成 signUp API
- 注册成功后自动登录或跳转

### 任务 2.7：路由守卫
- 添加认证守卫
- 未登录用户自动跳转登录页

## 安全建议

⚠️ **重要**：
1. `.env` 文件中的 API Key 是 **publishable** key（公开密钥），仅用于前端认证
2. 敏感操作（如服务端操作）应使用 **service role key**（服务密钥）在后端进行
3. 设置 Supabase RLS (Row Level Security) 策略保护数据

## 常见问题

### Q: API Key 暴露了怎么办？
A: Publishable Key 的暴露风险较低，但建议：
1. 在 Supabase 控制台重新生成 Key
2. 更新 `.env` 文件
3. 重启开发服务器

### Q: 如何在生产环境中管理凭证？
A: 
1. 使用部署平台的环境变量功能（如 Vercel、Netlify）
2. 不要将 `.env` 文件提交到 Git
3. 在 `.gitignore` 中添加 `.env` 和 `.env.local`
