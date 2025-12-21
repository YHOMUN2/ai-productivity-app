# OCR PDF 功能说明

## 功能概述

PDF页面现已支持两种文本提取方式：

### 1. 📄 传统文本提取 (extractAllText)
- **适用场景**：文本型PDF（可复制文字的PDF）
- **优点**：快速、精准、无需调用API
- **方式**：直接从PDF结构中读取文字

### 2. 🤖 OCR识别 (extractWithOCR)
- **适用场景**：扫描版PDF、图片型PDF
- **优点**：可识别图片中的文字
- **方式**：将PDF转换为图片→调用大模型API进行OCR识别

## 工作流程

```
选择PDF文件
    ↓
[预览] - 显示前5页缩略图
    ↓
选择提取方式：
  ├─ "提取文本" → 直接提取PDF文本
  ├─ "OCR识别" → 转换为图片 → 调用大模型识别
  └─ 两种方式可独立运行和对比
    ↓
[结果选项卡] - 切换查看不同结果
    ↓
[导出] - 保存为.txt文件（自动添加-text或-ocr后缀）
```

## API集成

### 核心函数（src/api/ocr.js）

#### `ocrImage(imageBase64, pageNum)`
单个页面OCR识别
```javascript
// 返回识别出的文字
const text = await ocrImage(base64, 1);
```

#### `ocrBatch(pageImages, onProgress)`
批量识别多个页面
```javascript
const results = await ocrBatch(
  [{ pageNum: 1, base64: '...' }, ...],
  (progress) => console.log(`进度: ${progress.completed}/${progress.total}`)
);
// results = { 1: "文字...", 2: "文字...", ... }
```

## 技术实现

### 1. PDF转图片 (convertPdfToImages)
- 使用PDF.js库渲染每一页
- 生成2倍分辨率的PNG图片
- 转换为Base64格式

### 2. OCR识别 (extractWithOCR)
- 转换所有页面为图片
- 调用`ocrBatch`进行批量识别
- 支持实时进度反馈
- 自动添加500ms延迟避免API限流

### 3. UI交互
- 两个独立按钮："提取文本" 和 "OCR识别"
- 结果选项卡切换显示
- 实时进度显示
- 导出时自动区分结果类型

## 状态管理

### 核心状态变量
```javascript
- extracting: 是否正在处理
- extractedText: 处理结果文本
- progress: 进度信息
- activeTab: 当前选项卡 ("text" | "ocr")
- useOCR: 当前是否使用OCR模式
- ocrResults: OCR识别结果映射 {pageNum: text}
```

## 错误处理

- ✅ API调用失败时捕获错误并显示
- ✅ PDF页面转换失败时跳过并记录
- ✅ 识别失败时返回提示信息
- ✅ 自动清理资源（Canvas、对象URL等）

## 性能优化

1. **内存优化**
   - 仅预览前5页（可配置）
   - 及时释放Canvas和Blob对象

2. **API优化**
   - 批量识别自动添加延迟避免限流
   - 进度回调实时更新UI

3. **用户体验**
   - 详细的进度提示
   - 可取消的异步操作
   - 两种提取方式独立运行

## 环境变量

确保server.js中设置了API Key：
```bash
export VOLC_API_KEY=your_api_key_here
```

## 注意事项

1. OCR识别需要调用大模型API，可能产生费用
2. 大型PDF处理可能需要较长时间
3. 识别精度依赖于PDF页面清晰度
4. 建议先尝试"提取文本"，仅在失败时使用OCR
