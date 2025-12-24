/**
 * Supabase 数据查询示例
 * 
 * 这个文件演示了如何在 Vue 3 中使用 Supabase 进行数据库操作
 */

import { supabase } from '@/lib/supabaseClient'

/**
 * 查询单个表的所有数据
 * @param {string} tableName - 表名
 * @returns {Promise<Array>} 数据数组
 */
export async function fetchTableData(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
    
    if (error) {
      console.error(`❌ 查询 ${tableName} 失败:`, error.message)
      throw error
    }
    
    console.log(`✅ 成功查询 ${tableName}:`, data)
    return data
  } catch (err) {
    console.error('查询异常:', err)
    return []
  }
}

/**
 * 插入数据
 * @param {string} tableName - 表名
 * @param {Object} data - 要插入的数据
 * @returns {Promise<Object>} 插入结果
 */
export async function insertData(tableName, data) {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert([data])
      .select()
    
    if (error) {
      console.error(`❌ 插入数据到 ${tableName} 失败:`, error.message)
      throw error
    }
    
    console.log(`✅ 成功插入数据:`, result)
    return result
  } catch (err) {
    console.error('插入异常:', err)
    return null
  }
}

/**
 * 更新数据
 * @param {string} tableName - 表名
 * @param {Object} data - 要更新的数据
 * @param {Object} filters - 过滤条件，例如 { id: 1 }
 * @returns {Promise<Object>} 更新结果
 */
export async function updateData(tableName, data, filters) {
  try {
    let query = supabase.from(tableName).update(data)
    
    // 应用过滤条件
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value)
    }
    
    const { data: result, error } = await query.select()
    
    if (error) {
      console.error(`❌ 更新 ${tableName} 失败:`, error.message)
      throw error
    }
    
    console.log(`✅ 成功更新数据:`, result)
    return result
  } catch (err) {
    console.error('更新异常:', err)
    return null
  }
}

/**
 * 删除数据
 * @param {string} tableName - 表名
 * @param {Object} filters - 过滤条件，例如 { id: 1 }
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteData(tableName, filters) {
  try {
    let query = supabase.from(tableName).delete()
    
    // 应用过滤条件
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value)
    }
    
    const { error } = await query
    
    if (error) {
      console.error(`❌ 删除 ${tableName} 数据失败:`, error.message)
      throw error
    }
    
    console.log(`✅ 成功删除数据`)
    return true
  } catch (err) {
    console.error('删除异常:', err)
    return false
  }
}

/**
 * 带条件的查询
 * @param {string} tableName - 表名
 * @param {Object} filters - 过滤条件，例如 { status: 'active' }
 * @returns {Promise<Array>} 查询结果
 */
export async function queryWithFilters(tableName, filters) {
  try {
    let query = supabase.from(tableName).select('*')
    
    // 应用过滤条件
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error(`❌ 条件查询 ${tableName} 失败:`, error.message)
      throw error
    }
    
    console.log(`✅ 条件查询结果:`, data)
    return data
  } catch (err) {
    console.error('查询异常:', err)
    return []
  }
}

/**
 * 用法示例
 * 
 * 在 Vue 组件中使用：
 * 
 * <script setup>
 * import { ref, onMounted } from 'vue'
 * import { fetchTableData, insertData, updateData, deleteData } from '@/utils/supabase-operations'
 * 
 * const items = ref([])
 * 
 * async function loadData() {
 *   // 查询数据
 *   items.value = await fetchTableData('your_table_name')
 * }
 * 
 * async function addItem(newData) {
 *   // 插入数据
 *   const result = await insertData('your_table_name', newData)
 *   if (result) {
 *     await loadData() // 重新加载数据
 *   }
 * }
 * 
 * async function editItem(id, updateData) {
 *   // 更新数据
 *   await updateData('your_table_name', updateData, { id })
 *   await loadData() // 重新加载数据
 * }
 * 
 * async function removeItem(id) {
 *   // 删除数据
 *   await deleteData('your_table_name', { id })
 *   await loadData() // 重新加载数据
 * }
 * 
 * onMounted(() => {
 *   loadData()
 * })
 * </script>
 */
