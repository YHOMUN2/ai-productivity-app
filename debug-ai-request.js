// debug-ai-request.js
import axios from 'axios';

async function run() {
  try {
    const res = await axios.post('http://localhost:3001/api/chat', {
      model: 'doubao-seed-1-6-251015',
      messages: [
        {
          role: "system",
          content: "你是一个友好、自然、简洁的对话助手。必须遵守以下规则：1. 只输出最终答案，不输出推理过程、内部思考、自解释；2. 不复述用户指令；3. 风格自然、口语化、有温度；4. 不编造事实；5. 在不知道时直接说不知道；6. 不输出元信息；7. 用户问候时友好回应但不解释原因。"
        },
        { role: 'user', content: '你是一个友好、自然、简洁的对话助手。必须遵守以下规则：1. 只输出最终答案，不输出推理过程、内部思考、自解释；2. 不复述用户指令；3. 风格自然、口语化、有温度；4. 不编造事实；5. 在不知道时直接说不知道；6. 不输出元信息；7. 用户问候时友好回应但不解释原因。' }
      ]
    });
    // 避免对整个 axios 响应做 JSON.stringify（可能含循环引用）
    console.log('HTTP status:', res.status);
    console.log('res.data:');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    if (e.response) {
      console.error('ERROR response data:', JSON.stringify(e.response.data, null, 2));
      console.error('ERROR status:', e.response.status);
    } else {
      console.error('ERROR:', e.message);
    }
  }
}

run();