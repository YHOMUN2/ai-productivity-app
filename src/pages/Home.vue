<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useThemeStore } from "@/stores/theme";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabaseClient";
import UICard from "@/components/UICard.vue";
import QuickAccessCard from "@/components/QuickAccessCard.vue";

const router = useRouter();
const theme = useThemeStore();
const instruments = ref([]);
const loading = ref(false);
const error = ref(null);

// 快速入口卡片配置
const quickAccessItems = [
  {
    id: 'ai',
    title: '🤖 AI 小助手',
    sub: '智能对话与内容生成',
    description: '与 AI 进行自然对话，获得智能辅助。支持对话历史记录、消息保存和暗黑模式。',
    path: '/ai-assistant',
    shortcut: '1', // Alt+1
  },
  {
    id: 'notes',
    title: '📝 Markdown 笔记',
    sub: '编辑与预览一体',
    description: '支持 Markdown 编辑、实时预览、本地自动保存，随时随地记录想法。',
    path: '/notes',
    shortcut: '2', // Alt+2
  },
  {
    id: 'tools',
    title: '🧰 文本工具',
    sub: 'JSON / 正则 / 转换',
    description: 'JSON 格式化、正则表达式测试、文本大小写转换，一站式文本处理。',
    path: '/tools',
    shortcut: '3', // Alt+3
  },
  {
    id: 'pdf',
    title: '📄 PDF 提取',
    sub: '文本识别与分析',
    description: '上传 PDF 文件进行文本提取，支持 OCR 识别，智能分析文档内容。',
    path: '/pdf',
    shortcut: '4', // Alt+4
  },
];

function goto(path) {
  router.push(path);
}

// 全局键盘快捷键处理
function handleGlobalKeydown(event) {
  // 检查是否按下了 Alt 键
  if (!event.altKey) return;

  // 匹配 Alt+1/2/3/4 快捷键
  const num = event.key;
  if (['1', '2', '3', '4'].includes(num)) {
    event.preventDefault();
    const index = parseInt(num) - 1;
    if (index < quickAccessItems.length) {
      router.push(quickAccessItems[index].path);
    }
  }
}

/**
 * 示例：从 Supabase 查询数据
 * 注意：需要先在 Supabase 中创建 'instruments' 表
 * 如果表不存在，会显示友好的错误提示
 */
async function getInstruments() {
  loading.value = true;
  error.value = null;
  
  try {
    const { data, error: err } = await supabase
      .from("instruments")
      .select("*");
    
    if (err) {
      console.error("❌ 查询失败:", err.message);
      
      // 如果是表不存在的错误，显示友好提示
      if (err.message.includes("Could not find the table")) {
        error.value = "instruments 表还未创建。请在 Supabase 中创建此表。";
      } else {
        error.value = err.message;
      }
    } else {
      instruments.value = data || [];
      console.log("✅ 查询成功:", instruments.value);
    }
  } catch (err) {
    console.error("❌ 异常:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getInstruments();
  
  // 添加全局键盘事件监听（快捷键导航）
  window.addEventListener('keydown', handleGlobalKeydown);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<template>
  <div class="home">
    <!-- 首页标题 -->
    <div class="home-header">
      <h1>欢迎使用 AI 效率工作台</h1>
      <p class="home-subtitle">一站式效率提升工具集</p>
    </div>

    <!-- 主要内容 + 侧边栏 2 列布局 -->
    <div class="home-layout">
      <!-- 左侧：主要内容（70%） -->
      <main class="home-main">
        <!-- 快速入口卡片（主要功能区） -->
        <section class="quick-access-section">
          <h2>快速入口</h2>
          <div class="quick-access-cards">
            <!-- 使用 QuickAccessCard 组件实现键盘可访问性 -->
            <QuickAccessCard
              v-for="item in quickAccessItems"
              :key="item.id"
              :title="item.title"
              :sub="item.sub"
              :description="item.description"
              :path="item.path"
            />
          </div>
        </section>

        <!-- 数据演示区（次要内容区） -->
        <section class="data-section">
          <h2>数据中心</h2>
          <UICard 
            title="📊 Supabase 集成示例"
            sub="instruments 表数据预览"
            size="normal"
            class="secondary-card"
          >
            <div v-if="loading" class="state-message loading">
              ⏳ 加载中...
            </div>
            
            <div v-else-if="error" class="state-message error">
              <div>
                <strong>❌ 错误:</strong> {{ error }}
              </div>
              <el-button type="primary" size="small" @click="getInstruments">
                🔄 重试
              </el-button>
            </div>
            
            <div v-else>
              <div v-if="instruments.length === 0" class="state-message empty">
                📝 instruments 表暂无数据
                <p style="margin-top: 8px; opacity: 0.7; font-size: 0.85rem;">
                  在 Supabase 中创建 instruments 表后，可查看数据。
                </p>
              </div>
              
              <div v-else>
                <div class="instruments-list">
                  <div 
                    v-for="instrument in instruments" 
                    :key="instrument.id" 
                    class="instrument-item"
                  >
                    <span class="instrument-name">{{ instrument.name }}</span>
                    <span class="instrument-id" v-if="instrument.id">ID: {{ instrument.id }}</span>
                  </div>
                </div>
                <div class="data-count">
                  共 {{ instruments.length }} 条记录
                </div>
              </div>
            </div>
          </UICard>
        </section>
      </main>

      <!-- 右侧：侧边栏（30%） -->
      <aside class="home-sidebar">
        <!-- 统计信息卡片 -->
        <UICard 
          title="📈 统计概览"
          size="small"
          class="sidebar-card"
        >
          <div class="stat-item">
            <div class="stat-label">快速入口</div>
            <div class="stat-value">4</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">数据记录</div>
            <div class="stat-value">{{ instruments.length }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">工具集合</div>
            <div class="stat-value">8+</div>
          </div>
        </UICard>

        <!-- 快速导航卡片 -->
        <UICard 
          title="🔗 快速导航"
          size="small"
          class="sidebar-card"
        >
          <div class="nav-item" @click="goto('/ai-assistant')" tabindex="0" @keydown.enter="goto('/ai-assistant')" role="button" aria-label="快速导航到 AI 助手，快捷键 Alt+1">
            <span class="nav-icon">🤖</span>
            <span>AI 助手</span>
            <span class="nav-shortcut">Alt+1</span>
          </div>
          <div class="nav-item" @click="goto('/notes')" tabindex="0" @keydown.enter="goto('/notes')" role="button" aria-label="快速导航到笔记，快捷键 Alt+2">
            <span class="nav-icon">📝</span>
            <span>笔记</span>
            <span class="nav-shortcut">Alt+2</span>
          </div>
          <div class="nav-item" @click="goto('/tools')" tabindex="0" @keydown.enter="goto('/tools')" role="button" aria-label="快速导航到工具，快捷键 Alt+3">
            <span class="nav-icon">🧰</span>
            <span>工具</span>
            <span class="nav-shortcut">Alt+3</span>
          </div>
          <div class="nav-item" @click="goto('/pdf')" tabindex="0" @keydown.enter="goto('/pdf')" role="button" aria-label="快速导航到 PDF，快捷键 Alt+4">
            <span class="nav-icon">📄</span>
            <span>PDF</span>
            <span class="nav-shortcut">Alt+4</span>
          </div>
        </UICard>

        <!-- 提示信息卡片 -->
        <UICard 
          title="💡 使用提示"
          size="small"
          class="sidebar-card info-card"
        >
          <ul class="tips-list">
            <li>快捷键导航：Alt+1/2/3/4</li>
            <li>Tab 键可聚焦卡片，Enter 触发</li>
            <li>支持亮色和暗色模式</li>
            <li>数据实时同步至云端</li>
          </ul>
        </UICard>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* ========== 页面容器 ========== */
.home {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* ========== 页面标题区 ========== */
.home-header {
  margin-bottom: var(--spacing-sm);
}

.home-header h1 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.home-subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 400;
}

/* ========== 2 列主布局 ========== */
.home-layout {
  display: grid;
  grid-template-columns: 1fr 0.42fr;
  gap: var(--spacing-xl);
  grid-auto-rows: max-content;
}

.home-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.home-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* ========== 快速入口区域（主内容） ========== */
.quick-access-section {
  /* 主要内容区 */
}

.quick-access-section h2 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 快速入口卡片网格 */
.quick-access-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-md);
}

/* 主要卡片样式（更高对比、更强阴影） */
.primary-card {
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.primary-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg) !important;
  border-color: var(--accent-light);
}

.quick-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* ========== 数据演示区域（主内容） ========== */
.data-section {
  /* 次要内容区 */
}

.data-section h2 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 次要卡片样式（低对比、轻阴影） */
.secondary-card {
  cursor: default;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-color);
  opacity: 0.85;
  box-shadow: var(--shadow-sm);
}

.secondary-card:hover {
  opacity: 1;
  box-shadow: var(--shadow-md);
}

/* ========== 侧边栏卡片样式 ========== */
.sidebar-card {
  cursor: default;
  border: 1px solid var(--border-color);
  opacity: 0.9;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.sidebar-card:hover {
  opacity: 1;
  transform: none;
  box-shadow: var(--shadow-md);
}

/* ========== 统计概览卡片 ========== */
.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
}

/* ========== 快速导航卡片 ========== */
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  margin: var(--spacing-xs) 0;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 120ms cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-primary);
  font-size: 0.95rem;
  user-select: none;
  outline: none;
}

.nav-item:hover {
  background-color: var(--bg-secondary);
  color: var(--accent);
  transform: translateX(4px);
}

/* 键盘焦点状态 */
.nav-item:focus {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.nav-item:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
  background-color: var(--bg-secondary);
  color: var(--accent);
}

.nav-icon {
  font-size: 1.1rem;
  min-width: 20px;
}

/* 快捷键提示文本 */
.nav-shortcut {
  margin-left: auto;
  padding-left: var(--spacing-sm);
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.7;
  white-space: nowrap;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  background-color: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 3px;
  transition: all 120ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover .nav-shortcut,
.nav-item:focus-visible .nav-shortcut {
  opacity: 1;
  background-color: var(--accent-light);
  color: var(--accent);
}

/* ========== 提示信息卡片 ========== */
.info-card {
  background: linear-gradient(
    135deg,
    var(--accent-light, #818cf8) 0%,
    var(--bg-surface) 100%
  );
  opacity: 1;
}

.tips-list {
  margin: 0;
  padding-left: var(--spacing-md);
  list-style: none;
}

.tips-list li {
  padding: var(--spacing-xs) 0;
  color: var(--text-primary);
  font-size: 0.85rem;
  line-height: 1.4;
  position: relative;
  padding-left: var(--spacing-md);
}

.tips-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-weight: bold;
}

/* ========== 状态消息 ========== */
.state-message {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.state-message.loading {
  flex-direction: column;
  font-size: 1rem;
  color: var(--accent);
}

.state-message.empty {
  flex-direction: column;
  align-items: center;
}

.state-message.error {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--error);
  font-weight: 500;
  border: 1px solid var(--error);
}

.state-message.error div {
  flex: 1;
  text-align: left;
}

/* ========== 数据列表 ========== */
.instruments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.instrument-item {
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.instrument-item:hover {
  background-color: var(--accent-light, #f5f3ff);
  border-color: var(--accent-light);
}

.instrument-name {
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

.instrument-id {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  opacity: 0.7;
}

.data-count {
  margin-top: var(--spacing-md);
  text-align: right;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* ========== 响应式设计 ========== */
@media (max-width: 1280px) {
  .home-layout {
    grid-template-columns: 1fr 0.5fr;
    gap: var(--spacing-lg);
  }
}

@media (max-width: 1024px) {
  .home-layout {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .home-sidebar {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-card {
    flex: 1;
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .home {
    gap: var(--spacing-md);
  }

  .home-header h1 {
    font-size: 1.5rem;
  }

  .home-subtitle {
    font-size: 0.9rem;
  }

  .quick-access-section h2,
  .data-section h2 {
    font-size: 1.1rem;
  }

  .quick-access-cards {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .home-sidebar {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .sidebar-card {
    flex: none;
  }

  .state-message {
    flex-direction: column;
    align-items: flex-start;
  }

  .state-message.error {
    gap: var(--spacing-sm);
  }

  .instrument-item {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .home-header h1 {
    font-size: 1.3rem;
  }

  .quick-access-cards {
    gap: var(--spacing-sm);
  }

  .stat-item,
  .nav-item {
    padding: var(--spacing-xs);
  }
}
</style>
