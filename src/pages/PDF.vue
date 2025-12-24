<script setup>
import { ref, shallowRef } from "vue";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
import { ocrBatch } from "@/api/ocr";

// 在 Vite 中需要设置 workerSrc
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const fileInput = ref(null);
const fileName = ref("");
const dragging = ref(false);
// 使用shallowRef避免PDF对象被Vue的Proxy包装，破坏私有成员访问
const pdfDoc = shallowRef(null);
const numPages = ref(0);
const pageCanvases = ref([]); // [{pageNum, url, base64}] 用来在页面显示缩略或渲染canvas
const extracting = ref(false);
const extractedText = ref("");
const progress = ref("");
const activeTab = ref("text"); // "text" | "ocr"
const ocrResults = ref({}); // {pageNum: ocrText}
const useOCR = ref(false); // 是否使用OCR模式

/**
 * 加载并渲染 PDF（只渲染缩略或预览尺寸）
 */
// 将文件处理逻辑抽离，便于点击上传和拖拽共用
async function processFile(f) {
  if (!f) return;
  if (f.type && !f.type.includes("pdf") ) {
    console.warn("非PDF文件: ", f.type);
    return;
  }

  fileName.value = f.name;
  pageCanvases.value = [];
  extractedText.value = "";
  ocrResults.value = {};
  progress.value = "";
  activeTab.value = "text";
  useOCR.value = false;

  try {
    const arrayBuffer = await f.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const doc = await loadingTask.promise;
    pdfDoc.value = doc;
    numPages.value = doc.numPages;

    const previewCount = Math.min(doc.numPages, 5);
    for (let i = 1; i <= previewCount; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 0.8 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await page.render({ canvasContext: context, viewport }).promise;
      const base64 = canvas.toDataURL("image/jpeg", 0.8);
      pageCanvases.value.push({ pageNum: i, url: base64, base64 });
      page.cleanup?.();
    }
  } catch (error) {
    console.error("PDF加载失败:", error);
    progress.value = `加载失败: ${error.message}`;
  }
}

// 原来的 input change 仍然使用，但转到 processFile
async function handleFile(e) {
  const f = e.target.files?.[0];
  if (!f) return;
  await processFile(f);
}

// 拖拽相关事件，阻止默认行为以防止浏览器打开PDF
function onDragEnter(e) {
  e.preventDefault();
  e.stopPropagation();
  dragging.value = true;
}
function onDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
}
function onDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  dragging.value = false;
}
async function onDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  dragging.value = false;

  const file = e.dataTransfer?.files?.[0];
  if (file) {
    await processFile(file);
  }
}

/**
 * 提取单页文本（返回字符串）
 */
async function extractPageText(pageNum) {
  if (!pdfDoc.value) return "";
  try {
    const page = await pdfDoc.value.getPage(pageNum);
    const content = await page.getTextContent();
    // 合并为行文本
    const strings = content.items.map(item => item.str);
    page.cleanup?.();
    return strings.join(" ");
  } catch (error) {
    console.error(`提取第 ${pageNum} 页文本失败:`, error);
    return "";
  }
}

/**
 * 转换所有PDF页面为图片（用于OCR）
 * 使用预览图片或使用同一PDF对象顺序渲染，避免私有成员冲突
 */
async function convertPdfToImages() {
  const images = [];
  const doc = pdfDoc.value; // 获取原始PDF对象引用，避免重复通过ref访问
  
  if (!doc) {
    throw new Error("PDF文档未加载");
  }
  
  for (let i = 1; i <= numPages.value; i++) {
    try {
      // 首先检查预览页面中是否已有该页面
      const previewItem = pageCanvases.value.find(p => p.pageNum === i);
      if (previewItem && previewItem.base64) {
        images.push({ pageNum: i, base64: previewItem.base64 });
        continue;
      }

      // 对于非预览页面，用同一个PDF对象顺序获取，避免并发问题
      const page = await doc.getPage(i);
      // 使用较低的缩放倍数(0.8)来减小图片体积，OCR通常不需要高分辨率
      const viewport = page.getViewport({ scale: 0.8 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await page.render({ canvasContext: context, viewport }).promise;
      // 使用JPEG格式，质量0.75以进一步减小体积
      const base64 = canvas.toDataURL("image/jpeg", 0.75);
      images.push({ pageNum: i, base64 });
      
      // 释放页面资源
      page.cleanup?.();
    } catch (error) {
      console.error(`转换第 ${i} 页失败:`, error);
      // Fallback: 使用预览页面数据
      const previewItem = pageCanvases.value.find(p => p.pageNum === i);
      if (previewItem?.base64) {
        images.push({ pageNum: i, base64: previewItem.base64 });
      }
    }
  }

  return images;
}

/**
 * 提取全部文本（传统文本提取）
 */
async function extractAllText() {
  if (!pdfDoc.value) return;
  useOCR.value = false;
  extracting.value = true;
  extractedText.value = "";
  progress.value = "0 / " + numPages.value;
  activeTab.value = "text";

  let acc = [];
  for (let i = 1; i <= numPages.value; i++) {
    try {
      const t = await extractPageText(i);
      acc.push(t);
      progress.value = `${i} / ${numPages.value}`;
      await new Promise(r => setTimeout(r, 10));
    } catch (err) {
      acc.push("[第 " + i + " 页提取失败]");
    }
  }

  extractedText.value = acc.join("\n\n");
  extracting.value = false;
  progress.value = "完成";
}

/**
 * 使用OCR识别PDF文本
 */
async function extractWithOCR() {
  if (!pdfDoc.value) return;
  useOCR.value = true;
  extracting.value = true;
  ocrResults.value = {};
  progress.value = "准备中...";
  activeTab.value = "ocr";

  try {
    // 转换PDF页面为图片
    progress.value = "正在转换PDF为图片...";
    const images = await convertPdfToImages();
    const validImages = images.filter(img => img.base64);

    if (!validImages.length) {
      throw new Error("无法转换PDF页面，请检查PDF文件完整性");
    }

    // 调用OCR识别
    progress.value = `正在识别 (0/${validImages.length})...`;
    const results = await ocrBatch(validImages, (progressInfo) => {
      progress.value = `正在识别 (${progressInfo.completed}/${progressInfo.total})... 第 ${progressInfo.currentPage} 页`;
    });

    ocrResults.value = results;

    // 合并所有识别结果
    let mergedText = [];
    for (let i = 1; i <= numPages.value; i++) {
      const text = results[i] || `[第 ${i} 页无法识别]`;
      mergedText.push(text);
    }

    extractedText.value = mergedText.join("\n\n---\n\n");
    progress.value = "识别完成";
  } catch (error) {
    console.error("OCR识别失败:", error);
    extractedText.value = `OCR识别失败: ${error.message}`;
    progress.value = "识别失败";
  }

  extracting.value = false;
}

/**
 * 导出文本为 .txt 文件
 */
function exportText() {
  if (!extractedText.value) return;
  const blob = new Blob([extractedText.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const suffix = useOCR.value ? "-ocr" : "-text";
  a.download = (fileName.value ? fileName.value.replace(/\.pdf$/i, "") : "pdf") + suffix + ".txt";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 重置PDF
 */
function resetPDF() {
  pdfDoc.value = null;
  fileName.value = "";
  numPages.value = 0;
  pageCanvases.value = [];
  extractedText.value = "";
  ocrResults.value = {};
  progress.value = "";
  useOCR.value = false;
  activeTab.value = "text";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}
</script>

<template>
  <div class="pdf-container">
    <!-- 未上传时的欢迎界面 -->
    <div v-if="!pdfDoc" class="upload-area">
      <div class="welcome-section">
        <h1 class="title">OCR PDF</h1>
        <p class="subtitle">将不可选择的PDF文档转换为可选择、<br />可搜索的高精度PDF。</p>
        
        <div
          class="drop-area"
          :class="{ active: dragging }"
          @dragenter="onDragEnter"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <p>将 PDF 文件拖拽到此处</p>
          <span>或</span>
          <input
            ref="fileInput"
            type="file"
            accept="application/pdf"
            @change="handleFile"
            style="display: none;"
          />
          <button class="upload-btn" @click="$refs.fileInput?.click()">
            选择一个PDF文档
          </button>

          <div v-if="extracting" class="loading">正在解析 PDF...</div>
        </div>
      </div>
    </div>

    <!-- 已上传文件的处理界面 -->
    <div v-else class="processing-area">
      <div class="file-info">
        <span class="file-name">{{ fileName }}</span>
        <span class="page-count">共 {{ numPages }} 页</span>
      </div>

      <div v-if="pageCanvases.length" class="preview-section">
        <h3 class="section-title">预览（前 {{ pageCanvases.length }} 页）</h3>
        <div class="preview-grid">
          <div v-for="p in pageCanvases" :key="p.pageNum" class="preview-item">
            <div class="preview-label">第 {{ p.pageNum }} 页</div>
            <img :src="p.url" class="preview-image" />
          </div>
        </div>
      </div>

      <div class="action-section">
        <button 
          class="action-btn primary" 
          @click="extractAllText" 
          :disabled="!pdfDoc || extracting"
        >
          {{ extracting && useOCR === false ? `正在提取... ${progress}` : '提取文本' }}
        </button>
        <button 
          class="action-btn primary ocr-btn" 
          @click="extractWithOCR" 
          :disabled="!pdfDoc || extracting"
          title="使用AI模型进行OCR识别，适合扫描版PDF"
        >
          🤖 {{ extracting && useOCR === true ? `识别中... ${progress}` : 'OCR识别' }}
        </button>
        <button 
          class="action-btn secondary" 
          @click="exportText" 
          :disabled="!extractedText"
        >
          导出为 .txt
        </button>
        <button 
          class="action-btn" 
          @click="resetPDF"
        >
          重新上传
        </button>
      </div>

      <div v-if="extractedText" class="result-section">
        <div class="result-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'text' }"
            @click="activeTab = 'text'"
          >
            📄 文本内容
          </button>
          <button 
            v-if="Object.keys(ocrResults).length > 0"
            class="tab-btn" 
            :class="{ active: activeTab === 'ocr' }"
            @click="activeTab = 'ocr'"
          >
            🎯 OCR结果
          </button>
        </div>
        <h3 class="section-title">
          {{ activeTab === 'ocr' ? 'OCR识别结果预览' : '提取结果预览' }}
        </h3>
        <textarea 
          v-model="extractedText" 
          class="result-textarea"
          readonly
        ></textarea>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdf-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 欢迎上传界面 */
.upload-area {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7ff 0%, #fffaf0 100%);
}

html[data-theme="dark"] .upload-area {
  background: #0F1724;
}

.welcome-section {
  text-align: center;
  padding: 40px;
}

.title {
  font-size: 48px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  letter-spacing: 2px;
}

html[data-theme="dark"] .title {
  color: #FFFFFF;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.upload-btn {
  display: inline-block;
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #ff4757 0%, #ee5a6f 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);
  margin-bottom: 24px;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 71, 87, 0.4);
}

.upload-btn:active {
  transform: translateY(0);
}

.drag-hint {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 拖拽上传区域 */
.drop-area {
  border: 2px dashed var(--border);
  padding: 30px;
  text-align: center;
  border-radius: 10px;
  background: var(--card-bg);
  color: var(--text);
  transition: 0.25s;
  cursor: pointer;
  display: inline-block;
  min-width: 320px;
}
.drop-area p {
  margin: 0 0 8px 0;
}
.drop-area span {
  display: block;
  margin: 12px 0;
  color: var(--text);
  opacity: 0.9;
}
.drop-area.active {
  border-color: var(--primary);
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  transform: translateY(-4px);
}
.loading {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text);
  opacity: 0.9;
}

/* 处理界面 */
.processing-area {
  width: 100%;
  max-width: 1200px;
  padding: 40px;
}

.file-info {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 16px 20px;
  background: var(--card-bg);
  border-radius: 8px;
  margin-bottom: 32px;
  border-left: 4px solid #409eff;
}

.file-name {
  font-weight: 600;
  color: var(--text);
  font-size: 16px;
  flex: 1;
  word-break: break-all;
}

.page-count {
  color: #999;
  font-size: 14px;
  white-space: nowrap;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 16px 0;
}

/* 预览部分 */
.preview-section {
  margin-bottom: 32px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.preview-item {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.preview-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.preview-label {
  padding: 8px 10px;
  background: var(--card-bg);
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

/* 操作按钮 */
.action-section {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn.primary {
  background: linear-gradient(135deg, #409eff 0%, #66c0ff 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.action-btn.secondary {
  background: var(--card-bg);
  color: var(--text);
  border: 1px solid var(--border);
}

.action-btn.secondary:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #409eff;
}

.action-btn:not(.primary):not(.secondary) {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

.action-btn:not(.primary):not(.secondary):hover:not(:disabled) {
  background: var(--card-bg);
}

.action-btn.ocr-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.action-btn.ocr-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 结果选项卡 */
.result-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #999;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--text);
}

.tab-btn.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

/* 结果部分 */
.result-section {
  margin-top: 32px;
}

.result-textarea {
  width: 100%;
  height: 400px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Segoe UI Mono';
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title {
    font-size: 32px;
  }

  .subtitle {
    font-size: 14px;
  }

  .upload-btn {
    padding: 12px 32px;
    font-size: 16px;
  }

  .processing-area {
    padding: 20px;
  }

  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .action-section {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
