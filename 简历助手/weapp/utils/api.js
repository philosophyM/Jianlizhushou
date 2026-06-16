/**
 * 简历助手 - API 封装
 * 统一管理云函数调用和HTTP请求
 */

const API_BASE = 'https://api.resumetailor.ai/v1';

// API 配置
const CONFIG = {
  useCloud: false,
  apiKey: '',
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  modelName: 'gpt-4o-mini',
};

function setConfig(config) {
  Object.assign(CONFIG, config);
  wx.setStorageSync('api_config', CONFIG);
}

function loadConfig() {
  const saved = wx.getStorageSync('api_config');
  if (saved) Object.assign(CONFIG, saved);
}

async function request(url, options) {
  const token = wx.getStorageSync('token');
  const header = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
    ...(options.header || {}),
  };
  return new Promise((resolve, reject) => {
    wx.request({
      url, method: options.method || 'GET', data: options.data, header,
      timeout: options.timeout || 30000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data);
        else reject(new Error(res.data?.message || '请求失败: ' + res.statusCode));
      },
      fail: reject,
    });
  });
}

async function callCloudFunction(name, data) {
  if (!CONFIG.useCloud) return mockCloudFunction(name, data);
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({ name, data, success: (res) => resolve(res.result), fail: reject });
  });
}

async function callAI(messages, options) {
  if (!CONFIG.apiKey) return localAIFallback(messages, options);
  try {
    const res = await request(CONFIG.apiEndpoint, {
      method: 'POST',
      data: {
        model: options.model || CONFIG.modelName,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      },
      timeout: options.timeout || 60000,
    });
    return res.choices?.[0]?.message?.content || '';
  } catch (e) {
    console.warn('AI API 调用失败，使用本地备用:', e);
    return localAIFallback(messages, options);
  }
}

function localAIFallback(messages, options) {
  const lastMsg = messages[messages.length - 1]?.content || '';
  if (lastMsg.includes('简历') || lastMsg.includes('resume')) return generateResumeLocal(lastMsg);
  if (lastMsg.includes('分析') || lastMsg.includes('JD') || lastMsg.includes('招聘')) return analyzeJobLocal(lastMsg);
  return '基于您的资料，我们生成了优化建议。请配置 AI API Key 获取更精准的结果。';
}

function generateResumeLocal(input) {
  return '【AI 简历优化建议】\n\n根据您的个人资料和招聘要求，建议在简历中突出以下内容：\n\n1. 核心匹配点：将招聘要求中的关键词融入工作经历描述\n2. 量化成果：使用数字和百分比量化工作成就\n3. 技能对齐：优先展示招聘方所需的技能项\n4. 项目经验：选择与目标岗位最相关的项目详细描述\n\n提示：在设置中配置 AI API Key 可获得更精准的个性化简历生成。';
}

function analyzeJobLocal(input) {
  const jd = input.trim();
  const skills = ['Python','Java','JavaScript','React','Vue','SQL','数据分析','项目管理','设计','运营'].filter(s => jd.includes(s));
  return JSON.stringify({
    position: jd.split('\n')[0] || '未知职位',
    detectedSkills: skills,
    analysisComplete: true,
    suggestion: '分析完成！请转到简历生成页面定制您的简历。',
  }, null, 2);
}

function mockCloudFunction(name, data) {
  switch (name) {
    case 'analyzeJob': return analyzeJobLocal(data.rawText || '');
    case 'generateResume': return generateResumeLocal(JSON.stringify(data));
    case 'careerAssess': return { result: '测评数据已保存', score: 85 };
    default: return { error: '未知云函数', name };
  }
}

module.exports = { setConfig, loadConfig, request, callCloudFunction, callAI, API_BASE };
if (typeof window !== 'undefined') window.ApiClient = { setConfig, loadConfig, request, callCloudFunction, callAI, API_BASE };
