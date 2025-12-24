<template>
  <div class="json-formatter-demo">
    <div class="demo-header">
      <h1>JSON 格式化工具</h1>
      <p class="demo-subtitle">支持格式化、压缩、错误定位和统计分析</p>
    </div>

    <div class="demo-container">
      <JsonFormatter />
    </div>

    <!-- 示例数据区 -->
    <div class="examples-section">
      <h2>📚 示例数据</h2>
      <div class="examples-grid">
        <div 
          v-for="(example, index) in examples"
          :key="index"
          class="example-card"
          @click="loadExample(example.data)"
        >
          <h4>{{ example.title }}</h4>
          <p class="example-description">{{ example.description }}</p>
          <div class="example-preview">{{ example.preview }}</div>
          <el-button type="text" size="small">加载示例</el-button>
        </div>
      </div>
    </div>

    <!-- 功能说明区 -->
    <div class="features-section">
      <h2>✨ 功能说明</h2>
      <div class="features-grid">
        <div class="feature-card">
          <h4>✓ 格式化</h4>
          <p>将压缩的 JSON 数据展开，支持 2 空格缩进，便于阅读</p>
        </div>
        <div class="feature-card">
          <h4>⊟ 压缩</h4>
          <p>移除所有空白符和换行，减小数据体积，加快传输</p>
        </div>
        <div class="feature-card">
          <h4>🔍 错误定位</h4>
          <p>准确指出 JSON 语法错误的行号和列号位置</p>
        </div>
        <div class="feature-card">
          <h4>📊 统计分析</h4>
          <p>显示数据类型、键数量、深度、数组元素等详细信息</p>
        </div>
        <div class="feature-card">
          <h4>📋 复制功能</h4>
          <p>一键复制格式化或压缩后的结果到剪贴板</p>
        </div>
        <div class="feature-card">
          <h4>🎨 主题适配</h4>
          <p>自动适配亮色和暗色主题，提供舒适的视觉体验</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import JsonFormatter from '@/components/JsonFormatter.vue';
import { ElMessage } from 'element-plus';

const examples = [
  {
    title: '简单对象',
    description: '基础的 JSON 对象示例',
    data: JSON.stringify({
      name: '张三',
      age: 28,
      email: 'zhangsan@example.com',
      address: {
        city: '北京',
        street: '中关村大街'
      }
    }),
    preview: '{ "name": "张三", "age": 28, ... }'
  },
  {
    title: '数组数据',
    description: '包含数组的复杂数据结构',
    data: JSON.stringify([
      { id: 1, title: 'JavaScript', tags: ['Web', 'Frontend'] },
      { id: 2, title: 'Python', tags: ['Backend', 'Data'] },
      { id: 3, title: 'Go', tags: ['Backend', 'DevOps'] }
    ]),
    preview: '[ { "id": 1, ... }, { "id": 2, ... }, ... ]'
  },
  {
    title: '嵌套结构',
    description: '多层级嵌套的复杂数据',
    data: JSON.stringify({
      project: {
        name: 'AI 效率工作台',
        version: '1.0.0',
        modules: [
          {
            name: '聊天模块',
            features: ['消息保存', '历史记录', '暗黑模式']
          },
          {
            name: '工具模块',
            features: ['JSON 格式化', '正则测试', '文本转换']
          }
        ]
      }
    }),
    preview: '{ "project": { "name": "...", ... } }'
  },
  {
    title: 'API 响应',
    description: '典型的 API 返回数据格式',
    data: JSON.stringify({
      code: 200,
      message: 'success',
      data: {
        total: 100,
        page: 1,
        items: [
          { id: 1, status: 'active', score: 95.5 },
          { id: 2, status: 'inactive', score: 87.0 }
        ]
      },
      timestamp: '2025-12-23T12:00:00Z'
    }),
    preview: '{ "code": 200, "message": "success", ... }'
  },
  {
    title: '错误示例',
    description: '演示错误检测和定位功能',
    data: '{ "name": "test", "age": 25, "invalid": undefined }',
    preview: '{ "name": "test", "age": 25, ... (错误) }'
  },
  {
    title: '大型数据',
    description: '包含多个对象的数据集',
    data: JSON.stringify({
      meta: { total: 1000, version: '1.0' },
      records: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Record ${i + 1}`,
        created: new Date().toISOString(),
        tags: ['tag1', 'tag2', 'tag3']
      }))
    }),
    preview: '{ "meta": { ... }, "records": [ ... ] }'
  }
];

function loadExample(data) {
  // 触发事件，由父级处理（在演示中直接显示消息）
  ElMessage.info('示例数据已加载，可复制到 JSON 格式化工具中使用');
  // 复制到剪贴板
  navigator.clipboard.writeText(data).then(() => {
    ElMessage.success('示例已复制到剪贴板');
  });
}
</script>

<style scoped>
/* ========== 页面容器 ========== */
.json-formatter-demo {
  background-color: var(--bg-base);
  min-height: 100vh;
}

/* ========== 标题区 ========== */
.demo-header {
  padding: var(--spacing-xl);
  text-align: center;
  background: linear-gradient(135deg, var(--accent-light, #e0e7ff), var(--bg-secondary));
  border-bottom: 1px solid var(--border-color);
}

.demo-header h1 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.demo-subtitle {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-secondary);
}

/* ========== 演示容器 ========== */
.demo-container {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

/* ========== 示例数据区 ========== */
.examples-section {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
  border-top: 1px solid var(--border-color);
}

.examples-section h2,
.features-section h2 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* ========== 示例网格 ========== */
.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.example-card {
  padding: var(--spacing-lg);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.example-card:hover {
  border-color: var(--accent-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.example-card h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.example-description {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.example-preview {
  padding: var(--spacing-sm);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========== 功能说明区 ========== */
.features-section {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
  border-top: 1px solid var(--border-color);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.feature-card {
  padding: var(--spacing-lg);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  border-color: var(--accent-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feature-card h4 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--accent);
}

.feature-card p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
  .demo-header {
    padding: var(--spacing-lg);
  }

  .demo-header h1 {
    font-size: 1.8rem;
  }

  .demo-subtitle {
    font-size: 0.95rem;
  }

  .demo-container,
  .examples-section,
  .features-section {
    padding: var(--spacing-lg);
  }

  .examples-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .demo-header h1 {
    font-size: 1.4rem;
  }

  .demo-container,
  .examples-section,
  .features-section {
    padding: var(--spacing-md);
  }
}
</style>
