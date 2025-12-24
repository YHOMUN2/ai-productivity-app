下面是 **从官方 Supabase 文档（Quickstart: Vue）提取的完整且详细的配置步骤**，用于在 Vue 应用中集成 Supabase 并进行基本数据查询。([Supabase][1])

---

# Supabase + Vue 快速配置详解（逐步指南）

---

## 1. 创建 Supabase 项目

1. 打开 Supabase 官网并登录。
2. 在 Supabase 控制台点击 **New project** 创建一个新的项目。
3. 输入项目信息（Project name、数据库密码等）。
4. 等待数据库启动完成。
5. 在 Dashboard 中进入 **Table Editor** 或 **SQL Editor** 创建示例数据表（如示例中 `instruments` 表）。([Supabase][1])

可执行的示例 SQL：

```sql
-- 创建表
create table instruments (
  id bigint primary key generated always as identity,
  name text not null
);

-- 插入示例数据
insert into instruments (name) values
('violin'),
('viola'),
('cello');

-- 启用行级安全策略
alter table instruments enable row level security;

-- 给匿名用户公开读取权限
create policy "public can read instruments"
  on public.instruments
  for select to anon
  using (true);
```

---

## 2. 创建 Vue 项目

在命令行中执行以下命令以创建 Vue 项目：

```bash
npm init vue@latest my-app
```

这会启动交互式命令，让你选择 Vue 项目配置（可以按需选项）。([Supabase][1])

---

## 3. 安装 Supabase 客户端库

进入新建的项目目录，并安装 Supabase JavaScript SDK：

```bash
cd my-app
npm install @supabase/supabase-js
```

这个库提供与 Supabase 后端交互的 API。([Supabase][1])

---

## 4. 设置环境变量

在项目根目录创建一个 `.env.local` 文件用于存放 Supabase 的配置信息：

```
VITE_SUPABASE_URL=<你的 Supabase 项目 URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<你的 Publishable Key>
```

从 Supabase 控制台的 **Project Settings → API Keys** 中复制 Project URL 和 Publishable key。([Supabase][1])

---

## 5. 初始化 Supabase 客户端

在项目中创建一个 Supabase 客户端实例供全局使用：

1. 在 `src` 下新建目录 `lib`：

   ```
   mkdir -p src/lib
   ```
2. 在 `src/lib` 中创建 `supabaseClient.js` 文件：

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
```

这样就可以在 Vue 组件或脚本中直接引入 `supabase` 实例进行操作。([Supabase][1])

---

## 6. 在 Vue 中查询数据

你可以修改 `src/App.vue` 或其它组件来获取并展示数据库数据。例如：

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'

const instruments = ref([])

async function getInstruments() {
  const { data } = await supabase.from('instruments').select()
  instruments.value = data
}

onMounted(() => {
  getInstruments()
})
</script>

<template>
  <ul>
    <li v-for="instrument in instruments" :key="instrument.id">
      {{ instrument.name }}
    </li>
  </ul>
</template>
```

这个示例中，Vue 在组件挂载后运行 `getInstruments()`，并从 Supabase 查询数据，然后渲染列表。([Supabase][1])

---

## 7. 启动开发服务器

确保运行以下命令来启动本地开发环境：

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173`（Vite 默认端口），你应该会看到查询出的数据列表。([Supabase][1])

---

# 可选附加步骤（视实际应用需求）

这些不是官方 Quickstart 文档中的必需步骤，但在实际开发中通常有用：

### A. 添加认证 (Auth)

Supabase 提供完整 Auth 支持（注册 / 登录 / 登出）。你可以使用 Supabase Auth API 在 Vue 中实现登录表单。

典型逻辑：

```javascript
await supabase.auth.signInWithPassword({ email, password })
```

或者使用魔法链接：

```javascript
await supabase.auth.signInWithOtp({ email })
```

---

### B. 状态管理 & 全局用户会话

在 Vue + Pinia / Vuex 中存储用户登录状态，并在路由守卫中检查权限。

---

### C. Storage / 文件上传

当你需要处理文件（用户头像、文档）时，可以通过 Supabase Storage API 上传和读取文件。

---
