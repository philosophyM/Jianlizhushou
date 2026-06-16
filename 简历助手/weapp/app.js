/**
 * 简历助手 - 微信小程序入口
 */
App({
  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    // 检查登录状态
    this.checkLoginStatus();

    // 初始化云开发
    this.initCloud();
  },

  globalData: {
    systemInfo: null,
    userInfo: null,
    userProfile: null,
    assessmentResult: null,
    currentJobAnalysis: null,
    currentResume: null,
    resumeHistory: [],
    hasCompletedAssessment: false,
  },

  /**
   * 初始化云开发环境
   */
  initCloud() {
    try {
      wx.cloud.init({
        env: CLOUD_ENV,
        traceUser: true,
      });
    } catch (e) {
      console.warn('云开发初始化失败，使用本地模式:', e);
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
  },

  /**
   * 微信登录
   */
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            wx.setStorageSync('session_code', res.code);
            resolve(res.code);
          } else {
            reject('登录失败');
          }
        },
        fail: reject,
      });
    });
  },

  /**
   * 获取用户信息
   */
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善个人资料',
        success: (res) => {
          this.globalData.userInfo = res.userInfo;
          resolve(res.userInfo);
        },
        fail: reject,
      });
    });
  },

  /**
   * 展示Toast提示
   */
  showToast(title, icon = 'none') {
    wx.showToast({ title, icon, duration: 2000 });
  },

  /**
   * 展示加载中
   */
  showLoading(title = '加载中...') {
    wx.showLoading({ title, mask: true });
  },

  /**
   * 隐藏加载
   */
  hideLoading() {
    wx.hideLoading();
  },
});
  const CLOUD_ENV = 'cloud1-d3gnqglotee95079a';
