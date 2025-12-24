# 🎯 快速行动指南（复制粘贴步骤）

## ⏱️ 预计时间：5 分钟

---

## 步骤 1️⃣ : 禁用邮箱验证（2 分钟）

### 打开 Supabase Dashboard

访问：**https://supabase.com/dashboard**

### 进入项目

找到 **ai-productivity-app** 并点击进入

### 找到邮箱验证设置

1. 左侧菜单 → **Authentication** (认证)
2. 点击 **Providers** (提供程序)
3. 找到 **Email** 选项

### 关闭邮箱确认

1. 点击 **Email** 的 **Edit** 按钮（或齿轮图标⚙️）
2. 找到这个选项：**"Confirm email"** 或 **"Require email confirmation"**
3. 点击开关关闭它（OFF）
4. 向下滚动，点击 **Save** 按钮

**预期**：
```
✅ Confirm email: OFF
✅ Settings saved
```

---

## 步骤 2️⃣ : 重启开发服务器（1 分钟）

### 在你的终端中

```bash
# 按 Ctrl+C 停止当前服务器
# 然后执行
npm run dev
```

**预期**：看到
```
  Local:     http://localhost:5173/
```

---

## 步骤 3️⃣ : 测试应用（2 分钟）

### 打开应用

在浏览器中访问：**http://localhost:5173**

### 测试注册

1. 点击 **"还没有账户？立即注册"**
2. 填写表单：
   - 用户名：`testuser`
   - 邮箱：`test@example.com`
   - 密码：`Test123456!`
   - 确认密码：`Test123456!`
   - ✅ 勾选同意条款
3. 点击 **"创建账户"**

**预期结果**：
```
✅ "注册成功！正在跳转..."
(自动跳转到登录页)
```

### 测试登录

1. 输入刚注册的邮箱：`test@example.com`
2. 输入密码：`Test123456!`
3. 点击 **"登录"**

**预期结果**：
```
✅ "登录成功！"
(自动跳转到首页)
右上角显示：👤 testuser
```

---

## ✅ 成功标志

如果你看到以下情况，说明一切正常：

- ✅ 注册页面有 **"用户名"** 输入字段
- ✅ 能成功注册（显示成功消息）
- ✅ 能成功登录（显示成功消息）
- ✅ 登录后右上角显示用户菜单
- ✅ 用户名显示正确

---

## 🐛 遇到问题？

### 仍然出现 "Email not confirmed" 错误？

1. 再次检查邮箱验证是否已关闭（在 Supabase Dashboard 中确认）
2. 清除浏览器缓存：按 **F12** → **Storage** → **Clear Site Data**
3. 重启开发服务器：**Ctrl+C** → **npm run dev**
4. 刷新页面：**Ctrl+F5** 或 **Cmd+Shift+R**

### 注册成功但无法登录？

这可能是触发器未执行的问题。检查：

```sql
-- 在 Supabase SQL Editor 中执行
SELECT * FROM profiles WHERE email = 'test@example.com';
```

如果没有数据，说明触发器未执行。参考 [PROFILES_TABLE_SETUP.md](./PROFILES_TABLE_SETUP.md) 重新创建触发器。

---

## 📚 更多帮助

| 文档 | 说明 |
|------|------|
| [CODE_UPDATE_SUMMARY.md](./CODE_UPDATE_SUMMARY.md) | 代码修改详情 |
| [QUICK_START_FIX.md](./QUICK_START_FIX.md) | 详细的修复步骤 |
| [SUPABASE_TROUBLESHOOTING.md](./SUPABASE_TROUBLESHOOTING.md) | 故障排查 |
| [OFFICIAL_QUICKSTART.md](./OFFICIAL_QUICKSTART.md) | 官方快速开始 |

---

## 🎉 完成了！

你的应用现在应该能够：
- ✅ 注册用户
- ✅ 自动创建 profiles 数据
- ✅ 登录用户
- ✅ 显示用户菜单

**祝贺！** 🎊

