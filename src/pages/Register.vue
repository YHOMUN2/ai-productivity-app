<template>
  <div class="register-page">
    <!-- 背景装饰（与登录页一致） -->
    <div class="background-decorative">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- 主容器 -->
    <div class="register-container">
      <!-- 注册卡片 -->
      <div class="register-card">
        <!-- 顶部装饰线 -->
        <div class="card-top-line"></div>

        <!-- 头部区域 -->
        <div class="register-header">
          <!-- Logo 区域 -->
          <div class="logo-section">
            <div class="logo-icon">⚡</div>
            <div class="logo-glow"></div>
          </div>

          <!-- 标题区域 -->
          <h1 class="app-title">AI Productivity App</h1>
          <p class="register-subtitle">创建新账户，加入我们</p>
        </div>

        <!-- 分割线 -->
        <div class="divider"></div>

        <!-- 注册表单 -->
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          @submit.prevent="handleRegister"
          class="register-form"
        >
          <!-- 用户名输入 -->
          <el-form-item prop="name">
            <el-input
              v-model="form.name"
              placeholder="用户名"
              type="text"
              prefix-icon="User"
              clearable
              size="large"
              class="form-input"
              @keyup.enter="handleRegister"
            />
          </el-form-item>

          <!-- 邮箱输入 -->
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              placeholder="邮箱地址"
              type="email"
              prefix-icon="Message"
              clearable
              size="large"
              class="form-input"
              @keyup.enter="handleRegister"
            />
          </el-form-item>

          <!-- 密码输入 -->
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              placeholder="设置密码（至少 6 位）"
              type="password"
              prefix-icon="Lock"
              show-password
              clearable
              size="large"
              class="form-input"
              @keyup.enter="handleRegister"
            />
          </el-form-item>

          <!-- 确认密码输入 -->
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              placeholder="确认密码"
              type="password"
              prefix-icon="Lock"
              show-password
              clearable
              size="large"
              class="form-input"
              @keyup.enter="handleRegister"
            />
          </el-form-item>

          <!-- 同意条款复选框 -->
          <el-form-item prop="agreement">
            <el-checkbox v-model="form.agreement">
              我已阅读并同意
              <el-button text type="primary" class="inline-link" style="padding: 0;">服务条款</el-button>
              和
              <el-button text type="primary" class="inline-link" style="padding-left: 0;">隐私政策</el-button>
            </el-checkbox>
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item class="form-submit">
            <el-button
              type="primary"
              size="large"
              class="register-btn"
              @click="handleRegister"
              :loading="loading"
              :disabled="loading"
            >
              {{ loading ? '注册中...' : '立即注册' }}
            </el-button>
          </el-form-item>

          <!-- 底部链接 -->
          <div class="form-links">
            <el-button
              text
              class="link-btn"
              @click="goToLogin"
            >
              已有账户？立即登录
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 右侧信息卡片（大屏幕） -->
      <div class="info-panel">
        <div class="info-item">
          <div class="info-icon">📊</div>
          <h3>数据分析</h3>
          <p>AI 驱动的智能分析，深度洞察您的工作数据</p>
        </div>
        <div class="info-item">
          <div class="info-icon">☁️</div>
          <h3>云端同步</h3>
          <p>云端存储您的数据，随时随地访问</p>
        </div>
        <div class="info-item">
          <div class="info-icon">🎯</div>
          <h3>高效协作</h3>
          <p>与团队协作，提高工作效率</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const formRef = ref(null);
const loading = ref(false);

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
});

// 密码验证函数
const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else if (value.length < 6) {
    callback(new Error('密码长度不少于 6 位'));
  } else {
    // 如果确认密码已填，重新验证确认密码
    if (form.value.confirmPassword !== '') {
      formRef.value?.validateField('confirmPassword');
    }
    callback();
  }
};

// 确认密码验证函数
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请确认密码'));
  } else if (value !== form.value.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度 2-20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreement: [
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请同意服务条款和隐私政策'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

async function handleRegister() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    
    loading.value = true;
    
    // 调用 Pinia store 的注册方法
    // 传递 name 字段，它会被存储在 user metadata 中
    // 数据库触发器会自动将其写入 profiles.name
    const { success, error } = await userStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword
    });
    
    if (success) {
      ElMessage.success('注册成功！正在跳转...');
      
      // 500ms 后跳转到首页（如果自动登录）或登录页
      setTimeout(() => {
        if (userStore.isAuthenticated) {
          router.push('/'); // 已登录，跳转首页
        } else {
          router.push('/login'); // 未登录，跳转登录页等待邮件验证
        }
      }, 500);
    } else {
      ElMessage.error(error || '注册失败');
    }
    
  } catch (error) {
    ElMessage.error('注册失败，请检查输入');
    console.error('注册异常:', error);
  } finally {
    loading.value = false;
  }
}

function goToLogin() {
  console.log('🔗 从注册页导航到登录页...');
  router.push('/login').catch(err => {
    console.error('❌ 导航错误:', err);
  });
}
</script>

<style scoped>
/* ==================== 页面总体容器 ==================== */
.register-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景渐变与动态效果（与登录页一致） */
.register-page {
  background: linear-gradient(
    135deg,
    var(--bg) 0%,
    color-mix(in srgb, var(--bg) 95%, var(--primary)) 100%
  );
}

html[data-theme="dark"] .register-page {
  background: linear-gradient(
    135deg,
    #0f0f0f 0%,
    #1a1a2e 100%
  );
}

/* ==================== 背景装饰元素 ==================== */
.background-decorative {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: float 8s ease-in-out infinite;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: var(--primary);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.blob-2 {
  width: 300px;
  height: 300px;
  background: #10b981;
  bottom: -50px;
  right: 10%;
  animation-delay: 2s;
}

.blob-3 {
  width: 350px;
  height: 350px;
  background: #f59e0b;
  top: 50%;
  right: -100px;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(30px) translateX(-20px);
  }
}

/* ==================== 主注册容器 ==================== */
.register-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: flex-start;
}

@media (max-width: 1024px) {
  .register-container {
    grid-template-columns: 1fr;
    max-width: 450px;
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .register-container {
    max-width: 100%;
    padding: 20px;
    gap: 30px;
  }
}

/* ==================== 注册卡片 ==================== */
.register-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.08),
    0 0 1px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.register-card:hover {
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.12),
    0 0 1px rgba(0, 0, 0, 0.08);
  border-color: var(--primary);
}

.card-top-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), #10b981);
  border-radius: 16px 16px 0 0;
}

@media (max-width: 768px) {
  .register-card {
    padding: 36px 24px;
  }
}

/* ==================== 注册头部 ==================== */
.register-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-section {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 56px;
  display: block;
  line-height: 1;
  animation: pulse 2s ease-in-out infinite;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, var(--primary), transparent);
  border-radius: 50%;
  opacity: 0.2;
  filter: blur(30px);
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.2;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.app-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--primary), #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--text);
  opacity: 0.65;
  font-weight: 500;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin: 24px 0;
}

/* ==================== 注册表单 ==================== */
.register-form {
  margin-top: 0;
}

.form-input {
  margin-bottom: 8px;
}

.register-form :deep(.el-input__wrapper) {
  background: var(--fill-color-light, #f5f7fa);
  border: 1px solid var(--border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

html[data-theme="dark"] .register-form :deep(.el-input__wrapper) {
  background: color-mix(in srgb, var(--bg) 90%, var(--primary));
}

.register-form :deep(.el-input__wrapper:hover) {
  background: color-mix(in srgb, var(--bg) 95%, var(--primary));
}

.register-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 10%, transparent);
  background: var(--bg);
}

.register-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.register-form :deep(.el-form-item:last-of-type) {
  margin-bottom: 0;
}

/* 复选框样式 */
.register-form :deep(.el-checkbox) {
  font-size: 13px;
}

.register-form :deep(.el-checkbox__label) {
  color: var(--text);
  opacity: 0.8;
}

/* 内联链接按钮 */
.inline-link {
  font-size: 13px;
}

/* ==================== 提交按钮 ==================== */
.form-submit {
  margin-top: 24px;
  margin-bottom: 0;
}

.register-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.register-btn:hover::before {
  left: 100%;
}

.register-btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

/* ==================== 表单底部链接 ==================== */
.form-links {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.link-btn {
  color: var(--text);
  opacity: 0.7;
  font-size: 14px;
  padding: 0;
  transition: all 0.2s;
}

.link-btn:hover {
  opacity: 1;
  color: var(--primary);
  font-weight: 500;
}

/* ==================== 右侧信息面板 ==================== */
.info-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  perspective: 1000px;
}

.info-item {
  padding: 24px;
  background: color-mix(in srgb, var(--bg) 50%, var(--primary));
  border: 1px solid var(--border);
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  opacity: 0.9;
}

.info-item:hover {
  opacity: 1;
  transform: translateY(-4px);
  border-color: var(--primary);
  box-shadow: 0 10px 30px color-mix(in srgb, var(--primary) 20%, transparent);
}

.info-icon {
  font-size: 40px;
  margin-bottom: 12px;
  display: block;
  transition: transform 0.3s;
}

.info-item:hover .info-icon {
  transform: scale(1.15) rotate(-10deg);
}

.info-item h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.info-item p {
  margin: 0;
  font-size: 13px;
  color: var(--text);
  opacity: 0.7;
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .info-panel {
    display: none;
  }
}

/* ==================== 响应式调整 ==================== */
@media (max-width: 768px) {
  .register-card {
    max-width: 100%;
  }

  .app-title {
    font-size: 24px;
  }

  .register-subtitle {
    font-size: 13px;
  }

  .logo-icon {
    font-size: 48px;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 28px 20px;
  }

  .app-title {
    font-size: 20px;
  }

  .register-btn {
    height: 40px;
    font-size: 14px;
  }

  .divider {
    margin: 20px 0;
  }

  .register-header {
    margin-bottom: 24px;
  }
}

/* ==================== 避免文字选中 ==================== */
.register-card,
.logo-icon,
.app-title {
  user-select: none;
}

/* ==================== 高对比度模式支持 ==================== */
@media (prefers-contrast: more) {
  .register-card {
    border-width: 2px;
  }

  .card-top-line {
    height: 4px;
  }
}

/* ==================== 减少动画模式支持 ==================== */
@media (prefers-reduced-motion: reduce) {
  .blob,
  .logo-icon,
  .logo-glow,
  .register-card,
  .info-item,
  .link-btn,
  .register-form :deep(.el-input__wrapper),
  .register-btn {
    animation: none !important;
    transition: none !important;
  }
}
</style>
