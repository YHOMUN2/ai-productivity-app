<script setup>
import CaseConverter from "@/components/TextTools/CaseConverter.vue";
import JsonFormatter from "@/components/TextTools/JsonFormatter.vue";
import RegexTester from "@/components/TextTools/RegexTester.vue";
</script>

<template>
  <div style="padding:20px;">
    <h2>文本工具合集</h2>

    <div class="grid">
      <CaseConverter />
      <JsonFormatter />
      <RegexTester />
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 20px;
}
</style>
