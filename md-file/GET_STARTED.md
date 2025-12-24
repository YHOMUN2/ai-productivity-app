# 🚀 立即开始测试注册功能

## ⚡ 30秒快速开始

```bash
# 1. 启动开发服务器
npm run dev

# 2. 打开浏览器
http://localhost:5173/register
```

---

## 📝 最小可测试用例

### 注册新账户

```
邮箱：test@example.com
密码：password123
确认：password123
✅ 勾选"同意服务条款"

点击"立即注册" → 成功跳转首页 ✅
```

### 登录

```
邮箱：test@example.com
密码：password123

点击"登录" → 成功跳转首页 ✅
导航栏显示头像 ✅
```

### 验证持久化

```
刷新页面 (F5)
→ 仍保持登录状态 ✅
→ 导航栏仍显示头像 ✅
```

---

## ✅ 验证清单

- [ ] 注册成功，自动登录
- [ ] 登录页面可用
- [ ] 登出功能正常
- [ ] 刷新后状态保持
- [ ] 错误提示显示
- [ ] 响应式显示正常

---

## 📊 Supabase 配置

```
Project: https://ydltxcrkqfwbjzjvrfhp.supabase.co
API Key: sb_publishable_KlP5WpQctFVonFa_Z-9Yuw_uNHD6gie
```

---

## 🐛 快速排查

| 问题 | 解决方案 |
|-----|--------|
| 页面无法加载 | `npm install` → `npm run dev` |
| 注册失败 | 检查邮箱格式 + 密码 ≥ 6位 |
| 登录失败 | 确认邮箱和密码正确 |
| 状态丢失 | `F5` 刷新，检查 localStorage |
| 网络错误 | 检查网络连接 + Supabase 可用性 |

---

## 📞 获取帮助

查看详细文档：
- 🔧 [Supabase 集成指南](SUPABASE_AUTH_INTEGRATION.md)
- 🧪 [完整测试指南](SUPABASE_IMPLEMENTATION_COMPLETE.md)
- 📚 [API 快速参考](QUICK_REFERENCE.md)

---

**就这么简单！🎉**
