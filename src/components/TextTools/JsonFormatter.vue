<script setup>
import { ref } from "vue";

const input = ref("");
const output = ref("");

function formatJSON() {
  try {
    output.value = JSON.stringify(JSON.parse(input.value), null, 2);
  } catch (err) {
    output.value = "❌ JSON 格式错误：" + err.message;
  }
}

function compressJSON() {
  try {
    output.value = JSON.stringify(JSON.parse(input.value));
  } catch (err) {
    output.value = "❌ JSON 格式错误：" + err.message;
  }
}
</script>

<template>
  <div class="tool-card">
    <h3 style="color: #000 !important;">JSON 格式化</h3>
    <textarea v-model="input" placeholder="输入 JSON 内容"></textarea>

    <div class="buttons">
      <button @click="formatJSON">格式化</button>
      <button @click="compressJSON">压缩</button>
    </div>

    <textarea v-model="output" placeholder="输出结果"></textarea>
  </div>
</template>

<style scoped>
.tool-card {
  border: 1px solid #eee;
  padding: 12px;
  border-radius: 8px;
  background: #fafafa;
}

textarea {
  width: 100%;
  height: 120px;
  margin-bottom: 10px;
  padding: 8px;
}

.buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
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
