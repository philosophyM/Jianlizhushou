Page({
  data: {
    report: {
      holland: { scores: {}, top3: [], code: '' },
      bigFive: { scores: {}, descriptions: {} },
      values: { scores: {}, sorted: [] },
      skills: { categoryScores: {} },
      recommendedCareers: [],
      summary: { title: '', topCareer: '', topMatch: 0, brief: '' },
    },
    hollandList: [],
    bigFiveList: [],
    valueList: [],
  },

  onLoad() {
    try {
      const report = wx.getStorageSync('assessment_result');
      if (!report || !report.holland) {
        wx.showToast({ title: '请先完成职业测评', icon: 'none' });
        setTimeout(() => wx.navigateTo({ url: '/pages/assessment/assessment' }), 1500);
        return;
      }

      // 霍兰德数据
      const dimLabels = {
        realistic: '现实型', investigative: '研究型', artistic: '艺术型',
        social: '社会型', enterprising: '企业型', conventional: '常规型',
      };
      const hollandList = Object.entries(report.holland.scores).map(([key, score]) => ({
        label: dimLabels[key] || key, score,
      }));

      // 大五人格数据
      const bfNames = {
        openness: '开放性', conscientiousness: '尽责性', extraversion: '外向性',
        agreeableness: '宜人性', neuroticism: '神经质',
      };
      const bigFiveList = Object.entries(report.bigFive.scores).map(([key, score]) => ({
        name: bfNames[key] || key,
        score,
        desc: report.bigFive.descriptions[key] || '',
      }));

      // 价值观数据
      const valueLabels = {
        achievement: '成就感', creativity: '创造性', independence: '独立性',
        economic: '经济报酬', security: '安全感', prestige: '社会地位',
        altruism: '助人', relationships: '人际关系', management: '管理', lifestyle: '生活方式',
      };
      const valueList = Object.entries(report.values.scores).map(([key, score]) => ({
        label: valueLabels[key] || key, score,
      })).sort((a, b) => b.score - a.score);

      this.setData({ report, hollandList, bigFiveList, valueList });
    } catch (e) {
      console.error('加载测评结果失败:', e);
    }
  },

  goToJobAnalysis() {
    wx.navigateTo({ url: '/pages/job-analysis/job-analysis' });
  },

  goToHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },
});
