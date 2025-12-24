<script setup>
import { computed, ref } from "vue";
import { useNotesStore } from "@/stores/notes";
import MarkdownEditor from "@/components/MarkdownEditor.vue";

const store = useNotesStore();
const newTitle = ref("");

// 选择笔记
function select(note) {
  store.setActive(note.id);
}

// 新建并重命名
function create() {
  const id = store.newNote();
  // 给用户直接编辑标题的机会（简单处理）
  setTimeout(() => {
    // focus 操作可在更复杂的实现里做
  }, 50);
}

// 导出笔记为 JSON 文件
function exportAll() {
  const data = JSON.stringify(store.notes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "notes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// 导入（选择文件）
async function handleImport(e) {
  const f = e.target.files?.[0];
  if (!f) return;
  const txt = await f.text();
  try {
    const arr = JSON.parse(txt);
    if (Array.isArray(arr)) store.importNotes(arr);
    else alert("JSON 格式应为数组");
  } catch {
    alert("解析失败");
  }
}

const activeNote = computed(() => store.notes.find(n => n.id === store.activeId) || null);
</script>

<template>
  <div style="display:flex; gap:12px; padding:12px;">
    <!-- 左侧列表 -->
    <aside style="width:260px; border-right:1px solid #eee; padding-right:12px;">
      <div style="display:flex; gap:8px; margin-bottom:12px;">
        <button class="blue-btn" @click="create">新建</button>
        <button class="blue-btn" @click="exportAll">导出</button>
        <button class="blue-btn" @click="$refs.fileInput?.click()">导入</button>
        <input ref="fileInput" type="file" accept=".json" @change="handleImport" style="display:none" />
        <button class="blue-btn" @click="() => store.clearAll()">清空</button>
      </div>

      <div v-if="store.notes.length === 0">暂无笔记，点击“新建”开始</div>

      <ul style="list-style:none; padding:0; margin:0;">
        <li v-for="n in store.notes" :key="n.id" :data-title="n.title" :style="{ padding:'8px', borderRadius:'6px', background: n.id === store.activeId ? '#eef' : 'transparent', cursor:'pointer', marginBottom:'6px' }" @click="select(n)">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="flex:1; min-width:0;">
              <div class="note-title">{{ n.title || '无标题' }}</div>
              <div style="font-size:12px; color:#666; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ (n.content || '').slice(0, 60) }}</div>
            </div>
            <div style="margin-left:8px; display:flex; gap:6px;">
              <button class="blue-btn" @click.stop="store.deleteNote(n.id)">删除</button>
            </div>
          </div>
        </li>
      </ul>
    </aside>

    <!-- 右侧编辑器 -->
    <main style="flex:1;">
      <div v-if="!activeNote" style="padding:20px;">请选择或新建一篇笔记。</div>
      <div v-else style="height:100%;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <input v-model="activeNote.title" @change="store.rename(activeNote.id, activeNote.title)" style="font-size:18px; padding:6px; border:1px solid #ddd; border-radius:6px;" />
            <span style="margin-left:10px;color:#666;font-size:12px;">（已自动保存）</span>
          </div>
        </div>

        <MarkdownEditor />
      </div>
    </main>
  </div>
</template>

<style scoped>
.blue-btn {
  background: #4590db;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 7px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.blue-btn:hover {
  background: #0f4e97;
}

.note-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #396097;
}

</style>
