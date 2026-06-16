const CareerAssessmentEngine = require('../../utils/career-assessment');

Page({
  data: {
    currentSection: '职业兴趣测评',
    currentIndex: 0,
    totalQuestions: 0,
    progressPercent: 0,
    isFinished: false,
    isLastPage: false,
    currentQuestion: {},
    options: [
      { label: '完全不同意', score: 1, selected: false },
      { label: '比较不同意', score: 2, selected: false },
      { label: '不确定', score: 3, selected: false },
      { label: '比较同意', score: 4, selected: false },
      { label: '完全同意', score: 5, selected: false },
    ],
    // 存储所有答案
    answers: {
      holland: {},
      bigFive: {},
      values: {},
      skills: {},
    },
    // 问题队列
    questionQueue: [],
    sections: [
      { name: '职业兴趣测评', key: 'holland', questions: [] },
      { name: '人格特质测评', key: 'bigFive', questions: [] },
      { name: '职业价值观测评', key: 'values', questions: [] },
      { name: '技能自评', key: 'skills', questions: [] },
    ],
  },

  onLoad() {
    this.buildQuestionQueue();
  },

  buildQuestionQueue() {
    const allQuestions = CareerAssessmentEngine.getAllQuestions();
    const queue = [];
    
    // 构建有序问题队列
    const hollandQs = allQuestions.holland.map(q => ({ ...q, section: '职业兴趣测评', sectionKey: 'holland' }));
    const bigFiveQs = allQuestions.bigFive.map(q => ({ ...q, section: '人格特质测评', sectionKey: 'bigFive' }));
    const valuesQs = allQuestions.values.map(q => ({ ...q, section: '职业价值观测评', sectionKey: 'values' }));
    const skillsQs = allQuestions.skills.map((s, i) => ({ 
      id: s.id,
      section: '技能自评',
      sectionKey: 'skills',
      text: '你的【' + s.name + '】能力水平如何？',
      dimension: s.category,
      type: 'skill',
    }));

    queue.push(...hollandQs, ...bigFiveQs, ...valuesQs, ...skillsQs);

    this.setData({
      questionQueue: queue,
      totalQuestions: queue.length,
      currentQuestion: queue[0],
    });
  },

  selectOption(e) {
    const score = parseInt(e.currentTarget.dataset.score);
    const options = this.data.options.map(opt => ({
      ...opt,
      selected: opt.score === score,
    }));
    this.setData({ options });
  },

  nextQuestion() {
    const { currentQuestion, currentIndex, questionQueue, answers, options } = this.data;
    const selectedScore = options.find(o => o.selected)?.score;

    if (!selectedScore) {
      wx.showToast({ title: '请选择一个选项', icon: 'none' });
      return;
    }

    // 保存答案
    const sectionKey = currentQuestion.sectionKey;
    answers[sectionKey][currentQuestion.id] = selectedScore;
    this.setData({ answers });

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questionQueue.length) {
      this.finishAssessment();
      return;
    }

    const nextQ = questionQueue[nextIndex];
    const progressPercent = Math.round(((nextIndex) / questionQueue.length) * 100);

    this.setData({
      currentIndex: nextIndex,
      currentQuestion: nextQ,
      currentSection: nextQ.section,
      isLastPage: nextIndex === questionQueue.length - 1,
      progressPercent,
      options: this.data.options.map(o => ({ ...o, selected: false })),
    });
  },

  prevQuestion() {
    const prevIndex = Math.max(0, this.data.currentIndex - 1);
    const prevQ = this.data.questionQueue[prevIndex];
    this.setData({
      currentIndex: prevIndex,
      currentQuestion: prevQ,
      currentSection: prevQ.section,
      isLastPage: false,
      progressPercent: Math.round((prevIndex / this.data.questionQueue.length) * 100),
      options: this.data.options.map(o => ({ ...o, selected: false })),
    });
  },

  finishAssessment() {
    const answers = this.data.answers;
    
    // 计算测评结果
    const report = CareerAssessmentEngine.generateFullReport(answers);
    
    // 保存结果
    wx.setStorageSync('assessment_result', report);
    wx.setStorageSync('assessment_completed', true);
    wx.setStorageSync('assessment_answers', answers);

    this.setData({ isFinished: true });
  },

  viewResult() {
    wx.redirectTo({ url: '/pages/result/result' });
  },
});
