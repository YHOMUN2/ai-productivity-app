# 🚀 快速解决方案：创建 Supabase instruments 表

## 问题

应用显示错误：
```
Could not find the table 'public.instruments' in the schema cache
```

## 3 步解决

### 第 1 步：打开 Supabase SQL 编辑器

1. 访问 https://app.supabase.com
2. 选择项目 "YHOMUN2's ai-productivity-app"
3. 左侧菜单 → **SQL Editor**
4. 点击 **New Query**

### 第 2 步：复制并执行 SQL

复制以下代码到编辑器：

```sql
-- 创建 instruments 表
CREATE TABLE public.instruments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 启用 Row Level Security
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;

-- 创建查询策略
CREATE POLICY "Enable read for all users" ON public.instruments
  FOR SELECT USING (true);

-- 创建插入策略
CREATE POLICY "Enable insert for all users" ON public.instruments
  FOR INSERT WITH CHECK (true);

-- 创建更新策略
CREATE POLICY "Enable update for all users" ON public.instruments
  FOR UPDATE USING (true) WITH CHECK (true);

-- 创建删除策略
CREATE POLICY "Enable delete for all users" ON public.instruments
  FOR DELETE USING (true);

-- 添加示例数据
INSERT INTO public.instruments (name, description) VALUES
  ('钢琴', '一种弦乐器'),
  ('吉他', '一种弹拨乐器'),
  ('小提琴', '一种弓弦乐器'),
  ('笛子', '一种吹奏乐器'),
  ('鼓', '一种打击乐器');
```

### 第 3 步：执行并验证

1. 点击蓝色 **Run** 按钮
2. 等待执行完成（无错误）
3. 刷新浏览器

## 完成！✅

应用现在应该能够查询 instruments 表并显示数据。

---

## 关于那些浏览器错误

### `TypeError: v[w] is not a function`
- 来自您的浏览器插件（如广告拦截器、跟踪器等）
- 已在 `src/main.js` 中自动过滤
- **不是应用代码的问题**

### `message channel closed` 错误
- 来自 Chrome 扩展通信
- 已自动过滤
- **不影响应用功能**

这些错误会被自动过滤，不会显示给用户。

---

## 如果还是有问题

### 检查清单
- [ ] `.env.local` 文件存在且包含正确的 API Key
- [ ] Supabase 项目可以访问
- [ ] instruments 表已成功创建
- [ ] 刷新浏览器 (F5)

### 调试步骤
```javascript
// 在浏览器控制台执行，检查 Supabase 连接
import { supabase } from '@/lib/supabaseClient'
const { data, error } = await supabase.from('instruments').select('*')
console.log(data, error)
```

---

## 相关文件

- 📄 查询代码：`src/pages/Home.vue` (第 20-40 行)
- 📚 工具函数：`src/utils/supabase-operations.js`
- 🔧 客户端配置：`src/lib/supabaseClient.js`
- ⚙️ 环境变量：`.env.local`

---

**完成时间**：约 2 分钟  
**难度**：⭐ 非常简单  
**下一步**：在应用中看到数据 ✨
