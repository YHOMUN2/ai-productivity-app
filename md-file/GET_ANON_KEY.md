# 🔑 获取正确的 ANON_KEY 步骤

## 你需要完成这个步骤：

### 1️⃣ 打开 Supabase 仪表板

访问：https://supabase.com/dashboard

### 2️⃣ 进入你的项目

找到项目 **ai-productivity-app**，点击进入

### 3️⃣ 进入 Settings → API

1. 点击左侧菜单的 **Settings** (设置)
2. 再点击 **API** 选项

你应该看到这样的页面：

```
Project URL
https://ydltxcrkqfwbjzjvrfhp.supabase.co

Anon (public) key
sb_xxxxxxxxxxxxxxxxxxxx...
[Copy] 按钮

Service role secret key  
sb_xxxxxxxxxxxxxxxxxxxx...
```

### 4️⃣ 复制 Anon key

- ⚠️ **重要**：选择 **Anon (public) key**，不是 Service role secret key
- 点击 **Copy** 按钮
- 完整的 key 会被复制到剪贴板

### 5️⃣ 更新 .env.local

编辑 `f:\Tool\ai-productivity-app\.env.local`：

```dotenv
VITE_SUPABASE_URL=https://ydltxcrkqfwbjzjvrfhp.supabase.co
VITE_SUPABASE_ANON_KEY=这里粘贴刚才复制的 Anon key
```

### 6️⃣ 保存并重启

```bash
# 按 Ctrl+S 保存文件
# 然后停止开发服务器（按 Ctrl+C）
# 重新启动
npm run dev
```

---

## 验证是否正确

在浏览器控制台执行：

```javascript
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**正确的格式**应该是：
```
sb_xxxxxxxxxxxxxxxxxxxx（以 sb_ 开头，后面跟随 40+ 个字符）
```

❌ **错误的格式**：
- `sb_publishable_...`
- `eyJ...` (JWT 格式)
- 空值或 undefined

---

完成后告诉我，我们继续下一步！
