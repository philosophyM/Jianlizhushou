/**
 * 首页页面逻辑
 */
const App = getApp();

Page({
  data: {
    userInfo: null,
    hasProfile: false,
    hasAssessment: false,
    recentResumes: [],
  },

  onShow() {
    this.loadUserData();
  },

  loadUserData() {
    const userProfile = wx.getStorageSync('userProfile');
    const assessmentCompleted = wx.getStorageSync('assessment_completed');
    const resumeHistory = wx.getStorageSync('resumeHistory') || [];

    this.setData({
      userInfo: App.globalData.userInfo,
      hasProfile: !!userProfile,
      hasAssessment: !!assessmentCompleted,
      recentResumes: (resumeHistory || []).slice(0, 3),
    });
  },

  goToJobAnalysis() {
    wx.navigateTo({ url: '/pages/job-analysis/job-analysis' });
  },

  goToAssessment() {
    const hasAssessment = wx.getStorageSync('assessment_completed');
    if (hasAssessment) {
      wx.navigateTo({ url: '/pages/result/result' });
    } else {
      wx.navigateTo({ url: '/pages/assessment/assessment' });
    }
  },

  goToProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  goToHistory() {
    wx.switchTab({ url: '/pages/history/history' });
  },
});
