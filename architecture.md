# AI Productivity App 架构设计文档

## 一、项目概述

**AI Productivity App** 是一个基于 Vue 3 的前端本地 AI 工具集，集成多种 AI 与文本处理能力，旨在提升学习、开发与日常信息处理效率。

**设计理念**：工具即用、无需复杂配置、本地优先

**核心技术栈**：
- 前端框架：Vue 3（Composition API）
- 路由管理：Vue Router
- 状态管理：Pinia（含本地持久化）
- UI 框架：Element Plus
- 后端服务：Supabase（用户认证、数据存储）
- 构建工具：Vite

---

## 二、项目文件与目录结构

```
ai-productivity-app/
├── public/                           # 静态资源目录（favicon、静态图片等）
├── src/                              # 前端应用主目录
│   ├── api/                          # API 封装目录
│   │   ├── ai.js                     # AI 服务接口封装
│   │   ├── ocr.js                    # OCR 识别接口
│   │   └── supabase.js               # Supabase 认证、数据库等封装
│   ├── assets/                       # 静态资源（样式、图片、字体等）
│   │   └── theme.css                 # 主题定义
│   ├── components/                   # 全局可复用组件
│   │   ├── ChatMessage.vue           # 聊天消息展示组件
│   │   ├── ChatWindow.vue            # 聊天窗口组件
│   │   ├── MarkdownEditor.vue        # Markdown 编辑器
│   │   ├── UserMenu.vue              # 用户菜单
│   │   ├── ThemeSwitcher.vue         # 主题切换器
│   │   ├── SupabaseDemo.vue          # Supabase 演示组件
│   │   └── TextTools/                # 文本工具集合（可扩展）
│   │       ├── JsonFormatter.vue     # JSON 格式化工具
│   │       ├── RegexTester.vue       # 正则表达式测试工具
│   │       └── ...                   # 其他工具
│   ├── lib/                          # 库文件和工具函数
│   │   └── supabaseClient.js         # Supabase 客户端单例
│   ├── pages/                        # 页面级别组件（路由对应）
│   │   ├── Home.vue                  # 首页/仪表板
│   │   ├── AIAssistant.vue           # AI 对话助手页面
│   │   ├── PDF.vue                   # PDF 处理页面
│   │   ├── Tools.vue                 # 文本工具集页面
│   │   ├── Note.vue                  # Markdown 笔记页面
│   │   ├── login.vue                 # 登录页面
│   │   └── Register.vue              # 注册页面
│   ├── router/                       # 路由配置
│   │   └── index.js                  # 路由定义与守卫
│   ├── stores/                       # Pinia 状态管理
│   │   ├── index.js                  # 主状态索引
│   │   ├── user.js                   # 用户信息状态（认证、个人资料）
│   │   ├── chat.js                   # AI 对话状态（消息历史）
│   │   ├── notes.js                  # 笔记状态（笔记数据）
│   │   └── theme.js                  # 主题状态（亮色/暗色）
│   ├── utils/                        # 工具函数
│   │   ├── helper.js                 # 通用辅助函数
│   │   ├── eventBus.js               # 事件总线（组件通信）
│   │   ├── supabase-operations.js    # Supabase 操作辅助函数
│   │   └── supabaseTest.js           # Supabase 连接测试
│   ├── App.vue                       # 根组件
│   ├── AppLayout.vue                 # 应用布局组件（侧边栏、导航等）
│   ├── main.js                       # 应用入口点
│   └── style.css                     # 全局样式
├── test/                             # 测试文件目录
│   └── ...                           # 单元测试、集成测试
├── node_cache/                       # npm 缓存（自动生成，可忽略）
├── md-file/                          # 项目文档与说明
├── .env.local                        # 本地环境变量（Supabase 配置）
├── index.html                        # 主 HTML 文件
├── package.json                      # 项目依赖与脚本
├── vite.config.js                    # Vite 构建配置
├── server.js                         # 开发/本地服务器
├── architecture.md                   # 本架构文档
├── tasks.md                          # 开发任务清单
└── README.md                         # 项目说明文档
```

---

## 三、核心目录与文件详解

### 3.1 `src/api/` - API 封装层

**职责**：统一管理与外部服务的交互（AI、OCR、Supabase）

#### `src/api/supabase.js` - Supabase 封装

```javascript
// 功能：
// 1. 创建单一 Supabase 客户端实例
// 2. 导出认证接口（signIn, signUp, signOut, getUser）
// 3. 导出数据库操作接口（CRUD 操作）
// 4. 导出实时监听接口
```

**关键原则**：
- ✅ 一处初始化，全局导入（避免多实例问题）
- ✅ 统一错误处理逻辑
- ✅ 统一 Token 刷新逻辑

#### `src/api/ai.js` - AI 服务接口

```javascript
// 功能：
// 1. 调用大模型 API（如 OpenAI、通义千问等）
// 2. 处理流式响应（Streaming）
// 3. 管理请求超时与重试
```

#### `src/api/ocr.js` - OCR 服务接口

```javascript
// 功能：
// 1. 调用 OCR 接口（如 Tesseract.js、百度 OCR 等）
// 2. 处理图片上传与识别
```

---

### 3.2 `src/components/` - 可复用组件

**原则**：
- 每个组件职责单一
- 使用 Props 接收数据，Emit 事件通知父组件
- 支持高度定制与复用

**核心组件**：

| 组件 | 职责 |
|-----|------|
| `ChatMessage.vue` | 单条聊天消息展示 |
| `ChatWindow.vue` | 整个聊天窗口容器（消息列表 + 输入框） |
| `MarkdownEditor.vue` | Markdown 编辑与预览 |
| `UserMenu.vue` | 用户菜单（头像、登出等） |
| `ThemeSwitcher.vue` | 主题切换按钮 |
| `SupabaseDemo.vue` | Supabase 连接演示 |
| `TextTools/*` | 文本工具集合（JSON、正则等） |

---

### 3.3 `src/lib/` - 库文件

#### `src/lib/supabaseClient.js` - Supabase 单例

```javascript
// 保证全应用只有一个 Supabase 客户端实例
// 防止"Multiple GoTrueClient instances"警告

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

### 3.4 `src/pages/` - 页面级组件

**页面与功能映射**：

| 页面 | 功能 | 路由 |
|-----|------|-----|
| `Home.vue` | 首页/仪表板、功能导航 | `/` |
| `login.vue` | 登录表单、认证流程 | `/login` |
| `Register.vue` | 注册表单 | `/register` |
| `AIAssistant.vue` | AI 对话助手、消息列表、输入框 | `/ai` |
| `Tools.vue` | 文本工具集合（JSON、正则等） | `/tools` |
| `Note.vue` | Markdown 笔记编辑与预览 | `/notes` |
| `PDF.vue` | PDF 处理与 OCR | `/pdf` |

---

### 3.5 `src/router/` - 路由管理

#### `src/router/index.js` - 路由定义与守卫

**职责**：
1. 定义所有路由
2. 实现路由守卫（如：需认证的页面检查）
3. 处理重定向逻辑

```javascript
// 伪代码示例
const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/ai', component: AIAssistant, meta: { requiresAuth: true } },
  // ...
]

// 路由守卫：检查用户是否已认证
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

---

### 3.6 `src/stores/` - Pinia 状态管理

**Pinia 特点**：
- ✅ 自动类型推断（TypeScript 友好）
- ✅ 无需 mutations，直接修改 state
- ✅ 易于扩展和集成插件（如：本地存储）

#### `src/stores/user.js` - 用户状态

```javascript
// State:
// - isAuthenticated: 是否已认证
// - user: 当前用户信息 { id, email, name, ... }
// - userProfile: 用户资料详情
// - loading: 加载状态

// Actions:
// - login(email, password)
// - logout()
// - register(email, password)
// - fetchUserProfile()
// - updateUserProfile(data)
// - checkAuth() - 应用启动时检查认证状态
```

#### `src/stores/chat.js` - AI 对话状态

```javascript
// State:
// - messages: 消息列表 [{ role, content, timestamp, ... }]
// - isLoading: 是否正在等待 AI 响应
// - conversation: 当前对话 ID

// Actions:
// - addMessage(message)
// - fetchMessages(conversationId)
// - clearMessages()
// - sendMessage(content) - 发送消息到 AI
```

#### `src/stores/notes.js` - 笔记状态

```javascript
// State:
// - notes: 笔记列表
// - currentNote: 当前编辑的笔记

// Actions:
// - fetchNotes()
// - createNote(title, content)
// - updateNote(id, data)
// - deleteNote(id)
// - saveToLocalStorage()
// - loadFromLocalStorage()
```

#### `src/stores/theme.js` - 主题状态

```javascript
// State:
// - isDark: 是否为暗色主题
// - colorScheme: 配色方案

// Actions:
// - toggleTheme()
// - setTheme(name)
```

#### `src/stores/index.js` - 状态导出

```javascript
// 统一导出所有 store
export * from './user'
export * from './chat'
export * from './notes'
export * from './theme'
```

**Pinia 本地持久化**：
- 使用 `pinia-plugin-persistedstate` 或自定义插件
- 自动保存关键状态到 `localStorage`
- 页面刷新时自动恢复状态

---

### 3.7 `src/utils/` - 工具函数

#### `src/utils/helper.js` - 通用辅助函数

```javascript
// 常见工具函数：
// - formatDate()
// - copyToClipboard()
// - debounce()
// - throttle()
// - validateEmail()
// - etc.
```

#### `src/utils/eventBus.js` - 事件总线

```javascript
// 用于非父子组件通信
// 虽然 Pinia 已涵盖大部分状态共享需求，但某些跨模块事件仍可用
// 例：全局通知（Toast）、确认框等
```

#### `src/utils/supabase-operations.js` - Supabase 辅助

```javascript
// 常见 Supabase 操作的包装：
// - 用户数据 CRUD
// - 权限检查
// - 数据查询构建
```

---

## 四、状态管理详解

### 4.1 Pinia 架构

**为什么选择 Pinia？**
- ✅ 比 Vuex 更简洁
- ✅ 天然支持 TypeScript
- ✅ 模块化，易于扩展
- ✅ 官方推荐（Vue 3 最佳实践）

### 4.2 状态流转图

```
┌─────────────┐
│  用户操作   │ (点击、输入、提交)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ 组件事件处理      │ (onClick, onChange, onSubmit)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ 调用 Store Action│ (userStore.login(), chatStore.sendMessage())
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Action 执行业务  │ (调用 API、更新状态)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ State 状态更新   │ (响应式更新)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ 模板自动重新渲染  │ (Vue 3 Reactivity)
└──────────────────┘
```

### 4.3 本地持久化策略

**需要持久化的状态**：
- ✅ 用户信息（user store）
- ✅ 主题设置（theme store）
- ✅ 笔记内容（notes store）- 可选，也可存 Supabase

**不需要持久化的状态**：
- ❌ 加载状态（isLoading）
- ❌ 实时消息列表（chat store）- 从 Supabase 重新加载

---

## 五、前端与 Supabase 交互流程

### 5.1 应用启动流程

```
┌─────────────────────────────────────────────────────────────┐
│ 1. main.js: 应用初始化                                       │
│    - 创建 Vue 应用实例                                       │
│    - 注册 Pinia                                              │
│    - 注册路由                                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. App.vue: 根组件挂载                                       │
│    - setup() 中调用 checkAuth()                              │
│    - 从本地存储恢复状态                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. userStore.checkAuth() - 检查认证状态                      │
│    - 调用 supabase.auth.getUser()                            │
│    - 如果有活跃 Session，恢复用户信息                         │
│    - 如果无 Session，清空 user state                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. 路由守卫检查                                              │
│    - 如果路由需要认证且用户未认证 → 重定向到 /login          │
│    - 否则 → 渲染请求的页面                                   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 用户注册与登录流程

#### 注册流程

```
用户填表单 → 调用 userStore.register(email, password)
              ↓
         supabase.auth.signUp({ email, password })
              ↓
         成功？
         /     \
      是/       \否
       ↓         ↓
   保存用户信息  显示错误信息
   (userStore)  返回
       ↓
   可选：创建 profiles 表记录
       ↓
   跳转到 /ai（或首页）
```

#### 登录流程

```
用户输入邮箱密码 → 调用 userStore.login(email, password)
                  ↓
             supabase.auth.signInWithPassword()
                  ↓
             成功？
             /     \
          是/       \否
           ↓         ↓
     更新 userStore  显示错误
     保存到本地存储
           ↓
     跳转到 /ai（或重定向到原请求页面）
```

### 5.3 AI 对话流程

```
用户输入消息 → ChatWindow 组件捕获
              ↓
        chatStore.sendMessage(content)
              ↓
        1. 添加用户消息到 messages 列表
        2. 设置 isLoading = true
        3. 调用 ai.js 的 API（如 OpenAI）
              ↓
        API 返回响应
              ↓
        4. 添加 AI 消息到 messages 列表
        5. 设置 isLoading = false
              ↓
        组件自动重新渲染消息列表
              ↓
        可选：保存对话到 Supabase
```

### 5.4 数据持久化流程

#### 用户数据持久化

```
用户注册/登录成功
         ↓
在 supabase.auth.users 表中创建记录
         ↓
可选：在自定义 profiles 表中创建用户资料
         ↓
Pinia userStore 持久化到 localStorage
         ↓
页面刷新时自动恢复
```

#### 笔记数据持久化

```
用户编辑笔记 → notesStore.updateNote()
          ↓
    更新 Pinia state
          ↓
    实时保存到 localStorage（防丢失）
          ↓
    异步提交到 Supabase（可选）
          ↓
    其他设备可同步（如有云同步需求）
```

---

## 六、Supabase 数据模型（Database Schema）

### 6.1 核心表设计

#### `auth.users` - 认证表（由 Supabase 管理）

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | UUID | 用户唯一 ID |
| email | Text | 邮箱地址 |
| encrypted_password | Text | 加密密码 |
| email_confirmed_at | Timestamp | 邮箱确认时间 |
| created_at | Timestamp | 创建时间 |
| updated_at | Timestamp | 更新时间 |

#### `profiles` - 用户资料表

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**RLS 策略**：
- 用户只能查看/修改自己的资料

#### `conversations` - 对话记录表（可选）

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT DEFAULT 'Untitled',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### `messages` - 消息表（可选）

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 七、安全性与权限管理

### 7.1 行级安全 (RLS - Row Level Security)

**原则**：用户只能访问自己的数据

```sql
-- profiles 表 RLS 示例
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 用户可查看自己的资料
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 用户可修改自己的资料
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

### 7.2 前端安全措施

1. **Token 管理**：
   - ✅ 不在 localStorage 中存储明文密码
   - ✅ 使用 Supabase 内置的 Session 管理
   - ✅ 自动 Token 刷新

2. **认证检查**：
   - ✅ 受保护路由需检查 `userStore.isAuthenticated`
   - ✅ 路由守卫拦截未认证用户

3. **输入验证**：
   - ✅ 表单提交前验证（邮箱格式、密码强度等）
   - ✅ 调用 API 前检查参数

4. **敏感信息**：
   - ❌ 不在客户端存储 API 密钥（应在服务器）
   - ✅ 使用环境变量管理 Supabase 公钥

---

## 八、开发规范

### 8.1 组件开发规范

```javascript
// 组件结构示例
<template>
  <!-- 视图 -->
</template>

<script setup>
// Composition API 推荐写法
import { ref, computed } from 'vue'
import { useStore } from '@/stores'

// Props
const props = defineProps({
  title: String,
})

// Emits
const emit = defineEmits(['update', 'delete'])

// 响应式状态
const isLoading = ref(false)

// 计算属性
const displayTitle = computed(() => props.title?.toUpperCase())

// 方法
const handleUpdate = () => {
  // ...
  emit('update', data)
}
</script>

<style scoped>
/* 局部样式 */
</style>
```

### 8.2 Store 开发规范

```javascript
// stores/example.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExampleStore = defineStore('example', () => {
  // State
  const items = ref([])
  const isLoading = ref(false)

  // Actions
  const fetchItems = async () => {
    isLoading.value = true
    try {
      // API 调用
    } finally {
      isLoading.value = false
    }
  }

  // 必须返回所有公开的状态和方法
  return {
    items,
    isLoading,
    fetchItems,
  }
}, {
  persist: true, // 启用持久化
})
```

### 8.3 API 调用规范

```javascript
// src/api/example.js
import { supabase } from '@/lib/supabaseClient'

// 统一错误处理
export const fetchUserData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error // 让调用者处理
  }
}
```

---

## 九、常见问题排查

### 9.1 "Multiple GoTrueClient instances" 警告

**原因**：多次调用 `createClient()`

**解决方案**：
- ✅ 确保 `supabase.js` 或 `supabaseClient.js` 中只有一个 `createClient()` 调用
- ✅ 从 `src/lib/supabaseClient.js` 导入单例，而不是在其他地方重新创建
- ✅ 检查是否有多个模块都在导入并创建客户端

### 9.2 Session 丢失

**原因**：页面刷新后丢失认证信息

**解决方案**：
- ✅ App.vue 中 `setup()` 调用 `userStore.checkAuth()`
- ✅ 启用 Pinia 持久化
- ✅ 检查浏览器是否禁用了 localStorage

### 9.3 跨域请求失败

**原因**：浏览器 CORS 限制

**解决方案**：
- ✅ 确保 Supabase 的 CORS 配置正确
- ✅ 检查 Supabase 控制台的 API 设置
- ✅ 前端代理配置（Vite 的 `server.proxy`）

---

## 十、扩展与优化建议

### 10.1 短期扩展

- [ ] 添加更多文本工具（CSV 解析、YAML 转换等）
- [ ] 实现对话记录的云端同步
- [ ] 添加用户偏好设置（字体、语言等）

### 10.2 中期优化

- [ ] 离线模式支持（ServiceWorker）
- [ ] 消息搜索与历史管理
- [ ] 多语言国际化 (i18n)

### 10.3 长期目标

- [ ] AI 模型微调（针对特定领域）
- [ ] 协作编辑支持（实时同步）
- [ ] 移动端适配与 PWA 打包

---

## 总结

本架构设计遵循以下核心原则：

1. **模块化**：每个功能独立成页，结构清晰
2. **可维护性**：统一的文件组织和命名规范
3. **可扩展性**：易于添加新工具和功能
4. **本地优先**：前端逻辑为主，后端轻量化
5. **安全性**：完整的认证、授权、数据隐私保护

开发时严格遵守该架构，确保项目长期可维护性和团队协作效率。
