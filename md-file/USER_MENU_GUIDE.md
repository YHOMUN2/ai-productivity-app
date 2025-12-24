# 用户登录入口 + 用户菜单卡片 实现说明

## 概述

本文档详细说明了如何在 Vue3 项目中实现"用户登录入口"和"用户菜单卡片"功能，包括状态管理、组件设计和交互逻辑。

## 架构设计

### 1. 状态管理（Pinia Store）

**文件**：`src/stores/user.js`

**核心功能**：
- 用户认证状态管理（登录/登出）
- 用户信息存储（邮箱、名称、头像等）
- 操作方法（登录、注册、退出、更新信息）
- 计算属性（用户名、头像 URL 等）
- 本地存储持久化

**主要方法**：

```javascript
// 登录
await userStore.login({ email, password })

// 注册
await userStore.register({ email, password, confirmPassword })

// 退出
await userStore.logout()

// 更新用户信息
userStore.updateUserInfo({ name: '新名称' })

// 更新头像
userStore.updateAvatar(avatarUrl)
```

**状态结构**：

```javascript
{
  user: {
    id: string,
    email: string,
    name: string,
    avatar: string | null,
    createdAt: string
  },
  isLoggedIn: boolean,
  loading: boolean,
  error: string | null
}
```

### 2. 用户菜单卡片组件

**文件**：`src/components/UserMenu.vue`

**功能特性**：
- 显示用户头像和基本信息
- 下拉菜单形式展示功能选项
- 支持修改头像（文件上传）
- 支持退出登录（带确认对话框）
- 响应式设计
- 深色主题适配

**菜单项**：
1. 个人资料 - 跳转到个人资料页面（开发中）
2. 修改头像 - 上传新头像
3. 设置 - 打开设置页面（开发中）
4. 退出登录 - 清除会话，返回登录页

**代码示例**：

```vue
<template>
  <el-dropdown @command="handleMenuCommand">
    <!-- 用户头像 -->
    <div class="user-avatar-wrapper">
      <img :src="userStore.userAvatar" :alt="userStore.userName" />
    </div>
    
    <!-- 下拉菜单 -->
    <template #dropdown>
      <div class="user-menu-card">
        <!-- 用户信息 -->
        <div class="user-info-section">
          <img :src="userStore.userAvatar" class="user-avatar-large" />
          <div class="user-details">
            <div class="user-name">{{ userStore.userName }}</div>
            <div class="user-email">{{ userStore.userEmail }}</div>
          </div>
        </div>
        
        <!-- 菜单项 -->
        <el-dropdown-item command="profile">个人资料</el-dropdown-item>
        <el-dropdown-item command="avatar">修改头像</el-dropdown-item>
        <el-dropdown-item command="settings">设置</el-dropdown-item>
        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
      </div>
    </template>
  </el-dropdown>
</template>
```

### 3. 导航栏集成

**文件**：`src/AppLayout.vue`

**实现逻辑**：

```vue
<template>
  <nav class="navbar">
    <!-- ... 其他导航项 ... -->
    
    <div class="nav-right">
      <!-- 已登录：显示用户菜单 -->
      <UserMenu v-if="userStore.isAuthenticated" />
      
      <!-- 未登录：显示登录按钮 -->
      <el-button v-else type="primary" @click="goToLogin">
        登录
      </el-button>
    </div>
  </nav>
</template>

<script setup>
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

function goToLogin() {
  router.push('/login');
}
</script>
```

### 4. 登录页面集成

**文件**：`src/pages/Login.vue`

**关键改动**：

```javascript
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

async function handleLogin() {
  // 1. 表单验证
  await formRef.value.validate();
  
  // 2. 调用 Pinia 的登录方法
  const { success, error } = await userStore.login({
    email: form.value.email,
    password: form.value.password
  });
  
  // 3. 处理结果
  if (success) {
    ElMessage.success('登录成功！');
    router.push('/'); // 跳转首页
  } else {
    ElMessage.error(error);
  }
}
```

## 交互流程

### 用户未登录状态

```
访问应用
    ↓
导航栏显示"登录"按钮
    ↓
用户点击"登录"按钮
    ↓
跳转到登录页 (/login)
```

### 登录流程

```
输入邮箱和密码
    ↓
点击"登录"按钮
    ↓
表单验证
    ↓
调用 userStore.login()
    ↓
登录成功 → Pinia 状态更新 → 跳转首页
登录失败 → 显示错误提示 → 保留登录页
```

### 用户已登录状态

```
进入应用
    ↓
检查 userStore.isAuthenticated
    ↓
Pinia 加载持久化数据
    ↓
导航栏显示用户头像
    ↓
点击头像 → 展开用户菜单
```

### 用户菜单交互

```
点击用户头像
    ↓
菜单展开
    ├─ 点击"个人资料" → 跳转到个人资料页 （开发中）
    ├─ 点击"修改头像" → 打开文件选择器
    │  ├─ 选择图片 → 读取为 Data URL → 更新头像 → 成功提示
    │  └─ 取消 → 菜单保持打开或关闭
    ├─ 点击"设置" → 跳转到设置页 （开发中）
    └─ 点击"退出登录" → 确认对话框
       ├─ 确认 → 调用 logout() → 清除状态 → 跳转登录页
       └─ 取消 → 菜单关闭

点击页面其他区域
    ↓
菜单自动关闭
```

## 状态持久化说明

Pinia 用户状态通过 `pinia-plugin-persistedstate` 插件实现本地存储：

```javascript
// 启用持久化
persist: true
```

**效果**：
- 用户登录后，会话数据保存到 `localStorage`
- 用户刷新页面，会话自动恢复
- 用户退出登录，数据自动清空

**存储键**：`user`（Pinia 自动生成）

## 文件清单

```
src/
├── stores/
│   └── user.js                    # ✅ Pinia 用户状态 store
├── components/
│   └── UserMenu.vue               # ✅ 用户菜单卡片组件
├── pages/
│   └── Login.vue                  # ✅ 登录页面（已集成）
└── AppLayout.vue                  # ✅ 导航栏（已集成）
```

## 样式设计

### 用户头像

- **大小**：40px（导航栏），48px（菜单卡片）
- **形状**：圆形（border-radius: 50%）
- **背景**：渐变色 (primary -> #10b981)
- **边框**：2px solid var(--primary)
- **Hover 效果**：缩放 1.05，阴影增强
- **过渡**：0.3s cubic-bezier(0.4, 0, 0.2, 1)

### 菜单卡片

- **宽度**：280px（平板 260px）
- **背景**：var(--bg)
- **边框**：1px solid var(--border)
- **圆角**：12px
- **阴影**：0 8px 24px rgba(0, 0, 0, 0.12)
- **响应式**：平板及以下自动调整

### 菜单项

- **高度**：44px（含内边距）
- **字体大小**：14px
- **颜色**：var(--text)
- **Hover**：背景色 primary 10% 透明度
- **退出登录项**：红色 (#f56c6c)

## 后续集成步骤

### 与 Supabase 集成

在 `src/stores/user.js` 的 `login()` 方法中，替换模拟代码：

```javascript
// 当前（模拟）
const { success, error } = await userStore.login({...});

// 集成后
import { signIn } from '@/api/supabase';

async login(credentials) {
  const { user, session, error } = await signIn(
    credentials.email,
    credentials.password
  );
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  this.user = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email,
    avatar: user.user_metadata?.avatar_url,
    createdAt: user.created_at
  };
  
  this.isLoggedIn = true;
  return { success: true, user: this.user };
}
```

### 路由守卫（任务 2.7）

在 `src/router/index.js` 中添加认证守卫：

```javascript
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  // 受保护的路由列表
  const protectedRoutes = ['/note', '/ai'];
  
  // 检查是否尝试访问受保护路由
  if (protectedRoutes.includes(to.path) && !userStore.isAuthenticated) {
    // 未登录，跳转到登录页
    next('/login');
  } else {
    next();
  }
});
```

## 常见问题

### Q: 如何测试用户菜单？
A: 在登录页输入任意邮箱（需合法格式）和密码（≥6位），点击登录。菜单会在导航栏右侧显示用户头像。

### Q: 头像数据存储在哪里？
A: 当前实现将头像保存为 Data URL，存储在 localStorage。生产环境应上传到 Supabase Storage 或 CDN。

### Q: 如何自定义菜单项？
A: 编辑 `UserMenu.vue` 中的 dropdown-item，修改 command 和 label，在 handleMenuCommand 中添加对应的处理逻辑。

### Q: 为什么退出登录时需要确认？
A: 这是常见的 UX 实践，防止用户误操作。可在 ElMessageBox.confirm 中自定义文本和按钮。

### Q: 菜单如何在点击外部时关闭？
A: Element Plus 的 `el-dropdown` 已默认支持此功能，无需额外代码。

## 下一步

1. **任务 2.4**：完成登录与 Supabase API 的真实集成
2. **任务 2.5**：实现注册功能与用户状态管理
3. **任务 2.7**：添加路由守卫保护需要认证的页面
4. **扩展功能**：
   - 个人资料页面
   - 设置页面
   - 账户管理（修改密码、邮箱等）
   - 用户头像上传到 Supabase Storage
