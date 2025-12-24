<template>
  <div class="supabase-demo">
    <h2>📊 Supabase 数据查询示例</h2>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <p>⏳ 加载中...</p>
    </div>
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error">
      <p>❌ 错误: {{ error }}</p>
      <button @click="fetchData">重试</button>
    </div>
    
    <!-- 数据列表 -->
    <div v-else>
      <div v-if="items.length === 0" class="empty">
        <p>暂无数据</p>
      </div>
      
      <ul v-else class="items-list">
        <li v-for="item in items" :key="item.id" class="item">
          <span class="item-name">{{ item.name || item.title || '未命名' }}</span>
          <span v-if="item.description" class="item-desc">{{ item.description }}</span>
        </li>
      </ul>
    </div>
    
    <!-- 调试信息 -->
    <div class="debug-info">
      <p>📌 总数: {{ items.length }} 条</p>
      <button @click="fetchData" class="refresh-btn">🔄 刷新数据</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// 响应式变量
const items = ref([])
const loading = ref(false)
const error = ref(null)

/**
 * 从 Supabase 查询数据
 * 注意：需要在 Supabase 中创建相应的数据表
 * 这里以 'instruments' 表为例（可根据实际情况修改）
 */
async function fetchData() {
  loading.value = true
  error.value = null
  
  try {
    // 示例 1：查询 instruments 表
    const { data, error: err } = await supabase
      .from('instruments')
      .select('*')
    
    if (err) {
      // 如果表不存在，尝试其他表或显示错误
      console.error('❌ 查询失败:', err.message)
      error.value = err.message
      
      // 可以尝试查询其他表
      // const { data: fallback } = await supabase.from('notes').select('*')
      // items.value = fallback || []
    } else {
      items.value = data || []
      console.log('✅ 查询成功:', items.value)
    }
  } catch (err) {
    console.error('❌ 异常:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.supabase-demo {
  padding: 20px;
  border-radius: 8px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
}

.supabase-demo h2 {
  margin-top: 0;
  color: var(--color-text);
}

.loading,
.error,
.empty {
  padding: 20px;
  text-align: center;
  color: var(--color-text-secondary);
}

.error {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
  margin-bottom: 10px;
}

.error button {
  margin-top: 10px;
  padding: 8px 16px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.error button:hover {
  background: #ff5252;
}

.items-list {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.item {
  padding: 12px;
  margin-bottom: 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 500;
  color: var(--color-text);
}

.item-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.debug-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.refresh-btn {
  padding: 6px 12px;
  background: var(--color-primary, #42b883);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.refresh-btn:hover {
  opacity: 0.8;
}
</style>
