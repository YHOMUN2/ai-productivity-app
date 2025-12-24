<script setup>
import { ref } from "vue";

const text = ref("");

function toUpper() {
  text.value = text.value.toUpperCase();
}

function toLower() {
  text.value = text.value.toLowerCase();
}

function capitalize() {
  text.value = text.value.replace(/\b\w/g, c => c.toUpperCase());
}
</script>

<template>
  <div class="tool-card">
    <h3 style="color: #000 !important;">大小写转换</h3>

    <textarea v-model="text" placeholder="输入文本..."></textarea>

    <div class="buttons">
      <button @click="toUpper">UPPER</button>
      <button @click="toLower">lower</button>
      <button @click="capitalize">Capitalize Words</button>
    </div>
  </div>
</template>

<style scoped>
.tool-card {
  border: 1px solid #eee;
  padding: 12px;
  border-radius: 8px;
  background: #fafafa;
}

html[data-theme="dark"] .tool-card {
  background: #13315C;
}

textarea {
  width: 100%;
  height: 120px;
  margin-bottom: 10px;
  padding: 8px;
}

html[data-theme="dark"] textarea {
  background: #8DA9C4;
}

.buttons {
  display: flex;
  gap: 10px;
}

button {
  padding: 6px 14px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
