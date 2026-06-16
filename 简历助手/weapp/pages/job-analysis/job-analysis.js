const { JDAnalyzer } = require('../../utils/resume-generator');
const ApiClient = require('../../utils/api');

Page({
  data: {
    jdText: '',
    analyzing: false,
    analyzed: false,
    result: null,
    matchScore: 0,
    matchDetails: [],
  },

  onLoad() {
    this.loadSampleText();
  },

  loadSampleText() {
    const sample = wx.getStorageSync('last_jd_text');
    if (sample) {
      this.setData({ jdText: sample });
    }
  },

  onJDInput(e) {
    this.setData({ jdText: e.detail.value });
  },

  async analyzeJD() {
    const text = this.data.jdText.trim();
    if (!text) {
      wx.showToast({ title: '请粘贴招聘信息', icon: 'none' });
      return;
    }

    this.setData({ analyzing: true, analyzed: false });

    try {
      // 1. 本地解析
      const analysis = JDAnalyzer.analyze(text);
      
      // 2. 尝试调用 AI 增强分析
      let aiEnhanced = null;
      try {
        const aiResult = await ApiClient.callAI([
          { role: 'system', content: '你是一个专业的招聘信息分析专家。请分析以下招聘信息，提取关键信息。' },
          { role: 'user', content: text },
        ], { temperature: 0.3, maxTokens: 1000 });
        if (aiResult) aiEnhanced = JSON.parse(aiResult);
      } catch (e) {
        // AI 分析失败，使用本地分析结果
      }

      // 3. 计算匹配度
      const userProfile = wx.getStorageSync('userProfile');
      const matchResult = JDAnalyzer.calculateMatch(userProfile || {}, analysis);

      // 保存分析结果
      wx.setStorageSync('last_jd_text', text);
      wx.setStorageSync('last_jd_analysis', analysis);

      this.setData({
        analyzing: false,
        analyzed: true,
        result: analysis,
        matchScore: matchResult.score,
        matchDetails: matchResult.details || [],
      });
    } catch (e) {
      console.error('分析失败:', e);
      wx.showToast({ title: '分析失败，请重试', icon: 'none' });
      this.setData({ analyzing: false });
    }
  },

  goToResume() {
    wx.navigateTo({ url: '/pages/resume-generate/resume-generate' });
  },

  resetAnalysis() {
    this.setData({
      jdText: '',
      analyzing: false,
      analyzed: false,
      result: null,
      matchScore: 0,
      matchDetails: [],
    });
  },
});
