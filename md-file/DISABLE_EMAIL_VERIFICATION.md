# 🔓 禁用邮箱验证 - 快速步骤（推荐开发环境）

## 错误信息

你当前遇到的错误：
```
❌ Email not confirmed (邮箱未验证)
```

这是因为 Supabase 项目的认证设置中启用了邮箱验证。

---

## 解决方案：禁用邮箱验证

### 步骤 1️⃣ : 打开 Supabase 仪表板

访问：https://supabase.com/dashboard

进入你的项目 **ai-productivity-app**

### 步骤 2️⃣ : 进入认证设置

1. 左侧菜单点击 **Authentication** (认证)
2. 点击 **Providers** (提供程序)

### 步骤 3️⃣ : 找到 Email 设置

在 Providers 列表中，找到 **Email** 选项

### 步骤 4️⃣ : 关闭邮箱确认

1. 点击 Email 的 **编辑按钮**（齿轮图标或 Edit）
2. 找到这些选项（其中一个）：
   - ❌ "Confirm email"
   - ❌ "Require email confirmation before signing in"
   - ❌ "Email confirmations"

3. **关闭** 这个选项（Toggle OFF）
4. 向下滚动，点击 **Save** 按钮

### 步骤 5️⃣ : 重新加载应用

```bash
# 关闭开发服务器（Ctrl+C）
# 清除浏览器缓存
# 重新启动开发服务器
npm run dev
```

### 步骤 6️⃣ : 测试注册

1. 打开 http://localhost:5173
2. 点击 **"还没有账户？立即注册"**
3. 填写表单并提交

**预期结果**：
- ✅ 应该看到 "注册成功！正在跳转..."
- ✅ 自动跳转到登录页
- ✅ 能够立即登录（无需邮箱验证）

---

## ✅ 验证邮箱验证已禁用

在浏览器控制台执行：

```javascript
import supabase from '@/lib/supabaseClient.js';

// 测试注册
const { data, error } = await supabase.auth.signUp({
  email: `test-${Date.now()}@example.com`,
  password: 'Test123456!',
  options: {
    data: { full_name: 'Test User' }
  }
});

if (error) {
  console.log('❌ 错误:', error.message);
} else {
  console.log('✅ 注册成功，无需邮箱验证');
  console.log('用户:', data.user.email);
}
```

**预期输出**：
```
✅ 注册成功，无需邮箱验证
用户: test-1701234567@example.com
```

---

## 💡 生产环境建议

禁用邮箱验证只推荐用于**开发环境**。对于生产环境，建议：

1. **启用邮箱验证**（需要配置邮件服务）
2. **配置 SMTP** 或使用邮件服务：
   - Resend
   - SendGrid
   - Mailgun
   - 等等

3. **使用 Supabase Email Templates** 定制邮件内容

这样用户会收到验证邮件，点击邮件中的链接后才能使用账户。

---

## 🐛 如果仍然出现邮箱验证错误

**可能原因**：
1. ✅ 设置未保存（再次检查，确保点击了 Save）
2. ✅ 浏览器缓存（F12 → Storage → Clear Site Data）
3. ✅ 开发服务器未重启（重新运行 npm run dev）
4. ✅ 已有用户需要重新注册（旧用户数据被缓存）

**排查步骤**：
```bash
# 1. 完全关闭开发服务器
npm install  # 重新安装依赖（清除缓存）
npm run dev  # 重启

# 2. 打开浏览器，访问应用
# F12 → Storage → Clear Site Data
# 刷新页面
```

---

## 现在可以测试了！

完成以上步骤后，你的应用应该能够：
- ✅ 注册新用户（无需邮箱验证）
- ✅ 自动在 profiles 表创建用户记录（通过触发器）
- ✅ 成功登录
- ✅ 显示用户菜单

**接下来**：按照 [SUPABASE_CONNECT_CHECKLIST.md](./SUPABASE_CONNECT_CHECKLIST.md) 的步骤进行完整测试！

