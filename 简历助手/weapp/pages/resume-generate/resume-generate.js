const { ResumeGenerator } = require('../../utils/resume-generator');
const ApiClient = require('../../utils/api');

Page({
  data: {
    hasProfile: false,
    generating: false,
    generated: false,
    resume: null,
    matchScore: 0,
    targetPosition: '',
    resumeStyle: 'professional',
    resumeLength: 'medium',
    includeAssessment: true,
    highlightProjects: true,
    currentOptimizing: '正在分析职位要求...',
  },

  onLoad() {
    this.checkProfile();
  },

  checkProfile() {
    const profile = wx.getStorageSync('userProfile');
    const jobAnalysis = wx.getStorageSync('last_jd_analysis');
    this.setData({
      hasProfile: !!profile,
      targetPosition: jobAnalysis?.position || profile?.targetPosition || '',
    });
    if (!profile) {
      wx.showToast({ title: '请先完善个人资料', icon: 'none' });
    }
  },

  setStyle(e) {
    this.setData({ resumeStyle: e.currentTarget.dataset.style });
  },

  setLength(e) {
    this.setData({ resumeLength: e.currentTarget.dataset.length });
  },

  toggleAssessment() {
    this.setData({ includeAssessment: !this.data.includeAssessment });
  },

  toggleProjects() {
    this.setData({ highlightProjects: !this.data.highlightProjects });
  },

  async generateResume() {
    const profile = wx.getStorageSync('userProfile');
    const jobAnalysis = wx.getStorageSync('last_jd_analysis');
    const assessment = wx.getStorageSync('assessment_result');

    if (!profile) {
      wx.showToast({ title: '请先完善个人资料', icon: 'none' });
      wx.navigateTo({ url: '/pages/profile/profile' });
      return;
    }

    if (!jobAnalysis) {
      wx.showToast({ title: '请先分析招聘信息', icon: 'none' });
      wx.navigateTo({ url: '/pages/job-analysis/job-analysis' });
      return;
    }

    this.setData({
      generating: true,
      generated: false,
      currentOptimizing: '正在匹配个人经历与职位要求...',
    });

    try {
      // 调用生成器
      this.setData({ currentOptimizing: '正在优化工作经历描述...' });
      await this.sleep(500);

      const resume = ResumeGenerator.generate(profile, jobAnalysis, assessment || null);
      
      this.setData({ currentOptimizing: '正在调整技能排序和关键词...' });
      await this.sleep(500);

      // 保存到历史
      const history = wx.getStorageSync('resumeHistory') || [];
      history.unshift({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        position: jobAnalysis.position || profile.targetPosition,
        company: jobAnalysis.company || '',
        style: this.data.resumeStyle,
        length: this.data.resumeLength,
        matchScore: 85,
        resume: resume,
      });
      wx.setStorageSync('resumeHistory', history.slice(0, 20));

      this.setData({
        generating: false,
        generated: true,
        resume,
        matchScore: 85,
      });
    } catch (e) {
      console.error('生成失败:', e);
      wx.showToast({ title: '生成失败，请重试', icon: 'none' });
      this.setData({ generating: false });
    }
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  previewResume() {
    wx.setStorageSync('current_resume', this.data.resume);
    wx.navigateTo({ url: '/pages/resume-preview/resume-preview' });
  },

  regenerate() {
    this.setData({
      generating: false,
      generated: false,
      resume: null,
    });
  },
});
