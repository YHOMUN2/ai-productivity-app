# 部署前检查清单

## 📋 代码准备

- [ ] 所有代码已提交到 GitHub
- [ ] `.env.local` 已添加到 `.gitignore`
- [ ] 没有在代码中硬编码密钥
- [ ] API 端点已在 `api/` 目录下
- [ ] Vercel 配置文件 `vercel.json` 已更新

## 🔑 环境变量准备

### 本地开发（`.env.local`）

- [ ] `VITE_SUPABASE_URL` - 从 Supabase 获取
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` - 从 Supabase 获取（anon key）
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - 从 Supabase 获取（⚠️ 保密）
- [ ] `VOLC_API_KEY` - 从火山引擎获取

### Vercel 环境（Settings → Environment Variables）

在 Vercel 控制面板中添加相同的环境变量：

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
VOLC_API_KEY
```

## 🧪 本地测试

- [ ] 前端能正常启动：`npm run dev`
- [ ] 可以访问 http://localhost:5173
- [ ] AI 聊天功能正常（有 API Key）或 mock 模式正常
- [ ] 用户认证流程正常
- [ ] Supabase 连接成功
- [ ] API 端点可访问：
  - [ ] `POST http://localhost:3001/api/chat`
  - [ ] `POST http://localhost:3001/api/supabase`

### 手动测试脚本

```bash
# 测试 AI 聊天
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'

# 测试 Supabase
curl -X POST http://localhost:3001/api/supabase \
  -H "Content-Type: application/json" \
  -d '{"action":"select","table":"profiles","filters":{}}'
```

## 📦 构建验证

- [ ] 构建命令成功：`npm run build:vercel`
- [ ] `dist/` 目录已生成
- [ ] 预览构建结果：`npm run preview`
- [ ] 预览版本功能正常

## 🚀 Vercel 部署

### 部署前

- [ ] GitHub 仓库已创建或更新
- [ ] 代码已推送到远程（main 分支）
- [ ] Vercel 账户已创建
- [ ] GitHub 权限已授权给 Vercel

### 部署中

- [ ] 项目已导入到 Vercel
- [ ] 构建设置已配置：
  - [ ] Framework: Vite
  - [ ] Build Command: `npm run build:vercel`
  - [ ] Output Directory: `dist`
- [ ] 环境变量已添加到 Vercel
- [ ] 部署成功（绿色勾选）

### 部署后

- [ ] 访问部署 URL（https://xxx.vercel.app）
- [ ] 页面加载正常
- [ ] 控制台没有错误

## ✅ 功能验证

### 前端功能

- [ ] 主页加载正常
- [ ] 导航菜单工作正常
- [ ] 响应式设计正常（测试手机视图）

### API 功能

- [ ] AI 聊天 API 可访问
  - [ ] 正常请求返回 200
  - [ ] 错误请求返回 405 或 500
  - [ ] CORS 预检请求返回 200
- [ ] Supabase 代理 API 可访问
  - [ ] SELECT 操作成功
  - [ ] 错误处理正确

### 用户功能

- [ ] 用户注册流程
- [ ] 用户登录流程
- [ ] 个人资料更新
- [ ] AI 聊天对话
- [ ] 对话保存到 Supabase

### 错误处理

- [ ] API 密钥缺失时的 mock 响应
- [ ] Supabase 连接失败时的错误提示
- [ ] 网络错误处理

## 🔒 安全检查

- [ ] `.env.local` 在 `.gitignore` 中
- [ ] 敏感密钥只在 Vercel 环境变量中
- [ ] API 端点不暴露敏感信息
- [ ] Supabase RLS 策略已配置

## 📊 监控设置

- [ ] Vercel Analytics 已启用
- [ ] Supabase 日志已检查
- [ ] 错误监控已配置（可选：Sentry）

## 📝 文档完整性

- [ ] README.md 已更新
- [ ] 部署指南已准备
- [ ] API 文档已准备
- [ ] 环境变量模板 `.env.example` 已准备

## 🎉 最终检查

- [ ] 所有项目已勾选
- [ ] 已与团队成员沟通
- [ ] 备份计划已制定
- [ ] 回滚计划已制定

---

## 快速部署命令

```bash
# 1. 确保所有改动已提交
git status

# 2. 推送到 GitHub
git add .
git commit -m "chore: prepare for Vercel deployment"
git push origin main

# 3. 在 Vercel 控制面板中触发部署
# 或等待自动部署（如果已配置）

# 4. 监控部署进度
vercel logs --follow
```

---

**部署日期**: _______________
**部署人员**: _______________
**完成时间**: _______________
