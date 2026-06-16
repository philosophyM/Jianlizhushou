const Util = require('../../utils/util');

Page({
  data: {
    resume: null,
    matchTags: [],
    showShare: false,
  },

  onLoad() {
    const resume = wx.getStorageSync('current_resume');
    const jobAnalysis = wx.getStorageSync('last_jd_analysis');

    if (resume) {
      const tags = jobAnalysis?.keywords?.slice(0, 4) || [];
      this.setData({ resume, matchTags: tags });
    }
  },

  exportText() {
    const text = Util.exportResumeText(this.data.resume);
    if (!text) {
      wx.showToast({ title: '无简历内容可导出', icon: 'none' });
      return;
    }

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
      },
    });
  },

  shareResume() {
    // 微信原生分享
    wx.shareAppMessage({
      title: '我的定制简历 - 简历助手',
      path: '/pages/index/index',
    });
  },

  goToGenerate() {
    wx.navigateTo({ url: '/pages/resume-generate/resume-generate' });
  },
});
