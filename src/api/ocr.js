import axios from "axios";

/**
 * 使用大模型进行OCR识别 - 识别单个PDF页面转换的图片
 * @param {string} imageBase64 - 图片的Base64编码（包含data:image/png;base64,前缀）
 * @param {string} pageNum - 页码（用于提示）
 * @returns {Promise<string>} - 识别出的文字
 */
export async function ocrImage(imageBase64, pageNum = null) {
  try {
    // 验证图片数据
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new Error('图片数据无效');
    }

    // 检查是否是有效的base64
    if (!imageBase64.startsWith('data:image')) {
      throw new Error('图片格式不正确，必须是data URI格式');
    }

    // 检查并记录图片大小，如果过大则警告
    let imageSizeMB = (imageBase64.length / 1024 / 1024).toFixed(2);
    console.log(`📸 第${pageNum}页图片大小: ${imageSizeMB}MB`);
    
    if (imageBase64.length > 10 * 1024 * 1024) {
      console.warn(`⚠️ 第${pageNum}页图片过大 (${imageSizeMB}MB)，超过服务器限制，请减小PDF原始分辨率或增加服务器限制`);
      throw new Error(`图片过大(${imageSizeMB}MB)，无法上传。请检查服务器是否已正确配置50MB限制`);
    }

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageBase64
            }
          },
          {
            type: "text",
            text: `请识别并提取这张图片中的所有文字内容。${pageNum ? `这是PDF的第 ${pageNum} 页。` : ""}请只输出识别到的文字，不要添加任何额外说明。`
          }
        ]
      }
    ];

    const response = await axios.post("http://localhost:3001/api/chat", {
      model: "doubao-seed-1-6-251015",
      messages: messages
    });

    // 提取返回的文字
    const aiText = extractAIText(response);
    return aiText;
  } catch (error) {
    console.error("OCR识别失败:", error);
    throw new Error(`第 ${pageNum} 页OCR识别失败: ${error.message}`);
  }
}

/**
 * 批量OCR识别PDF页面
 * @param {Array} pageImages - 页面图片数组，格式: [{pageNum, base64}]
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise<Object>} - 识别结果，格式: {pageNum: text}
 */
export async function ocrBatch(pageImages, onProgress = null) {
  const results = {};
  const totalPages = pageImages.length;

  for (let i = 0; i < pageImages.length; i++) {
    const { pageNum, base64 } = pageImages[i];
    
    try {
      const text = await ocrImage(base64, pageNum);
      results[pageNum] = text;
      
      if (onProgress) {
        onProgress({
          completed: i + 1,
          total: totalPages,
          currentPage: pageNum,
          status: "success"
        });
      }
    } catch (error) {
      results[pageNum] = `[第 ${pageNum} 页识别失败: ${error.message}]`;
      
      if (onProgress) {
        onProgress({
          completed: i + 1,
          total: totalPages,
          currentPage: pageNum,
          status: "error",
          error: error.message
        });
      }
    }

    // 添加延迟避免API限流
    if (i < pageImages.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return results;
}

/**
 * 从不同返回格式中提取 AI 文本的辅助函数
 */
function extractAIText(res) {
  try {
    if (!res) return "[无回应]";

    if (res.data && typeof res.data.answer === "string") return res.data.answer;

    const choices = res.data && res.data.choices;
    if (Array.isArray(choices) && choices.length) {
      const msg = choices[0].message || choices[0];
      const content = msg.content;
      
      if (Array.isArray(content)) return content.map((c) => c.text || c).join("");
      if (typeof content === "string") return content;
      if (content && typeof content.text === "string") return content.text;
      if (msg.reasoning_content && typeof msg.reasoning_content === "string") return msg.reasoning_content;
    }

    if (res.data && res.data.data && typeof res.data.data.answer === "string") return res.data.data.answer;

    return "[无回应]";
  } catch (e) {
    console.error("文本提取错误:", e);
    return "[解析返回出错]";
  }
}
