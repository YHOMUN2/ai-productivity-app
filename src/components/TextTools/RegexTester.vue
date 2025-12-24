<script setup>
import { ref, computed } from "vue";

const pattern = ref("");
const flags = ref("g");
const text = ref("");

const result = computed(() => {
  if (!pattern.value) return "";
  try {
    const reg = new RegExp(pattern.value, flags.value);
    const matches = text.value.match(reg);
    return matches ? matches.join("\n") : "无匹配结果";
  } catch (err) {
    return "❌ 正则表达式错误：" + err.message;
  }
});
</script>

<template>
  <div class="tool-card">
    <h3 style="color: #000 !important;">正则表达式测试器</h3>

    <div class="row">
      <input v-model="pattern" placeholder="正则表达式，如：\\d+" />
      <input v-model="flags" placeholder="标志，如：g i m" style="width: 60px;text-align:center;" />
    </div>

    <textarea v-model="text" placeholder="待匹配的文本"></textarea>

    <div class="result-box">
      <strong style="color: #000 !important;">匹配结果：</strong>
      <pre>{{ result }}</pre>
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
  height: 100px;
  margin: 8px 0;
}

html[data-theme="dark"] textarea {
  background: #8DA9C4;
}

.row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.result-box {
  background: #fff;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 6px;
  min-height: 60px;
}

html[data-theme="dark"] .result-box {
  background: #8DA9C4;
}
</style>
