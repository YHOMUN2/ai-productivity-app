<script setup>
import { useThemeStore } from "@/stores/theme";
import { useRouter } from "vue-router";

const router = useRouter();
const theme = useThemeStore();

function goto(path) {
  router.push(path);
}
</script>

<template>
  <div class="home">


    <!-- 卡片区域 -->
    <section class="cards">

      <div class="card" @click="goto('/ai')">
        <h2>🤖 AI 小助手</h2>
        <p>对话、辅助、生成内容。支持历史记录与自动滚动。</p>
      </div>

      <div class="card" @click="goto('/note')">
        <h2>📝 Markdown 笔记</h2>
        <p>编辑器 + 实时预览 + 本地保存 + 暗黑适配。</p>
      </div>

      <div class="card" @click="goto('/tools')">
        <h2>🧰 文本工具箱</h2>
        <p>JSON 格式化 / 正则 / 大小写转换，一站式处理。</p>
      </div>

      <div class="card" @click="goto('/pdf')">
        <h2>📄 PDF 文本提取</h2>
        <p>前端解析 PDF，并动态渲染文本。</p>
      </div>


    </section>

  </div>
</template>

<style scoped>
.home {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 顶部标题 */
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: var(--text);
}

/* 卡片布局 */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 22px;
}

/* 单个卡片 */
.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  padding: 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 5px 18px rgba(0,0,0,0.12);
}

.card h2 {
  margin: 0 0 10px;
  font-size: 20px;
  color: var(--text);
}

.card p {
  margin: 0;
  color: var(--text);
  opacity: 0.7;
}


</style>
