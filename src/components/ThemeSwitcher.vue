<script setup>
import { useThemeStore } from "@/stores/theme";
const theme = useThemeStore();

function toggle() {
  theme.toggle();
}
</script>

<template>
  <button class="theme-btn" @click="toggle">
    {{ theme.theme === "light" ? "🌙" : "☀️" }}
  </button>
</template>

<style scoped>
.theme-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: var(--primary);
  color: #fff;
}
</style>
