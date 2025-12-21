<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useNotesStore } from "@/stores/notes";
import { debounce } from "@/utils/helper";

const store = useNotesStore();
const activeNote = computed(() => store.notes.find(n => n.id === store.activeId) || null);

const editText = ref("");

// 当 activeNote 改变时把内容加载进编辑器
watch(activeNote, (n) => {
  editText.value = n ? n.content : "";
}, { immediate: true });

// 自动保存（去抖）——编辑停 800ms 保存一次
const save = debounce(() => {
  if (activeNote.value) store.updateContent(activeNote.value.id, editText.value);
}, 800);

// watch 编辑器内容触发保存
watch(editText, () => save());

// 渲染 HTML（安全过滤）
const rendered = computed(() => {
  return DOMPurify.sanitize(marked.parse(editText.value || ""));
});

// 初始化时绑定当前内容
onMounted(() => {
  editText.value = activeNote.value?.content ?? "";
});
</script>

<template>
  <div class="md-editor">
    <textarea v-model="editText" class="editor" placeholder="在此输入 Markdown（会自动保存）" />
    <div class="preview" v-html="rendered" />
  </div>
</template>

<style scoped>
.md-editor { display:flex; gap:12px; height:calc(100vh - 120px); }
.editor { flex:1; padding:12px; border:1px solid #ddd; border-radius:6px; resize:none; min-width:0; }
.preview { flex:1; padding:12px; border:1px solid #eee; border-radius:6px; background:#fafafa; overflow:auto; min-width:0; color: #000 !important; }
textarea.editor { height:100%; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Segoe UI Mono"; }
.preview :deep(*) { color: #000 !important; }
</style>
