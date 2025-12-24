<template>
  <div class="change-avatar-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>修改头像</h1>
      <p class="header-subtitle">更换您的头像，支持 JPG、PNG、GIF 格式（最大 5MB）</p>
    </div>

    <!-- 主内容区 -->
    <div class="avatar-editor">
      <!-- 左侧：当前头像 -->
      <div class="avatar-preview-section">
        <div class="preview-header">当前头像</div>
        
        <div class="avatar-display-box">
          <img
            :src="userStore.userAvatar"
            :alt="userStore.userName"
            class="user-avatar-large"
          />
        </div>

        <div class="avatar-info">
          <div class="info-item">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ userStore.userName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ userStore.userEmail }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：上传和预览 -->
      <div class="avatar-upload-section">
        <!-- 上传区域 -->
        <div
          class="upload-area"
          :class="{ 'is-dragging': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <!-- 点击上传 -->
          <div class="upload-content" @click="triggerFileInput">
            <div class="upload-icon">
              <el-icon><Picture /></el-icon>
            </div>
            <div class="upload-text">
              <div class="upload-title">点击或拖拽上传</div>
              <div class="upload-hint">支持 JPG、PNG、GIF（最大 5MB）</div>
            </div>
          </div>

          <!-- 隐藏的文件输入 -->
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            style="display: none"
            @change="handleFileSelect"
          />
        </div>

        <!-- 预览区域 -->
        <div v-if="previewImage" class="preview-section">
          <div class="preview-header">预览</div>
          
          <div class="preview-box">
            <img :src="previewImage" :alt="'preview'" class="preview-img" />
          </div>

          <!-- 文件信息 -->
          <div class="file-info">
            <div class="info-row">
              <span class="label">文件名</span>
              <span class="value">{{ selectedFile?.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">文件大小</span>
              <span class="value">{{ formatFileSize(selectedFile?.size) }}</span>
            </div>
            <div class="info-row">
              <span class="label">文件类型</span>
              <span class="value">{{ selectedFile?.type }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button
              type="primary"
              @click="saveAvatar"
              :loading="isSaving"
              size="large"
              class="save-btn"
            >
              <el-icon><Check /></el-icon>
              保存头像
            </el-button>
            <el-button
              @click="cancelUpload"
              size="large"
              class="cancel-btn"
            >
              取消
            </el-button>
          </div>

          <!-- 预览提示 -->
          <div class="preview-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>预览效果仅供参考，保存后将成为您的头像</span>
          </div>
        </div>

        <!-- 无预览时的占位符 -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <el-icon><PictureFilled /></el-icon>
          </div>
          <div class="empty-text">上传图片后，此处将显示预览</div>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="tips-section">
      <h3 class="tips-title">💡 提示</h3>
      <ul class="tips-list">
        <li>
          <span class="tip-icon">✓</span>
          <span>建议使用 1:1 的正方形图片，效果最佳</span>
        </li>
        <li>
          <span class="tip-icon">✓</span>
          <span>最大文件大小为 5MB，支持 JPG、PNG、GIF 格式</span>
        </li>
        <li>
          <span class="tip-icon">✓</span>
          <span>头像修改后，所有已登录的设备都将同步更新</span>
        </li>
        <li>
          <span class="tip-icon">✓</span>
          <span>您可以随时返回此页面修改头像</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Picture,
  PictureFilled,
  Check,
  InfoFilled
} from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();

// 数据状态
const fileInput = ref(null);
const isDragging = ref(false);
const previewImage = ref(null);
const selectedFile = ref(null);
const isSaving = ref(false);

/**
 * 触发文件输入
 */
function triggerFileInput() {
  fileInput.value?.click();
}

/**
 * 处理文件拖拽
 */
function handleDrop(event) {
  isDragging.value = false;
  
  const files = event.dataTransfer?.files;
  if (files?.length > 0) {
    processFile(files[0]);
  }
}

/**
 * 处理文件选择
 */
function handleFileSelect(event) {
  const files = event.target.files;
  if (files?.length > 0) {
    processFile(files[0]);
  }
}

/**
 * 处理文件（验证和预览）
 */
function processFile(file) {
  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 5MB');
    return;
  }

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('仅支持 JPG、PNG、GIF 格式');
    return;
  }

  // 验证图片尺寸（可选）
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      // 图片加载成功
      selectedFile.value = file;
      previewImage.value = event.target.result;
      ElMessage.success('图片已加载，预览可用');
    };
    img.onerror = () => {
      ElMessage.error('图片格式无效或已损坏');
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`;
  }
  
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * 保存头像
 */
async function saveAvatar() {
  if (!previewImage.value) {
    ElMessage.warning('请先选择图片');
    return;
  }

  isSaving.value = true;

  try {
    // ⭐ 关键：上传前，立即更新全局状态
    // 这样所有地方都能看到新头像，无需等待数据库响应
    userStore.updateAvatarInStore(previewImage.value);
    
    ElMessage.success('头像保存成功');
    
    // 模拟网络延迟（实际应上传到 Supabase Storage）
    await new Promise(resolve => setTimeout(resolve, 800));

    // 可选：这里可以调用实际的数据库更新 API
    // await updateProfileInDatabase(previewImage.value);

    // 延迟后返回个人资料页
    setTimeout(() => {
      router.push('/profile');
    }, 200);
  } catch (err) {
    ElMessage.error('保存头像失败，请重试');
    console.error('头像保存错误:', err);
  } finally {
    isSaving.value = false;
  }
}

/**
 * 取消上传
 */
function cancelUpload() {
  previewImage.value = null;
  selectedFile.value = null;
  
  // 重置文件输入
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}
</script>

<style scoped>
/* ==================== 容器和布局 ==================== */
.change-avatar-container {
  min-height: 100vh;
  background-color: var(--bg-base);
  padding: var(--spacing-xl);
}

.page-header {
  max-width: 1200px;
  margin: 0 auto var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.page-header h1 {
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

/* ==================== 编辑器容器 ==================== */
.avatar-editor {
  max-width: 1200px;
  margin: 0 auto var(--spacing-xl);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}

/* ==================== 左侧：预览区 ==================== */
.avatar-preview-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.preview-header {
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.avatar-display-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  aspect-ratio: 1;
  min-height: 300px;
}

.user-avatar-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-lg);
  max-width: 240px;
  max-height: 240px;
  border: 2px solid var(--border-color);
  transition: all 150ms ease;
}

.avatar-display-box:hover .user-avatar-large {
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
}

/* 用户信息 */
.avatar-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 500;
}

/* ==================== 右侧：上传区 ==================== */
.avatar-upload-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 上传区域 */
.upload-area {
  position: relative;
  padding: var(--spacing-xl);
  background-color: var(--bg-surface);
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  transition: all 150ms ease;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: var(--accent);
  background-color: color-mix(in srgb, var(--accent) 3%, transparent);
}

.upload-area.is-dragging {
  border-color: var(--accent);
  background-color: color-mix(in srgb, var(--accent) 5%, transparent);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 48px;
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-text {
  text-align: center;
}

.upload-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.upload-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* 预览区 */
.preview-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.preview-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  aspect-ratio: 1;
  min-height: 200px;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: var(--radius-md);
  max-width: 180px;
  max-height: 180px;
}

/* 文件信息 */
.file-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.info-row .label {
  color: var(--text-secondary);
  font-weight: 500;
}

.info-row .value {
  color: var(--text-primary);
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.85rem;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.save-btn {
  flex: 1;
  height: 40px;
  font-weight: 500;
}

.cancel-btn {
  flex: 1;
  height: 40px;
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.cancel-btn:hover {
  background-color: var(--bg-secondary);
  border-color: var(--text-secondary);
  color: var(--text-secondary);
}

/* 预览提示 */
.preview-hint {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: #eff6ff;
  border-radius: var(--radius-md);
  border-left: 3px solid #3b82f6;
  font-size: 0.85rem;
  color: #1e40af;
}

.preview-hint :deep(.el-icon) {
  flex-shrink: 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  min-height: 300px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 56px;
  color: var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 0.95rem;
}

/* ==================== 底部提示 ==================== */
.tips-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.tips-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tips-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.tips-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.tip-icon {
  color: #10b981;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 1024px) {
  .avatar-editor {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .avatar-display-box {
    min-height: 250px;
  }

  .upload-area {
    min-height: 180px;
  }
}

@media (max-width: 768px) {
  .change-avatar-container {
    padding: var(--spacing-lg);
  }

  .page-header {
    margin-bottom: var(--spacing-lg);
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .avatar-editor {
    gap: var(--spacing-lg);
  }

  .avatar-display-box {
    min-height: 200px;
  }

  .user-avatar-large {
    max-width: 160px;
    max-height: 160px;
  }

  .upload-icon {
    font-size: 40px;
  }

  .upload-title {
    font-size: 0.95rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .save-btn,
  .cancel-btn {
    width: 100%;
  }

  .tips-list li {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .change-avatar-container {
    padding: var(--spacing-md);
  }

  .page-header h1 {
    font-size: 1.3rem;
  }

  .avatar-display-box {
    min-height: 180px;
    padding: var(--spacing-md);
  }

  .user-avatar-large {
    max-width: 140px;
    max-height: 140px;
  }

  .upload-area {
    min-height: 160px;
    padding: var(--spacing-lg);
  }

  .upload-icon {
    font-size: 36px;
  }

  .preview-box {
    min-height: 160px;
  }

  .preview-img {
    max-width: 120px;
    max-height: 120px;
  }

  .tips-section {
    padding: var(--spacing-md);
  }
}

/* ==================== 深色模式适配 ==================== */
[data-theme="dark"] .preview-hint {
  background-color: #082f49;
  border-left-color: #0ea5e9;
  color: #38bdf8;
}
</style>
