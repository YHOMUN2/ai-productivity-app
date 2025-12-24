<template>
  <div class="regex-tester-container">
    <!-- 标题区 -->
    <div class="tester-header">
      <h2 class="tester-title">
        <el-icon><Search /></el-icon>
        正则表达式测试工具
      </h2>
      <p class="tester-description">实时正则匹配和模式测试</p>
    </div>

    <!-- 主容器：左右分割布局 -->
    <div class="tester-content">
      <!-- 左侧：输入区 -->
      <div class="input-section">
        <!-- 正则规则输入 -->
        <div class="input-group">
          <label class="input-label">
            <span class="label-text">正则规则</span>
            <span class="label-hint">支持全局(g)、不区分大小写(i)、多行(m)等标志</span>
          </label>

          <div class="regex-input-wrapper">
            <span class="regex-prefix">/</span>
            <input
              v-model="regexPattern"
              type="text"
              class="regex-pattern-input"
              placeholder="输入正则表达式，如：\d+|[a-z]+|hello"
              @input="updateMatches"
              @keydown.enter="updateMatches"
            />
            <span class="regex-suffix">/</span>
            <input
              v-model="regexFlags"
              type="text"
              class="regex-flags-input"
              placeholder="gim"
              maxlength="4"
              @input="updateMatches"
            />
          </div>

          <!-- 正则错误提示 -->
          <div v-if="regexError" class="error-alert">
            <el-icon><WarningFilled /></el-icon>
            <span>{{ regexError }}</span>
          </div>

          <!-- 正则有效提示 -->
          <div v-else-if="regexPattern" class="success-alert">
            <el-icon><SuccessFilled /></el-icon>
            <span>正则表达式有效</span>
          </div>
        </div>

        <!-- 测试文本输入 -->
        <div class="input-group">
          <label class="input-label">
            <span class="label-text">测试文本</span>
            <span class="label-hint">待匹配的输入文本</span>
          </label>

          <textarea
            v-model="testText"
            class="test-text-input"
            placeholder="输入待匹配的文本内容..."
            @input="updateMatches"
          ></textarea>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <el-button @click="clearAll" class="action-btn">
            <el-icon><Delete /></el-icon>
            清空全部
          </el-button>

          <el-button @click="loadExample('phone')" class="action-btn" type="text">
            📱 手机号
          </el-button>

          <el-button @click="loadExample('email')" class="action-btn" type="text">
            ✉️ 邮箱
          </el-button>

          <el-button @click="loadExample('url')" class="action-btn" type="text">
            🔗 URL
          </el-button>

          <el-button @click="loadExample('hex')" class="action-btn" type="text">
            🎨 十六进制色
          </el-button>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="divider"></div>

      <!-- 右侧：结果区 -->
      <div class="result-section">
        <!-- 匹配统计 -->
        <div class="stats-box">
          <div class="stat-item">
            <span class="stat-label">匹配总数</span>
            <span class="stat-value">{{ matchCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">替换次数</span>
            <span class="stat-value">{{ replaceCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">匹配内容长度</span>
            <span class="stat-value">{{ matchTotalLength }}</span>
          </div>
        </div>

        <!-- 匹配列表 -->
        <div class="matches-container">
          <div v-if="!regexPattern || regexError" class="empty-state">
            <el-icon><DocumentCopy /></el-icon>
            <p>输入正则规则和测试文本，此处将显示匹配结果</p>
          </div>

          <div v-else-if="matches.length === 0" class="empty-state no-match">
            <el-icon><Search /></el-icon>
            <p>未发现匹配项</p>
          </div>

          <div v-else class="matches-list">
            <div 
              v-for="(match, index) in matches"
              :key="index"
              class="match-item"
            >
              <div class="match-header">
                <span class="match-index">#{{ index + 1 }}</span>
                <span class="match-text" :title="match[0]">
                  {{ truncate(match[0], 50) }}
                </span>
                <span class="match-pos">{{ match.index }}:{{ match.index + match[0].length }}</span>
              </div>

              <!-- 分组信息 -->
              <div v-if="match.length > 1" class="match-groups">
                <div v-for="(group, gindex) in match.slice(1)" :key="gindex" class="group-item">
                  <span class="group-label">分组 {{ gindex + 1 }}</span>
                  <span class="group-value">{{ group !== undefined ? truncate(group, 40) : '(empty)' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 替换演示 -->
        <div class="replace-demo" v-if="regexPattern && !regexError && matches.length > 0">
          <div class="replace-header">
            <label class="input-label">
              <span class="label-text">替换演示</span>
              <span class="label-hint">使用 $1, $2... 或 $& 表示分组和整个匹配</span>
            </label>
          </div>

          <input
            v-model="replaceString"
            type="text"
            class="replace-input"
            placeholder="输入替换字符串，例如：$1-$2 或 [REPLACED]"
            @input="updateReplace"
          />

          <div class="replace-result">
            <p class="result-label">替换后的文本</p>
            <pre class="result-preview">{{ replacedText }}</pre>
            <el-button @click="copyReplaceResult" class="copy-btn" type="text" size="small">
              <el-icon><DocumentCopy /></el-icon>
              复制结果
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：帮助提示 -->
    <div class="help-section">
      <el-collapse>
        <el-collapse-item title="📖 正则表达式速查表" name="1">
          <div class="help-content">
            <table class="help-table">
              <thead>
                <tr>
                  <th>元字符</th>
                  <th>说明</th>
                  <th>示例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>.</code></td>
                  <td>匹配任意字符（除换行符）</td>
                  <td><code>a.c</code> 匹配 abc, adc</td>
                </tr>
                <tr>
                  <td><code>*</code></td>
                  <td>0 次或多次重复</td>
                  <td><code>ab*c</code> 匹配 ac, abc, abbc</td>
                </tr>
                <tr>
                  <td><code>+</code></td>
                  <td>1 次或多次重复</td>
                  <td><code>ab+c</code> 匹配 abc, abbc（不匹配 ac）</td>
                </tr>
                <tr>
                  <td><code>?</code></td>
                  <td>0 次或 1 次</td>
                  <td><code>ab?c</code> 匹配 ac, abc</td>
                </tr>
                <tr>
                  <td><code>[...]</code></td>
                  <td>字符集合</td>
                  <td><code>[abc]</code> 匹配 a, b, c</td>
                </tr>
                <tr>
                  <td><code>[^...]</code></td>
                  <td>反向字符集</td>
                  <td><code>[^abc]</code> 匹配任何非 a, b, c 的字符</td>
                </tr>
                <tr>
                  <td><code>(...)</code></td>
                  <td>分组（捕获）</td>
                  <td><code>(ab)+c</code> 匹配 abc, ababc</td>
                </tr>
                <tr>
                  <td><code>\d</code></td>
                  <td>数字 [0-9]</td>
                  <td><code>\d+</code> 匹配 123</td>
                </tr>
                <tr>
                  <td><code>\w</code></td>
                  <td>字母数字下划线 [a-zA-Z0-9_]</td>
                  <td><code>\w+</code> 匹配 abc123_</td>
                </tr>
                <tr>
                  <td><code>\s</code></td>
                  <td>空白符</td>
                  <td><code>\s+</code> 匹配 空格/制表符/换行</td>
                </tr>
                <tr>
                  <td><code>^</code></td>
                  <td>行开始</td>
                  <td><code>^abc</code> 匹配行首的 abc</td>
                </tr>
                <tr>
                  <td><code>$</code></td>
                  <td>行结束</td>
                  <td><code>abc$</code> 匹配行尾的 abc</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-collapse-item>

        <el-collapse-item title="🚩 标志说明" name="2">
          <div class="help-content">
            <div class="flag-item">
              <code>g</code>
              <span>全局匹配（global）— 找到所有匹配项，而不是在第一个匹配后停止</span>
            </div>
            <div class="flag-item">
              <code>i</code>
              <span>不区分大小写（case-insensitive）— 匹配大小写不敏感</span>
            </div>
            <div class="flag-item">
              <code>m</code>
              <span>多行模式（multiline）— ^ 和 $ 匹配行首尾，不仅是字符串首尾</span>
            </div>
            <div class="flag-item">
              <code>s</code>
              <span>单行模式（dotAll）— . 也匹配换行符</span>
            </div>
            <div class="flag-item">
              <code>u</code>
              <span>Unicode 模式（unicode）— 处理 Unicode 字符，如表情符号</span>
            </div>
            <div class="flag-item">
              <code>y</code>
              <span>粘性模式（sticky）— 只在上次匹配末尾的后续位置寻找匹配</span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Search,
  WarningFilled,
  SuccessFilled,
  Delete,
  DocumentCopy
} from '@element-plus/icons-vue';

// 状态
const regexPattern = ref('');
const regexFlags = ref('g');
const testText = ref('');
const replaceString = ref('');
const regexError = ref('');
const matches = ref([]);
const replacedText = ref('');

// 快速示例
const examples = {
  phone: {
    pattern: '1[3-9]\\d{9}',
    flags: 'g',
    text: '我的电话：13812345678，备用：18888888888'
  },
  email: {
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    text: '联系方式：user@example.com 或 support@company.org'
  },
  url: {
    pattern: 'https?:\\/\\/[^\\s]+',
    flags: 'g',
    text: '访问 https://example.com 和 http://test.org 了解更多'
  },
  hex: {
    pattern: '#[0-9a-fA-F]{6}\\b',
    flags: 'g',
    text: '颜色代码：#FF5733 红色，#00FF00 绿色，#0000FF 蓝色'
  }
};

/**
 * 加载示例
 */
function loadExample(type) {
  const example = examples[type];
  if (example) {
    regexPattern.value = example.pattern;
    regexFlags.value = example.flags;
    testText.value = example.text;
    updateMatches();
  }
}

/**
 * 更新匹配结果
 */
function updateMatches() {
  regexError.value = '';
  matches.value = [];
  replacedText.value = '';
  replaceString.value = '';

  if (!regexPattern.value) return;

  try {
    // 创建正则表达式
    const regex = new RegExp(regexPattern.value, regexFlags.value);

    // 如果不含全局标志，仅获取第一个匹配
    if (regexFlags.value.includes('g')) {
      let match;
      while ((match = regex.exec(testText.value)) !== null) {
        matches.value.push(match);
      }
    } else {
      const match = regex.exec(testText.value);
      if (match) {
        matches.value.push(match);
      }
    }
  } catch (err) {
    regexError.value = `正则表达式错误: ${err.message}`;
  }
}

/**
 * 更新替换结果
 */
function updateReplace() {
  if (!regexPattern.value || regexError.value || matches.value.length === 0) {
    replacedText.value = '';
    return;
  }

  try {
    const regex = new RegExp(regexPattern.value, regexFlags.value);
    replacedText.value = testText.value.replace(regex, replaceString.value);
  } catch (err) {
    replacedText.value = '替换失败: ' + err.message;
  }
}

/**
 * 清空全部
 */
function clearAll() {
  regexPattern.value = '';
  regexFlags.value = 'g';
  testText.value = '';
  replaceString.value = '';
  regexError.value = '';
  matches.value = [];
  replacedText.value = '';
}

/**
 * 截断文本
 */
function truncate(text, length) {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * 复制替换结果
 */
function copyReplaceResult() {
  if (!replacedText.value) return;

  navigator.clipboard.writeText(replacedText.value).then(() => {
    ElMessage.success('已复制到剪贴板');
  }).catch(err => {
    ElMessage.error('复制失败');
  });
}

/**
 * 匹配数量
 */
const matchCount = computed(() => matches.value.length);

/**
 * 替换数量
 */
const replaceCount = computed(() => {
  if (!regexPattern.value || regexError.value || matches.value.length === 0) {
    return 0;
  }
  try {
    const regex = new RegExp(regexPattern.value, regexFlags.value);
    const result = testText.value.replace(regex, replaceString.value);
    // 统计替换的数量
    if (regexFlags.value.includes('g')) {
      return matches.value.length;
    } else {
      return matches.value.length > 0 ? 1 : 0;
    }
  } catch {
    return 0;
  }
});

/**
 * 匹配内容总长度
 */
const matchTotalLength = computed(() => {
  return matches.value.reduce((sum, match) => sum + match[0].length, 0);
});
</script>

<style scoped lang="css">
.regex-tester-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-base);
  color: var(--text-primary);
  min-height: 100vh;
}

/* 标题区 */
.tester-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-lg);
}

.tester-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
}

.tester-title .el-icon {
  font-size: 1.8rem;
  color: var(--accent);
}

.tester-description {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-weight: 400;
}

/* 主容器 */
.tester-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  min-height: 600px;
}

@media (max-width: 1024px) {
  .tester-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .divider {
    display: none !important;
  }
}

/* 输入区 */
.input-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 输入组 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.input-label {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.label-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.label-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 400;
}

/* 正则输入 */
.regex-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 var(--spacing-sm);
  transition: all 0.15s ease;
}

.regex-input-wrapper:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.regex-prefix,
.regex-suffix {
  color: var(--text-secondary);
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

.regex-pattern-input,
.regex-flags-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--spacing-md);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  outline: none;
}

.regex-flags-input {
  flex: 0 0 60px;
  padding: var(--spacing-md) var(--spacing-sm);
  border-left: 1px solid var(--border-light);
  text-transform: uppercase;
}

/* 错误和成功提示 */
.error-alert,
.success-alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
}

.error-alert {
  background: color-mix(in srgb, var(--error) 10%, transparent);
  color: var(--error);
  border-left: 3px solid var(--error);
}

.success-alert {
  background: color-mix(in srgb, var(--success) 10%, transparent);
  color: var(--success);
  border-left: 3px solid var(--success);
}

.error-alert .el-icon,
.success-alert .el-icon {
  flex-shrink: 0;
  font-size: 1.1rem;
}

/* 文本输入 */
.test-text-input {
  flex: 1;
  padding: var(--spacing-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  resize: vertical;
  min-height: 200px;
  transition: all 0.15s ease;
}

.test-text-input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* 快速操作 */
.quick-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.action-btn {
  flex: 0 1 auto;
  font-size: 0.9rem;
}

/* 分割线 */
.divider {
  grid-column: 1 / -1;
  height: 1px;
  background: var(--border-color);
  margin: var(--spacing-md) 0;
}

/* 结果区 */
.result-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 统计信息 */
.stats-box {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .stats-box {
    grid-template-columns: 1fr;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--accent);
  font-family: 'Monaco', monospace;
}

/* 匹配容器 */
.matches-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  color: var(--text-secondary);
  text-align: center;
  min-height: 200px;
}

.empty-state .el-icon {
  font-size: 2.5rem;
  color: var(--text-tertiary);
}

.empty-state.no-match .el-icon {
  color: var(--warning);
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

/* 匹配列表 */
.matches-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.match-item {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  transition: background-color 0.15s ease;
}

.match-item:hover {
  background: var(--bg-secondary);
}

.match-item:last-child {
  border-bottom: none;
}

.match-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.match-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 24px;
  background: var(--accent);
  color: white;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}

.match-text {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-base);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.match-pos {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
}

/* 分组信息 */
.match-groups {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding-left: var(--spacing-lg);
  border-left: 2px solid var(--border-light);
}

.group-item {
  display: flex;
  gap: var(--spacing-sm);
  align-items: baseline;
}

.group-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.group-value {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 替换演示 */
.replace-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.replace-header {
  border-bottom: 1px solid var(--border-light);
  padding-bottom: var(--spacing-md);
}

.replace-input {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--bg-base);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  transition: all 0.15s ease;
}

.replace-input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.replace-result {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.result-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.result-preview {
  padding: var(--spacing-md);
  background: var(--bg-base);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  margin: 0;
  max-height: 120px;
  overflow-y: auto;
  word-break: break-all;
  white-space: pre-wrap;
}

.copy-btn {
  align-self: flex-start;
}

/* 帮助区 */
.help-section {
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  margin-top: var(--spacing-lg);
}

.help-content {
  padding: var(--spacing-md) 0;
}

/* 帮助表格 */
.help-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.help-table thead {
  background: var(--bg-secondary);
}

.help-table th {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
}

.help-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  color: var(--text-primary);
}

.help-table code {
  background: var(--bg-base);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--accent);
}

.help-table tr:hover {
  background: var(--bg-secondary);
}

/* 标志说明 */
.flag-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-left: 3px solid var(--accent);
  border-radius: 0 4px 4px 0;
  background: var(--bg-secondary);
  margin: 0;
}

.flag-item code {
  font-weight: 600;
  color: var(--accent);
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
  min-width: 30px;
}

.flag-item span {
  flex: 1;
  color: var(--text-primary);
  font-size: 0.9rem;
}

/* 响应式 */
@media (max-width: 640px) {
  .regex-tester-container {
    padding: var(--spacing-md);
    gap: var(--spacing-lg);
  }

  .tester-title {
    font-size: 1.2rem;
  }

  .stats-box {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    flex-direction: column;
  }

  .action-btn {
    flex: 1;
  }

  .match-header {
    flex-wrap: wrap;
  }

  .match-pos {
    flex-basis: 100%;
    margin-top: var(--spacing-xs);
  }
}

/* 深色模式 - 折叠菜单标题 */
html[data-theme="dark"] :deep(.el-collapse-item__title) {
  background-color: #0F1724 !important;
}
</style>
