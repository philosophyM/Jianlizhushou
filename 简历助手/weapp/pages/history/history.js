Page({
  data: {
    userName: '',
    userInitial: '?',
    hasProfile: false,
    profileDone: false,
    assessmentDone: false,
    historyList: [],
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const profile = wx.getStorageSync('userProfile');
    const assessmentCompleted = wx.getStorageSync('assessment_completed');
    const history = wx.getStorageSync('resumeHistory') || [];
    
    const name = profile?.name || '';
    const initial = name ? name.charAt(0) : '?';

    this.setData({
      userName: name,
      userInitial: initial,
      hasProfile: !!profile,
      profileDone: !!profile,
      assessmentDone: !!assessmentCompleted,
      historyList: (history || []).slice(0, 20),
    });
  },

  goToProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  goToAssessment() {
    if (this.data.assessmentDone) {
      wx.navigateTo({ url: '/pages/result/result' });
    } else {
      wx.navigateTo({ url: '/pages/assessment/assessment' });
    }
  },

  goToJobAnalysis() {
    wx.navigateTo({ url: '/pages/job-analysis/job-analysis' });
  },

  viewResume(e) {
    const id = e.currentTarget.dataset.id;
    const history = wx.getStorageSync('resumeHistory') || [];
    const item = history.find(h => h.id === id);
    if (item && item.resume) {
      wx.setStorageSync('current_resume', item.resume);
      wx.navigateTo({ url: '/pages/resume-preview/resume-preview' });
    } else {
      wx.showToast({ title: '简历数据已过期', icon: 'none' });
    }
  },
});
