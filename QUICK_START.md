// 快速集成指南 - OCR PDF 功能

// ============================================
// 第1步：环境配置
// ============================================

# 确保 API Key 已设置
export VOLC_API_KEY=your_api_key_here

# 确保后端服务运行
node server.js
# 应该输出: API 代理正在运行：http://localhost:3001

# 确保前端开发服务运行
npm run dev
# 应该输出: VITE v7.x.x running at: http://localhost:5173


// ============================================
// 第2步：文件结构验证
// ============================================

✅ 新增文件：
  src/api/ocr.js - OCR API模块（119行）

✅ 修改文件：
  src/pages/PDF.vue - 添加OCR功能（600行）

✅ 文档文件：
  OCR_README.md - 功能说明
  OPTIMIZATION_SUMMARY.md - 优化总结


// ============================================
// 第3步：核心API使用
// ============================================

import { ocrImage, ocrBatch } from "@/api/ocr";

// 单个图片识别
const text = await ocrImage(imageBase64, pageNum);

// 批量识别
const results = await ocrBatch(
  [
    { pageNum: 1, base64: "data:image/png;base64,..." },
    { pageNum: 2, base64: "data:image/png;base64,..." }
  ],
  (progress) => {
    console.log(`识别进度: ${progress.completed}/${progress.total}`);
  }
);


// ============================================
// 第4步：UI交互
// ============================================

PDF页面现有两个主要按钮：

[提取文本] 按钮
├─ 用途：快速提取PDF中的可选文字
├─ 耗时：< 1秒
├─ 适用：文本型PDF
└─ 点击事件：extractAllText()

[OCR识别] 按钮 🤖
├─ 用途：识别图片/扫描PDF中的文字
├─ 耗时：5-30秒（取决于页数）
├─ 适用：扫描版PDF、图片型PDF
└─ 点击事件：extractWithOCR()

结果选项卡
├─ 📄 文本内容 (传统提取结果)
└─ 🎯 OCR结果 (OCR识别结果)


// ============================================
// 第5步：测试场景
// ============================================

场景1：测试传统提取
  1. 选择一个纯文本PDF
  2. 点击"提取文本"
  3. 应立即显示结果
  4. 导出为-text.txt文件

场景2：测试OCR识别
  1. 选择一个扫描版PDF或图片PDF
  2. 点击"OCR识别"
  3. 观看进度条更新
  4. 等待识别完成
  5. 导出为-ocr.txt文件

场景3：对比两种方式
  1. 选择PDF
  2. 先点"提取文本"
  3. 再点"OCR识别"
  4. 使用选项卡对比结果


// ============================================
// 第6步：常见问题排查
// ============================================

❌ 问题：OCR识别按钮禁用
✅ 原因：PDF未加载或正在处理
✅ 解决：确保PDF已选择且没有正在处理

❌ 问题：识别失败，显示API错误
✅ 原因：后端服务未运行或API Key无效
✅ 解决：检查server.js运行和VOLC_API_KEY设置

❌ 问题：识别很慢
✅ 原因：大型PDF或网络延迟
✅ 解决：可考虑仅识别前几页

❌ 问题：内存占用很高
✅ 原因：处理超大PDF
✅ 解决：修改预览页数限制（第36行）


// ============================================
// 第7步：性能调优
// ============================================

调整预览页数（src/pages/PDF.vue 第36行）：
  const previewCount = Math.min(numPages.value, 5); // 改为10,20等
  
  注：更多预览页 = 更多内存占用

调整OCR分辨率（src/pages/PDF.vue 第77行）：
  const viewport = page.getViewport({ scale: 2 }); // 改为1.5, 1等
  
  注：分辨率越高 = 识别越精准但越慢

调整API延迟（src/api/ocr.js 第65行）：
  await new Promise(r => setTimeout(r, 500)); // 改为1000等
  
  注：延迟越长 = 越不易限流但越慢


// ============================================
// 第8步：代码集成示例
// ============================================

// 在其他页面调用OCR功能

import { ocrBatch } from "@/api/ocr";

// 示例1：在某个组件中使用OCR
async function recognizeImages() {
  const images = [
    { pageNum: 1, base64: /* 图片base64 */ },
  ];
  
  try {
    const results = await ocrBatch(images, (progress) => {
      console.log(`进度: ${progress.completed}/${progress.total}`);
    });
    console.log("识别结果:", results);
  } catch (error) {
    console.error("识别失败:", error);
  }
}

// 示例2：集成到现有模块
import { ocrImage } from "@/api/ocr";

function processScreenshot(screenshotBase64) {
  return ocrImage(screenshotBase64, 1)
    .then(text => {
      // 处理识别结果
      console.log("识别出的文字:", text);
    })
    .catch(error => {
      console.error("识别失败:", error);
    });
}


// ============================================
// 第9步：数据流转
// ============================================

用户选择PDF
    ↓
handleFile(e)
├─ 读取文件 → ArrayBuffer
├─ 加载PDF文档 → pdfDoc
├─ 渲染预览页面 → pageCanvases (1.2倍)
└─ 保存base64 → 用于后续使用
    ↓
用户点击按钮
├─ "提取文本"
│  ├─ extractAllText()
│  ├─ 循环调用 extractPageText()
│  ├─ 合并结果 → extractedText
│  └─ 显示在选项卡
│
└─ "OCR识别"
   ├─ extractWithOCR()
   ├─ convertPdfToImages() 生成高分辨率
   ├─ ocrBatch() 调用API识别
   ├─ 结果映射 → ocrResults
   ├─ 合并结果 → extractedText
   └─ 显示在选项卡
    ↓
用户导出结果
    ↓
exportText()
└─ 根据useOCR决定后缀 → .txt文件


// ============================================
// 第10步：监控和日志
// ============================================

推荐在生产环境添加日志：

// 在 src/api/ocr.js 中添加
console.log(`[OCR] 开始识别第 ${pageNum} 页`);
console.log(`[OCR] 识别耗时: ${Date.now() - startTime}ms`);

// 在 src/pages/PDF.vue 中添加
console.log(`[PDF] 加载文件: ${fileName.value}`);
console.log(`[PDF] 总页数: ${numPages.value}`);
console.log(`[PDF] 提取方式: ${useOCR.value ? 'OCR' : 'Text'}`);


// ============================================
// 总结
// ============================================

✅ OCR模块已完全集成
✅ UI已优化支持两种提取方式
✅ 错误处理完善
✅ 进度反馈实时
✅ 代码可扩展性强

开始使用：
1. 设置API Key
2. 运行后端服务
3. 运行前端开发服务
4. 打开PDF页面测试
