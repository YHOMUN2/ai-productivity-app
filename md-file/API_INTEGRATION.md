/**
 * API 集成文档
 * 
 * 本文档说明了OCR功能与大模型API的集成方式
 */

// ============================================
// 1. 后端服务架构 (server.js)
// ============================================

/**-
 * 现有架构：
 * 
 * 前端 (Vue)
 *   ↓ (axios.post)
 * 后端代理 (server.js)
 *   ├─ 验证API Key安全性
 *   ├─ 注入受信任的System提示
 *   ├─ 净化返回结果
 *   └─ 转发请求到 volces.com API
 *   ↓
 * 火山引擎大模型API (Doubao)
 *   └─ 返回识别结果
 */

// ============================================
// 2. OCR功能的API集成
// ============================================

/**
 * 消息格式规范：
 * 
 * 对于OCR识别，使用multimodal消息格式
 * 
 * 请求示例：
 */
{
  "model": "doubao-seed-1-6-251015",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
          }
        },
        {
          "type": "text",
          "text": "请识别并提取这张图片中的所有文字内容。这是PDF的第 1 页。请只输出识别到的文字，不要添加任何额外说明。"
        }
      ]
    }
  ]
}

/**
 * 后端会自动添加系统提示（在server.js中）：
 */
{
  "role": "system",
  "content": "你是一个友好、自然、简洁的对话助手。只输出最终答案，不要输出推理过程..."
}

/**
 * API返回示例：
 */
{
  "code": 0,
  "message": "success",
  "data": {
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": "识别出的文字内容..."
        }
      }
    ]
  }
}


// ============================================
// 3. 集成流程详解
// ============================================

/*

前端代码流程：

┌─ PDF.vue 
│
├─ handleFile()
│  └─ 用户选择PDF
│     └─ 预渲染5页 (1.2倍)
│
├─ extractAllText() ✓
│  └─ 快速提取PDF文本（不调API）
│
├─ extractWithOCR() ← 主要API调用路径
│  │
│  ├─ convertPdfToImages()
│  │  └─ 渲染所有页面 (2倍高分辨率)
│  │     └─ canvas.toDataURL() → base64
│  │
│  ├─ ocrBatch() ← 多页批处理
│  │  └─ src/api/ocr.js
│  │     │
│  │     ├─ for each page:
│  │     │  └─ ocrImage()
│  │     │     └─ axios.post()
│  │     │        └─ http://localhost:3001/api/chat
│  │     │           │
│  │     │           ├─ 后端验证 API Key
│  │     │           ├─ 注入系统提示
│  │     │           └─ 转发到火山引擎API
│  │     │              └─ 返回识别文字
│  │     │
│  │     └─ onProgress() ← 实时进度反馈
│  │
│  └─ 合并结果，显示在UI

*/


// ============================================
// 4. 错误处理层级
// ============================================

/**
 * 三级错误处理机制：
 */

// 第1级：单个页面失败
try {
  const text = await ocrImage(base64, pageNum);
} catch (error) {
  // 该页面被标记为[无法识别]，但其他页继续处理
  results[pageNum] = `[第 ${pageNum} 页无法识别: ${error.message}]`;
}

// 第2级：整个OCR过程异常
try {
  const results = await ocrBatch(validImages);
} catch (error) {
  // 显示整体错误信息给用户
  extractedText.value = `OCR识别失败: ${error.message}`;
}

// 第3级：网络/服务异常
// 由axios自动捕获，server.js返回500错误
// 前端显示完整错误堆栈


// ============================================
// 5. 性能优化策略
// ============================================

/**
 * 1. API调用优化
 */
// ✓ 批处理而非逐个调用
// ✓ 添加500ms延迟避免限流
// ✓ 进度回调实时更新UI（不阻塞）

/**
 * 2. 内存优化
 */
// ✓ 预览用1.2倍分辨率（节省内存）
// ✓ OCR用2倍分辨率（提高精度）
// ✓ Canvas及时释放
// ✓ 限制预览页数为5页

/**
 * 3. UI响应优化
 */
// ✓ 进度信息实时显示
// ✓ 按钮禁用状态切换
// ✓ 选项卡切换快速
// ✓ 异步操作不阻塞主线程


// ============================================
// 6. 环境配置检查清单
// ============================================

/*

☐ 1. API Key配置
   export VOLC_API_KEY=your_key_here
   
☐ 2. 后端服务运行
   node server.js
   输出: API 代理正在运行：http://localhost:3001
   
☐ 3. 前端开发服务运行
   npm run dev
   输出: http://localhost:5173

☐ 4. 网络连接验证
   curl http://localhost:3001/api/chat (应返回错误但连通)
   
☐ 5. API Key有效性
   在server.js中测试实际API调用

*/


// ============================================
// 7. 调试技巧
// ============================================

/**
 * 启用详细日志
 */

// src/api/ocr.js 中添加日志
export async function ocrImage(imageBase64, pageNum = null) {
  console.time(`OCR_Page_${pageNum}`);
  
  try {
    console.log(`[OCR] 开始识别第 ${pageNum} 页`);
    const response = await axios.post("http://localhost:3001/api/chat", {
      model: "doubao-seed-1-6-251015",
      messages: messages
    });
    
    console.log(`[OCR] 第 ${pageNum} 页响应:`, response);
    const aiText = extractAIText(response);
    console.log(`[OCR] 第 ${pageNum} 页识别完成，文字长度:`, aiText.length);
    
    return aiText;
  } catch (error) {
    console.error(`[OCR] 第 ${pageNum} 页识别失败:`, error.response || error.message);
    throw error;
  } finally {
    console.timeEnd(`OCR_Page_${pageNum}`);
  }
}

/**
 * 浏览器调试
 */
// 1. 打开DevTools (F12)
// 2. 转到Network标签
// 3. 观察API调用
//    POST http://localhost:3001/api/chat
//    查看Request headers (包含image_url)
//    查看Response (识别结果)
// 4. Console标签查看日志


// ============================================
// 8. 常见API错误与解决方案
// ============================================

/**
 * 错误类型 | 原因 | 解决方案
 * ---------|------|--------
 * 401 Unauthorized | API Key无效/过期 | 更新API Key
 * 429 Too Many Requests | 请求过频 | 增加延迟
 * 500 Internal Server Error | API服务故障 | 稍后重试
 * Network Error | 网络连接失败 | 检查网络
 * CORS Error | 跨域请求被阻止 | 检查server.js CORS配置
 * Image Format Error | 图片格式不支持 | 检查base64格式
 */


// ============================================
// 9. 与现有AI功能的集成
// ============================================

/**
 * 现有AI功能 (src/api/ai.js):
 */
export function chatWithAI(messages) {
  return axios.post("http://localhost:3001/api/chat", {
    model: "doubao-seed-1-6-251015",
    messages: msgs
  });
}

/**
 * 新增OCR功能 (src/api/ocr.js):
 */
export async function ocrImage(imageBase64, pageNum = null) {
  const messages = [{
    role: "user",
    content: [
      { type: "image_url", image_url: { url: imageBase64 } },
      { type: "text", text: "识别文字..." }
    ]
  }];
  
  return axios.post("http://localhost:3001/api/chat", {
    model: "doubao-seed-1-6-251015",
    messages: messages
  });
}

/**
 * 关键区别：
 * - ai.js: 纯文本对话
 * - ocr.js: multimodal (文字+图片)
 * 
 * 两者都用相同的后端代理，支持多种消息格式
 */


// ============================================
// 10. 扩展可能性
// ============================================

/*

基于当前架构，可以轻松扩展：

1. 新增 src/api/vision.js
   - 图片分类 (imageClassification)
   - 物体检测 (objectDetection)
   - 场景理解 (sceneUnderstanding)

2. 新增 src/api/audio.js
   - 语音识别 (speechToText)
   - 语音合成 (textToSpeech)

3. 新增 src/api/multimodal.js
   - 视频分析 (videoAnalysis)
   - 多模态理解 (multimodalUnderstanding)

所有这些都通过 server.js 这个统一的代理转发

*/


// ============================================
// 总结
// ============================================

✅ OCR功能通过后端代理安全调用大模型API
✅ 支持multimodal消息格式（文字+图片）
✅ 三级错误处理确保稳定性
✅ 实时进度反馈优化用户体验
✅ 架构清晰便于扩展其他功能
✅ 性能优化可处理大型PDF
