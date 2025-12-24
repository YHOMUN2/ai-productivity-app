<template>
  <div class="standard-form-demo">
    <h1>StandardForm 组件演示</h1>
    
    <!-- 演示 1: 基础登录表单 -->
    <UICard 
      title="演示 1"
      sub="基础登录表单"
      class="demo-card"
    >
      <StandardForm 
        :model-value="loginForm"
        submitButtonText="登录"
        @submit="handleLoginSubmit"
        @reset="handleLoginReset"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
          />
        </el-form-item>
      </StandardForm>
    </UICard>

    <!-- 演示 2: 用户信息编辑表单 -->
    <UICard 
      title="演示 2"
      sub="用户信息编辑表单"
      class="demo-card"
    >
      <StandardForm 
        :model-value="userForm"
        submitButtonText="保存"
        resetButtonText="取消"
        label-width="120px"
        @submit="handleUserSubmit"
        @reset="handleUserReset"
      >
        <el-form-item label="姓名" prop="name">
          <el-input 
            v-model="userForm.name"
            placeholder="请输入姓名"
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="userForm.email"
            type="email"
            placeholder="请输入邮箱"
          />
        </el-form-item>

        <el-form-item label="部门" prop="department">
          <el-select 
            v-model="userForm.department"
            placeholder="请选择部门"
          >
            <el-option label="技术部" value="tech" />
            <el-option label="市场部" value="marketing" />
            <el-option label="运营部" value="operations" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remarks">
          <el-input 
            v-model="userForm.remarks"
            type="textarea"
            placeholder="请输入备注"
            rows="3"
          />
        </el-form-item>
      </StandardForm>
    </UICard>

    <!-- 演示 3: 加载状态与自定义按钮 -->
    <UICard 
      title="演示 3"
      sub="加载状态与自定义按钮"
      class="demo-card"
    >
      <StandardForm 
        :model-value="formData"
        submitButtonText="上传"
        :submit-loading="isSubmitting"
        :show-reset="false"
        label-width="100px"
        @submit="handleFileSubmit"
      >
        <el-form-item label="文件标题" prop="title">
          <el-input 
            v-model="formData.title"
            placeholder="请输入文件标题"
          />
        </el-form-item>

        <el-form-item label="文件" prop="file">
          <el-upload
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
          >
            <el-icon class="el-icon--upload">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </el-icon>
            <div class="el-upload__text">
              拖动文件到此处，或<em>点击上传</em>
            </div>
          </el-upload>
        </el-form-item>
      </StandardForm>
    </UICard>

    <!-- 演示 4: 不同尺寸 -->
    <UICard 
      title="演示 4"
      sub="不同尺寸表单"
      class="demo-card"
    >
      <div class="size-demo">
        <div class="size-item">
          <h4>大尺寸 (large)</h4>
          <StandardForm 
            :model-value="{ input: '' }"
            size="large"
            :show-reset="false"
            label-width="80px"
          >
            <el-form-item label="输入框">
              <el-input placeholder="大尺寸输入框" />
            </el-form-item>
          </StandardForm>
        </div>

        <div class="size-item">
          <h4>默认尺寸 (default)</h4>
          <StandardForm 
            :model-value="{ input: '' }"
            size="default"
            :show-reset="false"
            label-width="80px"
          >
            <el-form-item label="输入框">
              <el-input placeholder="默认尺寸输入框" />
            </el-form-item>
          </StandardForm>
        </div>

        <div class="size-item">
          <h4>小尺寸 (small)</h4>
          <StandardForm 
            :model-value="{ input: '' }"
            size="small"
            :show-reset="false"
            label-width="80px"
          >
            <el-form-item label="输入框">
              <el-input placeholder="小尺寸输入框" />
            </el-form-item>
          </StandardForm>
        </div>
      </div>
    </UICard>

    <!-- 消息反馈区 -->
    <div v-if="message" class="message-box" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StandardForm from '@/components/StandardForm.vue';
import UICard from '@/components/UICard.vue';

// 演示数据
const loginForm = ref({
  username: '',
  password: ''
});

const userForm = ref({
  name: '',
  email: '',
  department: '',
  remarks: ''
});

const formData = ref({
  title: '',
  file: null
});

// 消息反馈
const message = ref('');
const messageType = ref('');

// 登录表单提交
function handleLoginSubmit(data) {
  message.value = `登录成功！用户名: ${data.username}`;
  messageType.value = 'success';
  setTimeout(() => { message.value = ''; }, 3000);
}

// 登录表单重置
function handleLoginReset() {
  loginForm.value = { username: '', password: '' };
  message.value = '表单已重置';
  messageType.value = 'info';
  setTimeout(() => { message.value = ''; }, 2000);
}

// 用户信息提交
function handleUserSubmit(data) {
  message.value = `用户信息已保存：${data.name} (${data.email})`;
  messageType.value = 'success';
  setTimeout(() => { message.value = ''; }, 3000);
}

// 用户信息重置
function handleUserReset() {
  userForm.value = { name: '', email: '', department: '', remarks: '' };
  message.value = '编辑已取消';
  messageType.value = 'warning';
  setTimeout(() => { message.value = ''; }, 2000);
}

// 文件上传提交
const isSubmitting = ref(false);

function handleFileSubmit(data) {
  isSubmitting.value = true;
  // 模拟上传延迟
  setTimeout(() => {
    message.value = `文件 "${data.title}" 上传成功！`;
    messageType.value = 'success';
    isSubmitting.value = false;
    setTimeout(() => { message.value = ''; }, 3000);
  }, 1500);
}

function handleFileChange(file) {
  formData.value.file = file;
}
</script>

<style scoped>
.standard-form-demo {
  padding: var(--spacing-lg, 24px);
  background-color: var(--bg-base);
  min-height: 100vh;
}

.standard-form-demo h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg, 24px);
}

.demo-card {
  margin-bottom: var(--spacing-lg, 24px);
}

/* 尺寸演示容器 */
.size-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-md, 16px);
}

.size-item h4 {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm, 8px);
  font-weight: 600;
}

/* 消息提示框 */
.message-box {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: var(--radius-md, 4px);
  color: #ffffff;
  font-size: 14px;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.message-box.success {
  background-color: #67c23a;
}

.message-box.error {
  background-color: #f56c6c;
}

.message-box.warning {
  background-color: #e6a23c;
}

.message-box.info {
  background-color: #409eff;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .standard-form-demo {
    padding: var(--spacing-md, 16px);
  }

  .standard-form-demo h1 {
    font-size: 24px;
  }

  .size-demo {
    grid-template-columns: 1fr;
  }
}
</style>
