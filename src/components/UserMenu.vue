<template>
  <!-- 用户菜单卡片 -->
  <el-dropdown
    ref="dropdownRef"
    trigger="click"
    @command="handleMenuCommand"
    @visible-change="handleVisibleChange"
    placement="bottom-end"
  >
    <!-- 触发器：用户头像 -->
    <template #default>
      <div class="user-avatar-wrapper" :title="`已登录: ${userStore.userEmail}`">
        <img
          :src="userStore.userAvatar"
          :alt="userStore.userName"
          class="user-avatar"
        />
      </div>
    </template>

    <!-- 菜单内容 -->
    <template #dropdown>
      <div class="user-menu-card">
        <!-- 用户信息区 -->
        <div class="user-info-section">
          <img
            :src="userStore.userAvatar"
            :alt="userStore.userName"
            class="user-avatar-large"
          />
          <div class="user-details">
            <div class="user-name">{{ userStore.userName }}</div>
            <div class="user-email">{{ userStore.userEmail }}</div>
          </div>
        </div>

        <!-- 分割线 -->
        <div class="menu-divider"></div>

        <!-- 菜单项 -->
        <el-dropdown-item
          command="profile"
          class="menu-item"
        >
          <el-icon><User /></el-icon>
          <span class="menu-text">个人资料</span>
        </el-dropdown-item>

        <el-dropdown-item
          command="avatar"
          class="menu-item"
        >
          <el-icon><Picture /></el-icon>
          <span class="menu-text">修改头像</span>
        </el-dropdown-item>

        <el-dropdown-item
          command="settings"
          class="menu-item"
        >
          <el-icon><Setting /></el-icon>
          <span class="menu-text">设置</span>
        </el-dropdown-item>

        <!-- 分割线 -->
        <div class="menu-divider"></div>

        <!-- 退出登录 -->
        <el-dropdown-item
          command="logout"
          class="menu-item logout-item"
        >
          <el-icon><SwitchButton /></el-icon>
          <span class="menu-text">退出登录</span>
        </el-dropdown-item>
      </div>
    </template>
  </el-dropdown>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, Picture, Setting, SwitchButton } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const dropdownRef = ref(null);

/**
 * 处理菜单命令
 * @param {string} command - 菜单项命令
 */
async function handleMenuCommand(command) {
  switch (command) {
    case 'profile':
      handleProfile();
      break;
    case 'avatar':
      handleChangeAvatar();
      break;
    case 'settings':
      handleSettings();
      break;
    case 'logout':
      handleLogout();
      break;
    default:
      break;
  }
}

/**
 * 处理个人资料
 */
function handleProfile() {
  router.push('/profile');
}

/**
 * 处理修改头像
 */
async function handleChangeAvatar() {
  // 创建 file input 元素
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // 读取文件为 Data URL（简单方案，实际项目应上传到服务器）
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        userStore.updateAvatar(dataUrl);
        ElMessage.success('头像更新成功');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      ElMessage.error('头像上传失败');
    }
  };
  
  input.click();
}

/**
 * 处理设置
 */
function handleSettings() {
  router.push('/settings');
}

/**
 * 处理退出登录
 */
async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // 执行退出登录
    const { success, error } = await userStore.logout();
    
    if (success) {
      ElMessage.success('已退出登录');
      // 跳转到登录页
      router.push('/login');
    } else {
      ElMessage.error(error || '退出登录失败');
    }
  } catch (err) {
    // 用户取消确认
  }
}

/**
 * 处理菜单可见性变化
 */
function handleVisibleChange(visible) {
  // 可选：在这里处理菜单打开/关闭的其他逻辑
  if (visible) {
    // 菜单打开
  } else {
    // 菜单关闭
  }
}
</script>

<style scoped>
/* ==================== 用户头像包装器 ==================== */
.user-avatar-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: linear-gradient(135deg, var(--primary), #10b981);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar-wrapper:hover {
  transform: scale(1.05);
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* ==================== 用户菜单卡片 ==================== */
.user-menu-card {
  width: 280px;
  padding: 16px;
  background: #ffffff; /* 背景色 */
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  color: #ffffff;
}

/* ==================== 用户信息区 ==================== */
.user-info-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
}

.user-avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary);
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  font-size: 12px;
  color: #000000;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 4px;
}

/* ==================== 菜单项 ==================== */
.menu-item {
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
}

.menu-item:hover {
  background: color-mix(in srgb, var(--primary) 10%, transparent);
  color: var(--primary);
}

.menu-item .menu-text {
  color: #696969;
}

.menu-item:hover .menu-text {
  color: var(--primary);
}

/* 退出登录按钮样式 */
.logout-item {
  color: #f56c6c;
  margin-top: 4px;
}

.logout-item:hover {
  background: color-mix(in srgb, #f56c6c 10%, transparent);
  color: #f56c6c;
}

/* 菜单分割线 */
.menu-divider {
  height: 1px;
  background: var(--border);
  margin: 8px 0;
}

/* ==================== 图标样式 ==================== */
.menu-item :deep(.el-icon) {
  width: 16px;
  height: 16px;
  font-size: 16px;
  
}

/* ==================== 响应式调整 ==================== */
@media (max-width: 768px) {
  .user-avatar-wrapper {
    width: 36px;
    height: 36px;
  }

  .user-menu-card {
    width: 260px;
  }
}

/* ==================== 深色主题适配 ==================== */
html[data-theme="dark"] .user-menu-card {
  background: #ffffff;
  border-color: var(--border);
  color: #ffffff;
}



html[data-theme="dark"] .menu-item:hover {
  background: color-mix(in srgb, var(--primary) 15%, transparent);
}
</style>
