<template>
  <div class="demo-container">
    <h1>UICard 组件演示</h1>
    
    <!-- 小尺寸卡片 -->
    <section class="demo-section">
      <h2>小尺寸卡片 (size="small")</h2>
      <div class="demo-grid">
        <UICard 
          title="小标题"
          sub="副标题"
          size="small"
        >
          <p>这是一个小尺寸卡片，用于简洁展示内容。</p>
        </UICard>

        <UICard 
          title="紧凑卡片"
          size="small"
        >
          <p>无副标题的小卡片。</p>
        </UICard>
      </div>
    </section>

    <!-- 正常尺寸卡片（默认） -->
    <section class="demo-section">
      <h2>正常尺寸卡片 (size="normal"，默认)</h2>
      <div class="demo-grid">
        <UICard 
          title="标准卡片"
          sub="副标题说明"
        >
          <p>这是默认大小的卡片，适合展示主要内容。</p>
        </UICard>

        <UICard 
          title="带按钮的卡片"
          sub="可交互的卡片"
        >
          <p>卡片内容</p>
          <template #footer>
            <el-button type="primary">保存</el-button>
            <el-button>取消</el-button>
          </template>
        </UICard>
      </div>
    </section>

    <!-- 大尺寸卡片 -->
    <section class="demo-section">
      <h2>大尺寸卡片 (size="large")</h2>
      <div class="demo-grid-single">
        <UICard 
          title="大标题"
          sub="这是一个大尺寸的卡片，用于强调重要内容"
          size="large"
        >
          <p>大尺寸卡片提供更多空间来展示内容。可以用于仪表板的主要部分。</p>
          <p>支持灵活的内容布局。</p>
          <template #footer>
            <el-button type="primary">操作</el-button>
          </template>
        </UICard>
      </div>
    </section>

    <!-- 无标题卡片 -->
    <section class="demo-section">
      <h2>无标题卡片</h2>
      <div class="demo-grid">
        <UICard>
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 2rem; margin-bottom: 10px;">📊</div>
            <p>无标题的自定义内容卡片</p>
          </div>
        </UICard>
      </div>
    </section>

    <!-- 响应式演示 -->
    <section class="demo-section">
      <h2>响应式设计演示</h2>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">
        调整窗口大小观察卡片的响应式变化（断点：768px, 480px）
      </p>
      <div class="demo-grid">
        <UICard 
          title="卡片 1"
          sub="响应式内容"
        >
          <p>在大屏幕上，卡片并排显示。</p>
        </UICard>
        <UICard 
          title="卡片 2"
          sub="响应式内容"
        >
          <p>在小屏幕上，卡片堆叠显示。</p>
        </UICard>
        <UICard 
          title="卡片 3"
          sub="响应式内容"
        >
          <p>在超小屏幕上，padding 缩小。</p>
        </UICard>
      </div>
    </section>

    <!-- 主题适配演示 -->
    <section class="demo-section">
      <h2>主题适配</h2>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">
        使用页面右上角的主题切换器改变卡片样式（支持亮暗模式）
      </p>
      <div class="demo-grid">
        <UICard 
          title="亮暗模式适配"
          sub="会自动适应当前主题"
        >
          <p style="color: var(--text-primary);">
            卡片使用 CSS 变量，自动适应亮暗模式。
          </p>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            背景、文字、边框都会自动变化。
          </p>
        </UICard>
      </div>
    </section>
  </div>
</template>

<script setup>
import UICard from "@/components/UICard.vue";
</script>

<style scoped>
.demo-container {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.demo-container h1 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.demo-section {
  margin-bottom: var(--spacing-xl);
}

.demo-section h2 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--accent-light);
  padding-bottom: var(--spacing-md);
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.demo-grid-single {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

/* 响应式 */
@media (max-width: 768px) {
  .demo-container {
    padding: var(--spacing-md);
  }

  .demo-container h1 {
    font-size: 1.5rem;
  }

  .demo-section h2 {
    font-size: 1.2rem;
  }

  .demo-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .demo-container {
    padding: var(--spacing-sm);
  }

  .demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
