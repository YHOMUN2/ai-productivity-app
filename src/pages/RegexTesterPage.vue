<template>
  <div class="regex-tester-demo">
    <RegexTester />

    <!-- 使用案例 -->
    <div class="use-cases-section">
      <h2>🎯 常见使用案例</h2>
      
      <div class="cases-grid">
        <div class="case-card">
          <h4>📱 验证手机号</h4>
          <p>检查输入是否为有效的手机号码格式</p>
          <code>1[3-9]\d{9}</code>
          <button @click="loadRegex('phone')" class="demo-btn">加载示例</button>
        </div>

        <div class="case-card">
          <h4>✉️ 验证邮箱</h4>
          <p>提取和验证电子邮件地址</p>
          <code>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}</code>
          <button @click="loadRegex('email')" class="demo-btn">加载示例</button>
        </div>

        <div class="case-card">
          <h4>🔗 提取 URL</h4>
          <p>从文本中识别和提取 URL</p>
          <code>https?:\/\/[^\s]+</code>
          <button @click="loadRegex('url')" class="demo-btn">加载示例</button>
        </div>

        <div class="case-card">
          <h4>🎨 提取颜色代码</h4>
          <p>查找十六进制颜色代码</p>
          <code>#[0-9a-fA-F]{6}\b</code>
          <button @click="loadRegex('hex')" class="demo-btn">加载示例</button>
        </div>

        <div class="case-card">
          <h4>💰 提取金额</h4>
          <p>从文本中提取货币金额</p>
          <code>\$?[\d,]+\.?\d{0,2}</code>
          <button @click="loadRegex('currency')" class="demo-btn">加载示例</button>
        </div>

        <div class="case-card">
          <h4>📅 验证日期</h4>
          <p>验证 YYYY-MM-DD 格式的日期</p>
          <code>\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])</code>
          <button @click="loadRegex('date')" class="demo-btn">加载示例</button>
        </div>
      </div>
    </div>

    <!-- 性能提示 -->
    <div class="tips-section">
      <h3>⚠️ 最佳实践</h3>
      <ul class="tips-list">
        <li>使用 <code>^</code> 和 <code>$</code> 锚点来匹配字符串首尾</li>
        <li>避免过度复杂的正则表达式（可能导致回溯问题）</li>
        <li>使用分组 <code>(...)</code> 来提取特定部分</li>
        <li>在替换时使用 <code>$1, $2</code> 引用分组，<code>$&</code> 引用整个匹配</li>
        <li>使用 <code>g</code> 标志进行全局匹配，否则只返回第一个结果</li>
        <li>测试边界情况和特殊字符处理</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import RegexTester from '@/components/RegexTester.vue';
import { ElMessage } from 'element-plus';

// 示例数据
const examples = {
  phone: {
    pattern: '1[3-9]\\d{9}',
    flags: 'g',
    text: '我的电话：13812345678，备用：18888888888，朋友的：12345678901'
  },
  email: {
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    text: '联系我们：support@company.com 或 info@example.org，技术支持：tech@dev.co.uk'
  },
  url: {
    pattern: 'https?:\\/\\/[^\\s]+',
    flags: 'g',
    text: '访问官网 https://example.com 和 http://test.org 或者 https://github.com/user/repo'
  },
  hex: {
    pattern: '#[0-9a-fA-F]{6}\\b',
    flags: 'g',
    text: '配色方案：#FF5733 红色，#00FF00 绿色，#0000FF 蓝色，#FFA500 橙色'
  },
  currency: {
    pattern: '\\$?[\\d,]+\\.?\\d{0,2}',
    flags: 'g',
    text: '价格信息：$100.50，¥200，€350.25，1,500.00，还有 3.99'
  },
  date: {
    pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])',
    flags: 'g',
    text: '日期：2024-01-15，2024-12-31，2025-06-01 都是有效格式'
  }
};

/**
 * 加载示例（通过事件发送给子组件）
 */
function loadRegex(type) {
  const example = examples[type];
  if (example) {
    // 这是一个演示消息，实际应通过 ref 或事件通信
    ElMessage.info(`已准备示例：${type}\n请在工具中手动输入或等待功能更新`);
  }
}
</script>

<style scoped lang="css">
.regex-tester-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* 使用案例区 */
.use-cases-section {
  margin-top: var(--spacing-xl);
}

.use-cases-section h2 {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-lg);
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  padding: 0 var(--spacing-lg);
}

.case-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.case-card:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
}

.case-card h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.case-card p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.case-card code {
  display: block;
  padding: var(--spacing-md);
  background: var(--bg-base);
  border-left: 3px solid var(--accent);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--accent);
  overflow-x: auto;
  word-break: break-all;
}

.demo-btn {
  align-self: flex-start;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.demo-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.2);
}

.demo-btn:active {
  transform: translateY(0);
}

/* 提示区 */
.tips-section {
  padding: var(--spacing-lg);
  background: color-mix(in srgb, var(--warning) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--warning) 30%, transparent);
  border-left: 4px solid var(--warning);
  border-radius: var(--radius-lg);
  margin: 0 var(--spacing-lg);
}

.tips-section h3 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--warning);
}

.tips-list {
  margin: 0;
  padding-left: var(--spacing-lg);
  list-style: none;
}

.tips-list li {
  padding: var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.6;
}

.tips-list li:before {
  content: '✓ ';
  color: var(--success);
  font-weight: 600;
  margin-right: var(--spacing-sm);
}

.tips-list code {
  background: var(--bg-surface);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--accent);
}

/* 响应式 */
@media (max-width: 640px) {
  .cases-grid {
    grid-template-columns: 1fr;
  }

  .tips-section {
    margin-left: var(--spacing-md);
    margin-right: var(--spacing-md);
  }
}
</style>
