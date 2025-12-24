<template>
  <div class="json-formatter">
    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="formatJSON" :loading="formatting">
          ✓ 格式化
        </el-button>
        <el-button @click="compressJSON">
          ⊟ 压缩
        </el-button>
        <el-button @click="copyToClipboard" :disabled="!outputValue">
          📋 复制
        </el-button>
        <el-button @click="clearAll">
          🗑️ 清空
        </el-button>
      </div>
      <div class="toolbar-right">
        <span class="stat-text">{{ inputLines }} 行 / {{ inputSize }}</span>
      </div>
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="error"
      type="error"
      :title="error.title"
      :description="error.message"
      :closable="true"
      @close="error = null"
      class="error-alert"
    />

    <!-- 成功提示 -->
    <el-alert
      v-if="success"
      type="success"
      :title="success.title"
      :description="success.message"
      :closable="true"
      @close="success = null"
      class="success-alert"
    />

    <!-- 输入输出区域 -->
    <div class="editor-layout">
      <!-- 输入区 -->
      <div class="editor-section">
        <div class="section-header">
          <h3>📥 输入 JSON</h3>
          <span class="section-hint">粘贴或输入 JSON 数据</span>
        </div>
        <el-input
          v-model="inputValue"
          type="textarea"
          placeholder="在此粘贴或输入 JSON 数据..."
          :rows="20"
          class="json-input"
        />
      </div>

      <!-- 输出区 -->
      <div class="editor-section">
        <div class="section-header">
          <h3>📤 输出 JSON</h3>
          <span class="section-hint">{{ outputMode }}</span>
        </div>
        <el-input
          v-model="outputValue"
          type="textarea"
          placeholder="格式化结果将显示在此..."
          :rows="20"
          class="json-output"
          readonly
        />
      </div>
    </div>

    <!-- 详细信息区 -->
    <div v-if="jsonStats" class="stats-panel">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">有效 JSON</span>
          <span class="stat-value" :style="{ color: jsonStats.isValid ? 'var(--success)' : 'var(--error)' }">
            {{ jsonStats.isValid ? '✓ 是' : '✗ 否' }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">数据类型</span>
          <span class="stat-value">{{ jsonStats.type }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">键数量</span>
          <span class="stat-value">{{ jsonStats.keyCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">深度</span>
          <span class="stat-value">{{ jsonStats.depth }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">数组元素</span>
          <span class="stat-value">{{ jsonStats.arrayCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">压缩率</span>
          <span class="stat-value">{{ jsonStats.compressionRate }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

const inputValue = ref('');
const outputValue = ref('');
const error = ref(null);
const success = ref(null);
const formatting = ref(false);
const outputMode = ref('格式化');

// 计算输入行数和大小
const inputLines = computed(() => {
  return inputValue.value.split('\n').length;
});

const inputSize = computed(() => {
  const bytes = new Blob([inputValue.value]).size;
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
});

// 解析 JSON 并获取统计信息
function analyzeJSON(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    
    // 计算统计信息
    let keyCount = 0;
    let depth = 0;
    let arrayCount = 0;

    function traverse(obj, currentDepth = 0) {
      depth = Math.max(depth, currentDepth);
      
      if (Array.isArray(obj)) {
        arrayCount += obj.length;
        obj.forEach(item => traverse(item, currentDepth + 1));
      } else if (obj !== null && typeof obj === 'object') {
        keyCount += Object.keys(obj).length;
        Object.values(obj).forEach(value => traverse(value, currentDepth + 1));
      }
    }

    traverse(parsed);

    const formattedSize = new Blob([JSON.stringify(parsed, null, 2)]).size;
    const compressedSize = new Blob([JSON.stringify(parsed)]).size;
    const compressionRate = Math.round((1 - compressedSize / formattedSize) * 100);

    return {
      isValid: true,
      type: Array.isArray(parsed) ? '数组' : typeof parsed,
      keyCount,
      depth,
      arrayCount,
      compressionRate: compressionRate > 0 ? compressionRate : 0,
    };
  } catch (e) {
    return {
      isValid: false,
      type: '无效',
      keyCount: 0,
      depth: 0,
      arrayCount: 0,
      compressionRate: 0,
    };
  }
}

// 计算统计信息
const jsonStats = computed(() => {
  if (!outputValue.value) return null;
  return analyzeJSON(outputValue.value);
});

// 格式化 JSON
function formatJSON() {
  if (!inputValue.value.trim()) {
    error.value = {
      title: '输入为空',
      message: '请先输入 JSON 数据',
    };
    return;
  }

  formatting.value = true;
  try {
    const parsed = JSON.parse(inputValue.value);
    outputValue.value = JSON.stringify(parsed, null, 2);
    outputMode.value = '格式化';
    error.value = null;
    success.value = {
      title: '格式化成功',
      message: `输出 ${outputValue.value.split('\n').length} 行`,
    };
  } catch (e) {
    error.value = {
      title: 'JSON 解析错误',
      message: `${e.message}\n${getErrorLocation(e, inputValue.value)}`,
    };
  } finally {
    formatting.value = false;
  }
}

// 获取错误位置信息
function getErrorLocation(error, jsonStr) {
  const match = error.message.match(/position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    const lines = jsonStr.substring(0, pos).split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    return `错误位置：第 ${line} 行，第 ${col} 列`;
  }
  return '';
}

// 压缩 JSON
function compressJSON() {
  if (!inputValue.value.trim()) {
    error.value = {
      title: '输入为空',
      message: '请先输入 JSON 数据',
    };
    return;
  }

  try {
    const parsed = JSON.parse(inputValue.value);
    outputValue.value = JSON.stringify(parsed);
    outputMode.value = '压缩';
    error.value = null;
    success.value = {
      title: '压缩成功',
      message: `输出 ${outputValue.value.length} 个字符`,
    };
  } catch (e) {
    error.value = {
      title: 'JSON 解析错误',
      message: e.message,
    };
  }
}

// 复制到剪贴板
function copyToClipboard() {
  if (!outputValue.value) return;
  
  navigator.clipboard.writeText(outputValue.value).then(() => {
    ElMessage.success('已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败，请手动选择复制');
  });
}

// 清空所有
function clearAll() {
  inputValue.value = '';
  outputValue.value = '';
  error.value = null;
  success.value = null;
  outputMode.value = '格式化';
}
</script>

<style scoped>
/* ========== 容器 ========== */
.json-formatter {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

/* ========== 操作栏 ========== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.toolbar-left {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  gap: var(--spacing-md);
}

.stat-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* ========== 提示框 ========== */
.error-alert,
.success-alert {
  margin-bottom: var(--spacing-md);
}

/* ========== 编辑器布局 ========== */
.editor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  min-height: 500px;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  background-color: var(--bg-surface);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.section-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 400;
}

/* ========== 输入输出样式 ========== */
.json-input,
.json-output {
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
}

.json-input :deep(.el-textarea__inner) {
  background-color: var(--bg-base);
  color: var(--text-primary);
  border-color: var(--border-color);
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
}

.json-output :deep(.el-textarea__inner) {
  background-color: var(--bg-base);
  color: var(--text-primary);
  border-color: var(--border-color);
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
}

.json-output :deep(.el-textarea__inner:focus) {
  border-color: var(--accent-light);
}

/* ========== 统计面板 ========== */
.stats-panel {
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background-color: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent);
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
}

/* ========== 响应式设计 ========== */
@media (max-width: 1024px) {
  .editor-layout {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .json-input,
  .json-output {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .json-formatter {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    width: 100%;
  }

  .toolbar-left :deep(.el-button) {
    flex: 1;
  }

  .toolbar-right {
    justify-content: center;
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-left :deep(.el-button) {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
}
</style>
