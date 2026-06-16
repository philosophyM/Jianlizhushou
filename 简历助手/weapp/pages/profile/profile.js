Page({
  data: {
    name: '', phone: '', email: '', targetPosition: '', targetIndustry: '',
    workYearsIndex: 0, yearRange: ['应届','1年','2年','3年','5年','8年','10年+'],
    education: { school: '', degreeIndex: 0, major: '', yearIndex: 0 },
    degreeRange: ['高中','大专','本科','硕士','博士','MBA'],
    yearList: Array.from({length: 30}, (_, i) => (2026 - i) + '届'),
    workExperience: [],
    skills: [],
    skillLevels: ['入门','熟练','精通','专家'],
  },

  onLoad() {
    const saved = wx.getStorageSync('userProfile');
    if (saved) this.setData(saved);
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  onEduInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['education.' + field]: e.detail.value });
  },

  onWorkYearsChange(e) {
    this.setData({ workYearsIndex: e.detail.value });
  },

  onDegreeChange(e) {
    this.setData({ 'education.degreeIndex': e.detail.value });
  },

  onGradYearChange(e) {
    this.setData({ 'education.yearIndex': e.detail.value });
  },

  onWorkExpInput(e) {
    const idx = e.currentTarget.dataset.index;
    const field = e.currentTarget.dataset.field;
    const key = 'workExperience[' + idx + '].' + field;
    this.setData({ [key]: e.detail.value });
  },

  addWorkExp() {
    const list = this.data.workExperience;
    list.push({ company: '', title: '', description: '' });
    this.setData({ workExperience: list });
  },

  removeWorkExp(e) {
    const idx = e.currentTarget.dataset.index;
    const list = this.data.workExperience;
    list.splice(idx, 1);
    this.setData({ workExperience: list });
  },

  onSkillInput(e) {
    const idx = e.currentTarget.dataset.index;
    const field = e.currentTarget.dataset.field;
    const key = 'skills[' + idx + '].' + field;
    this.setData({ [key]: e.detail.value });
  },

  onSkillLevelChange(e) {
    const idx = e.currentTarget.dataset.index;
    const key = 'skills[' + idx + '].levelIndex';
    this.setData({ [key]: e.detail.value });
  },

  addSkill() {
    const list = this.data.skills;
    list.push({ name: '', levelIndex: 0 });
    this.setData({ skills: list });
  },

  removeSkill(e) {
    const idx = e.currentTarget.dataset.index;
    const list = this.data.skills;
    list.splice(idx, 1);
    this.setData({ skills: list });
  },

  saveProfile() {
    if (!this.data.name) {
      wx.showToast({ title: '请填写姓名', icon: 'none' });
      return;
    }
    const profile = {
      name: this.data.name,
      phone: this.data.phone,
      email: this.data.email,
      targetPosition: this.data.targetPosition,
      targetIndustry: this.data.targetIndustry,
      workYears: this.data.workYearsIndex,
      education: {
        school: this.data.education.school,
        degree: this.data.degreeRange[this.data.education.degreeIndex],
        major: this.data.education.major,
        graduationYear: this.data.yearList[this.data.education.yearIndex],
      },
      workExperience: this.data.workExperience,
      skills: this.data.skills.map(s => ({ name: s.name, level: this.data.skillLevels[s.levelIndex] })),
    };
    wx.setStorageSync('userProfile', profile);
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 1500);
  },
});
