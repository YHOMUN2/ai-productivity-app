<template>
  <div class="avatar-sync-demo">
    <!-- 说明区 -->
    <div class="demo-header">
      <h1>🎯 头像同步演示</h1>
      <p class="subtitle">验证头像作为全站共享状态的正确建模</p>
    </div>

    <!-- 核心原理展示 -->
    <div class="demo-section">
      <h2>🏗️ 架构原理</h2>
      <div class="architecture-box">
        <div class="box-item store">
          <div class="box-title">Pinia Store</div>
          <div class="box-content">
            <code>profile.avatar_url</code>
            <div class="note">唯一的数据源</div>
          </div>
        </div>

        <div class="box-item arrow">→</div>

        <div class="box-item component">
          <div class="box-title">所有组件</div>
          <div class="box-content">
            <code>userStore.userAvatar</code>
            <div class="note">响应式同步</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时数据监测 -->
    <div class="demo-section">
      <h2>🔍 实时数据状态</h2>
      <div class="data-monitor">
        <div class="monitor-item">
          <span class="label">当前头像 URL：</span>
          <code class="value">{{ userStore.userAvatar }}</code>
        </div>
        <div class="monitor-item">
          <span class="label">Store Profile Avatar：</span>
          <code class="value">{{ userStore.profile?.avatar_url || '未设置' }}</code>
        </div>
        <div class="monitor-item">
          <span class="label">用户名：</span>
          <span class="value">{{ userStore.userName }}</span>
        </div>
        <div class="monitor-item">
          <span class="label">邮箱：</span>
          <span class="value">{{ userStore.userEmail }}</span>
        </div>
      </div>
    </div>

    <!-- 三个位置的头像显示 -->
    <div class="demo-section">
      <h2>📸 三个位置的头像同步</h2>
      <div class="three-avatars">
        <!-- 1. Profile 页面 -->
        <div class="avatar-location">
          <div class="location-title">1️⃣ Profile 页面</div>
          <div class="avatar-card">
            <img :src="userStore.userAvatar" class="avatar-img" />
            <div class="location-path">class="profile-avatar"</div>
          </div>
        </div>

        <!-- 2. UserMenu 组件 -->
        <div class="avatar-location">
          <div class="location-title">2️⃣ UserMenu 菜单</div>
          <div class="avatar-card">
            <img :src="userStore.userAvatar" class="avatar-img" />
            <div class="location-path">class="user-avatar-large"</div>
          </div>
        </div>

        <!-- 3. AppLayout -->
        <div class="avatar-location">
          <div class="location-title">3️⃣ AppLayout 导航栏</div>
          <div class="avatar-card">
            <img :src="userStore.userAvatar" class="avatar-img" />
            <div class="location-path">class="user-avatar"</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 测试流程 -->
    <div class="demo-section">
      <h2>✅ 完整测试流程</h2>
      <div class="test-steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">访问修改头像页面</div>
            <el-button type="primary" @click="goToChangeAvatar">
              前往 /change-avatar
            </el-button>
          </div>
        </div>

        <div class="step-arrow">⬇️</div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">上传新图片</div>
            <p class="step-desc">选择或拖拽上传 JPG/PNG/GIF 图片</p>
          </div>
        </div>

        <div class="step-arrow">⬇️</div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">保存头像</div>
            <p class="step-desc">点击保存，调用 userStore.updateAvatarInStore()</p>
          </div>
        </div>

        <div class="step-arrow">⬇️</div>

        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <div class="step-title">验证同步</div>
            <p class="step-desc">所有位置的头像立即更新，无需刷新</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 关键代码 -->
    <div class="demo-section code-section">
      <h2>💡 关键代码片段</h2>

      <!-- Store getter -->
      <div class="code-block">
        <div class="code-title">Store Getter（唯一数据源）</div>
        <pre v-pre><code>userAvatar: (state) => {
  // 优先从 profile.avatar_url 读取
  if (state.profile?.avatar_url) {
    return state.profile.avatar_url;
  }
  // 降级方案
  return `https://api.dicebear.com/...`;
}</code></pre>
      </div>

      <!-- Store action -->
      <div class="code-block">
        <div class="code-title">Store Action（更新状态）</div>
        <pre v-pre><code>updateAvatarInStore(avatarUrl) {
  if (this.profile) {
    this.profile.avatar_url = avatarUrl;
  }
}</code></pre>
      </div>

      <!-- 组件使用 -->
      <div class="code-block">
        <div class="code-title">组件使用（所有位置相同）</div>
        <pre v-pre><code>&lt;img :src="userStore.userAvatar" /&gt;</code></pre>
      </div>

      <!-- ChangeAvatar 保存 -->
      <div class="code-block">
        <div class="code-title">ChangeAvatar 保存逻辑</div>
        <pre v-pre><code>async function saveAvatar() {
  // ⭐ 立即更新状态
  userStore.updateAvatarInStore(previewImage);
  
  // 然后返回页面
  router.push('/profile');
}</code></pre>
      </div>
    </div>

    <!-- 原理解释 -->
    <div class="demo-section principle-section">
      <h2>🧠 为什么这样做是对的</h2>
      <div class="principle-list">
        <div class="principle-item">
          <div class="principle-icon">✅</div>
          <div class="principle-content">
            <div class="principle-title">单一数据源</div>
            <p>只有 profile.avatar_url 是权威来源，避免多个地方维护状态导致不一致</p>
          </div>
        </div>

        <div class="principle-item">
          <div class="principle-icon">✅</div>
          <div class="principle-content">
            <div class="principle-title">响应式同步</div>
            <p>Vue 的反应式系统自动通知所有引用，无需手动 emit 或刷新</p>
          </div>
        </div>

        <div class="principle-item">
          <div class="principle-icon">✅</div>
          <div class="principle-content">
            <div class="principle-title">跨页面一致</div>
            <p>从 Profile 跳到 ChangeAvatar，头像始终来自同一个 store，保证一致性</p>
          </div>
        </div>

        <div class="principle-item">
          <div class="principle-icon">✅</div>
          <div class="principle-content">
            <div class="principle-title">页面刷新安全</div>
            <p>Store 配置了 persist: true，数据存到 localStorage，刷新后仍保留</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

function goToChangeAvatar() {
  router.push('/change-avatar');
}
</script>

<style scoped>
.avatar-sync-demo {
  background-color: var(--bg-base);
  min-height: 100vh;
  padding: var(--spacing-xl);
}

.demo-header {
  max-width: 1200px;
  margin: 0 auto var(--spacing-xl);
  text-align: center;
  padding-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--accent);
}

.demo-header h1 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.subtitle {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.demo-section {
  max-width: 1200px;
  margin: 0 auto var(--spacing-xl);
}

.demo-section h2 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 架构图 */
.architecture-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-surface);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
}

.box-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  min-width: 180px;
  text-align: center;
}

.box-item.store {
  border-left: 4px solid var(--accent);
}

.box-item.component {
  border-right: 4px solid #10b981;
}

.box-title {
  font-weight: 600;
  color: var(--text-primary);
}

.box-content {
  font-size: 0.9rem;
  font-family: 'Monaco', 'Menlo', monospace;
}

.box-item code {
  color: var(--accent);
  font-size: 0.85rem;
  padding: var(--spacing-xs);
  background-color: var(--bg-base);
  border-radius: 4px;
}

.box-item .note {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.box-item.arrow {
  font-size: 1.5rem;
  color: var(--accent);
  min-width: auto;
  padding: 0;
  background: transparent;
}

/* 数据监测 */
.data-monitor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
}

.monitor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  word-break: break-all;
}

.monitor-item .label {
  font-weight: 500;
  color: var(--text-secondary);
  margin-right: var(--spacing-md);
}

.monitor-item .value {
  color: var(--accent);
  flex: 1;
}

/* 三个头像位置 */
.three-avatars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.avatar-location {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.location-title {
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--text-primary);
}

.avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--bg-surface);
  border: 2px solid var(--accent);
  border-radius: var(--radius-lg);
}

.avatar-img {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-lg);
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.location-path {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-align: center;
}

/* 测试步骤 */
.test-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.step {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--accent);
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-sm);
}

.step-title {
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.step-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.step-arrow {
  text-align: center;
  font-size: 1.5rem;
  color: var(--accent);
}

/* 代码块 */
.code-section {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.code-block {
  margin-bottom: var(--spacing-lg);
}

.code-block:last-child {
  margin-bottom: 0;
}

.code-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-size: 0.95rem;
}

.code-block pre {
  margin: 0;
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent);
  overflow-x: auto;
}

.code-block code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.85rem;
  color: var(--accent);
  line-height: 1.6;
}

/* 原理列表 */
.principle-section {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.principle-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.principle-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 4px solid #10b981;
}

.principle-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.principle-content {
  flex: 1;
}

.principle-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.principle-content p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 响应式 */
@media (max-width: 768px) {
  .demo-header h1 {
    font-size: 1.8rem;
  }

  .architecture-box {
    flex-direction: column;
  }

  .step {
    flex-direction: column;
    align-items: flex-start;
  }

  .three-avatars {
    grid-template-columns: 1fr;
  }
}
</style>
