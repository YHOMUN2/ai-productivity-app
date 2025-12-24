<template>
  <div class="profile-container">
    <!-- 页面标题区 -->
    <div class="profile-header">
      <h1>账户设置</h1>
      <p class="header-subtitle">管理您的账户信息和个人偏好</p>
    </div>

    <!-- 主内容区 -->
    <div class="profile-content">
      <!-- 基本信息卡片 -->
      <div class="profile-card">
        <div class="card-header">
          <h2>基本信息</h2>
          <span class="section-label">Profile</span>
        </div>

        <div class="card-body">
          <!-- 用户头像区 -->
          <div class="avatar-section">
            <div class="avatar-container">
              <img
                :src="userStore.userAvatar"
                :alt="editForm.username"
                class="profile-avatar"
              />
              <button class="avatar-edit-btn" @click="goToChangeAvatar" title="修改头像">
                <el-icon><Camera /></el-icon>
              </button>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
              />
            </div>
            <div class="avatar-info">
              <div class="info-label">用户头像</div>
              <div class="info-text">支持 JPG, PNG, GIF（最大 5MB）</div>
              <el-button
                type="text"
                size="small"
                @click="goToChangeAvatar"
                class="change-avatar-link"
              >
                <el-icon><Edit /></el-icon>
                修改头像
              </el-button>
            </div>
          </div>

          <!-- 分割线 -->
          <div class="form-divider"></div>

          <!-- 用户名编辑区 -->
          <div class="form-group">
            <label class="form-label">用户名</label>
            <div class="input-wrapper">
              <input
                v-if="isEditing"
                v-model="editForm.username"
                type="text"
                class="form-input editing"
                placeholder="输入用户名"
                maxlength="32"
                @focus="$event.target.select()"
              />
              <div v-else class="form-value">
                {{ userStore.userName }}
              </div>
              <div class="input-hint">
                {{ editForm.username.length }} / 32
              </div>
            </div>
          </div>

          <!-- 邮箱显示区 -->
          <div class="form-group">
            <label class="form-label">邮箱地址</label>
            <div class="form-value-readonly">
              <el-icon class="readonly-icon"><Message /></el-icon>
              <span>{{ userStore.userEmail }}</span>
            </div>
            <div class="readonly-hint">邮箱地址不可修改，如需更换请联系管理员</div>
          </div>

          <!-- 用户 ID -->
          <div class="form-group">
            <label class="form-label">用户 ID</label>
            <div class="form-value-readonly id-value">
              <span class="monospace">{{ userId }}</span>
              <el-button
                type="text"
                size="small"
                @click="copyUserId"
                class="copy-btn"
              >
                <el-icon><DocumentCopy /></el-icon>
                复制
              </el-button>
            </div>
            <div class="readonly-hint">唯一的用户标识符</div>
          </div>

          <!-- 分割线 -->
          <div class="form-divider"></div>

          <!-- 操作按钮区 -->
          <div class="button-group">
            <el-button
              v-if="!isEditing"
              type="primary"
              @click="startEditing"
              class="action-btn"
            >
              <el-icon><Edit /></el-icon>
              编辑信息
            </el-button>
            <template v-else>
              <el-button
                type="primary"
                @click="saveChanges"
                :loading="isSaving"
                class="action-btn"
              >
                <el-icon><Check /></el-icon>
                保存更改
              </el-button>
              <el-button
                @click="cancelEditing"
                class="action-btn cancel"
              >
                取消
              </el-button>
            </template>
          </div>
        </div>
      </div>

      <!-- 账户安全卡片 -->
      <div class="profile-card danger-zone">
        <div class="card-header">
          <h2>账户安全</h2>
          <span class="section-label">Security</span>
        </div>

        <div class="card-body">
          <!-- 密码修改 -->
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">修改密码</div>
              <div class="security-description">定期修改密码保护您的账户安全</div>
            </div>
            <el-button type="text" class="action-link">修改</el-button>
          </div>

          <div class="security-divider"></div>

          <!-- 两步验证 -->
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">两步验证 (2FA)</div>
              <div class="security-description">启用双因素认证增强账户安全</div>
            </div>
            <div class="security-status disabled">未启用</div>
          </div>

          <div class="security-divider"></div>

          <!-- 登录会话 -->
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">登录会话</div>
              <div class="security-description">管理已登录的设备和会话</div>
            </div>
            <el-button type="text" class="action-link">查看</el-button>
          </div>

          <div class="security-divider"></div>

          <!-- 退出所有会话 -->
          <div class="security-item danger">
            <div class="security-info">
              <div class="security-title">退出所有会话</div>
              <div class="security-description">这将在所有设备上登出您的账户</div>
            </div>
            <el-button type="danger" text @click="handleLogoutAll">
              退出所有
            </el-button>
          </div>
        </div>
      </div>

      <!-- 删除账户卡片 -->
      <div class="profile-card danger-zone critical">
        <div class="card-header">
          <h2>删除账户</h2>
          <span class="section-label danger">Danger Zone</span>
        </div>

        <div class="card-body">
          <div class="danger-warning">
            <el-icon class="warning-icon"><Warning /></el-icon>
            <div class="warning-text">
              <div class="warning-title">此操作不可恢复</div>
              <div class="warning-description">
                删除账户会永久删除您的所有数据，包括笔记、聊天记录和设置。请谨慎操作。
              </div>
            </div>
          </div>

          <div class="danger-action">
            <el-button type="danger" @click="handleDeleteAccount">
              删除我的账户
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Camera, Message, Edit, Check, DocumentCopy, Warning } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();

// 数据状态
const isEditing = ref(false);
const isSaving = ref(false);
const avatarInput = ref(null);

const editForm = reactive({
  username: userStore.userName,
  avatar: userStore.userAvatar
});

// 使用简单的 UUID 作为用户 ID（实际应从后端获取）
const userId = ref(userStore.userId || 'user-' + Math.random().toString(36).substr(2, 9));

// ⭐ 页面挂载时，从 store 初始化表单数据
onMounted(() => {
  editForm.username = userStore.userName;
  editForm.avatar = userStore.userAvatar;
});

/**
 * 跳转到修改头像页面
 */
function goToChangeAvatar() {
  router.push('/change-avatar');
}

/**
 * 触发头像上传
 */
function triggerAvatarUpload() {
  avatarInput.value?.click();
}

/**
 * 处理头像变更
 */
async function handleAvatarChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // 文件大小校验 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 5MB');
    return;
  }

  // 文件类型校验
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
    ElMessage.error('仅支持 JPG、PNG、GIF 格式');
    return;
  }

  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      editForm.avatar = e.target.result;
      ElMessage.success('头像已更新');
    };
    reader.readAsDataURL(file);
  } catch (err) {
    ElMessage.error('读取文件失败');
  }
}

/**
 * 开始编辑
 */
function startEditing() {
  isEditing.value = true;
  editForm.username = userStore.userName;
}

/**
 * 保存更改
 */
async function saveChanges() {
  if (!editForm.username.trim()) {
    ElMessage.warning('用户名不能为空');
    return;
  }

  isSaving.value = true;
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    // 更新用户信息
    userStore.updateProfile({
      userName: editForm.username,
      userAvatar: editForm.avatar
    });

    ElMessage.success('个人信息已保存');
    isEditing.value = false;
  } catch (err) {
    ElMessage.error('保存失败，请重试');
  } finally {
    isSaving.value = false;
  }
}

/**
 * 取消编辑
 */
function cancelEditing() {
  isEditing.value = false;
  editForm.username = userStore.userName;
  editForm.avatar = userStore.userAvatar;
}

/**
 * 复制用户 ID
 */
function copyUserId() {
  navigator.clipboard.writeText(userId.value).then(() => {
    ElMessage.success('用户 ID 已复制');
  });
}

/**
 * 退出所有会话
 */
async function handleLogoutAll() {
  try {
    await ElMessageBox.confirm(
      '确定要退出所有设备上的登录会话吗？您需要重新登录。',
      '确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    ElMessage.success('已退出所有会话，请重新登录');
    // 实际应调用登出接口
  } catch {
    // 用户取消
  }
}

/**
 * 删除账户
 */
async function handleDeleteAccount() {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除您的账户和所有相关数据。请输入您的邮箱地址以确认此操作。',
      '删除账户',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    );

    ElMessage.success('账户已删除');
    // 实际应调用删除接口并重定向
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
/* ==================== 容器和布局 ==================== */
.profile-container {
  min-height: 100vh;
  background-color: var(--bg-base);
  padding: var(--spacing-xl);
}

.profile-header {
  max-width: 900px;
  margin: 0 auto var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.profile-header h1 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.header-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.profile-content {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* ==================== 卡片样式 ==================== */
.profile-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.profile-card:hover:not(.danger-zone) {
  border-color: var(--accent-light);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.08);
}

.profile-card.danger-zone {
  border-color: #fee2e2;
}

.profile-card.danger-zone:hover {
  border-color: #fca5a5;
}

.profile-card.critical {
  border-color: #f87171;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.card-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.section-label.danger {
  color: #f87171;
}

/* 卡片身体 */
.card-body {
  padding: var(--spacing-xl);
}

/* ==================== 头像区 ==================== */
.avatar-section {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-lg);
  object-fit: cover;
  border: 2px solid var(--border-color);
  transition: all 150ms ease;
}

.avatar-container:hover .profile-avatar {
  border-color: var(--accent);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--accent);
  color: white;
  border: 2px solid var(--bg-surface);
  cursor: pointer;
  transition: all 150ms ease;
  font-size: 18px;
}

.avatar-edit-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.avatar-edit-btn:active {
  transform: scale(0.95);
}

.avatar-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.info-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.change-avatar-link {
  color: var(--accent);
  margin-top: var(--spacing-xs);
  padding: 0;
  font-size: 0.85rem;
}

.change-avatar-link:hover {
  color: var(--accent-light);
}

/* ==================== 表单元素 ==================== */
.form-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-xl) 0;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* 输入框包装器 */
.input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 150ms ease;
  outline: none;
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  background-color: var(--bg-surface);
}

.form-input.editing {
  background-color: var(--accent-light);
}

.input-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: right;
}

/* 只读值显示 */
.form-value {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.95rem;
  color: var(--text-primary);
  background-color: var(--bg-base);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.form-value-readonly {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.95rem;
  color: var(--text-primary);
  background-color: var(--bg-base);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  min-height: 40px;
}

.readonly-icon {
  color: var(--text-secondary);
  font-size: 16px;
  flex-shrink: 0;
}

.readonly-hint {
  margin-top: var(--spacing-xs);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.form-value-readonly.id-value {
  justify-content: space-between;
}

.monospace {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.copy-btn {
  color: var(--accent);
  margin-left: auto;
  padding: 0 var(--spacing-xs);
}

.copy-btn:hover {
  color: var(--accent-light);
}

/* ==================== 按钮组 ==================== */
.button-group {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.action-btn {
  min-width: 120px;
}

.action-btn.cancel {
  background-color: transparent;
  color: var(--text-secondary);
  border-color: var(--border-color);
}

.action-btn.cancel:hover {
  background-color: var(--bg-secondary);
  border-color: var(--text-secondary);
}

/* ==================== 安全设置 ==================== */
.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
}

.security-item.danger {
  padding: var(--spacing-md);
  background-color: #fef2f2;
  border-radius: var(--radius-md);
  border: 1px solid #fee2e2;
}

.security-info {
  flex: 1;
}

.security-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.security-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.security-status {
  font-size: 0.85rem;
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  white-space: nowrap;
}

.security-status.disabled {
  background-color: #f3f4f6;
  color: #6b7280;
}

.security-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-md) 0;
}

.action-link {
  color: var(--accent);
  text-decoration: none;
}

.action-link:hover {
  color: var(--accent-light);
}

/* ==================== 危险区域警告 ==================== */
.danger-warning {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: #fef2f2;
  border-left: 3px solid #f87171;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.warning-icon {
  color: #f87171;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-text {
  flex: 1;
}

.warning-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.warning-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.danger-action {
  display: flex;
  justify-content: flex-end;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .profile-container {
    padding: var(--spacing-lg);
  }

  .profile-header {
    margin-bottom: var(--spacing-lg);
  }

  .profile-header h1 {
    font-size: 1.5rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .avatar-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
  }

  .button-group {
    flex-direction: column;
    width: 100%;
  }

  .action-btn {
    width: 100%;
  }

  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .danger-action {
    width: 100%;
  }

  .danger-action :deep(.el-button) {
    width: 100%;
  }
}

/* ==================== 深色模式适配 ==================== */
[data-theme="dark"] .profile-card.danger-zone {
  border-color: #7f1d1d;
}

[data-theme="dark"] .profile-card.danger-zone:hover {
  border-color: #b91c1c;
}

[data-theme="dark"] .profile-card.critical {
  border-color: #dc2626;
}

[data-theme="dark"] .security-item.danger {
  background-color: #7f1d1d;
  border-color: #991b1b;
}

[data-theme="dark"] .danger-warning {
  background-color: #7f1d1d;
  border-left-color: #f87171;
}
</style>
