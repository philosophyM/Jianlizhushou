/**
 * 简历助手 — 职业测评引擎
 * 
 * 基于学术研究的综合职业测评算法：
 * - Holland RIASEC 职业兴趣（30题，5点Likert）
 * - Big Five (OCEAN) 人格（10题，5点Likert）
 * - Super 职业价值观（10题，5点Likert）
 * - 技能自评（15项技能，4级水平）
 * 
 * 参考文献详见 /research/ 目录
 */

// ==========================================
// 1. 霍兰德职业兴趣测评 (RIASEC)
// ==========================================

const HOLLAND_QUESTIONS = [
  // 现实型 (R)
  { id: 'r1', type: 'R', text: '我喜欢动手修理或组装物品', dimension: 'realistic', reverse: false },
  { id: 'r2', type: 'R', text: '我更喜欢户外活动而不是室内办公', dimension: 'realistic', reverse: false },
  { id: 'r3', type: 'R', text: '我对机械或工具如何工作感到好奇', dimension: 'realistic', reverse: false },
  { id: 'r4', type: 'R', text: '我擅长手工制作或操作设备', dimension: 'realistic', reverse: false },
  { id: 'r5', type: 'R', text: '相比理论分析，我更愿意做实际的、动手的工作', dimension: 'realistic', reverse: false },
  // 研究型 (I)
  { id: 'i1', type: 'I', text: '我喜欢深入探索一个科学问题', dimension: 'investigative', reverse: false },
  { id: 'i2', type: 'I', text: '阅读学术文章或研究报告让我感到兴奋', dimension: 'investigative', reverse: false },
  { id: 'i3', type: 'I', text: '我喜欢用数据和分析来解决问题', dimension: 'investigative', reverse: false },
  { id: 'i4', type: 'I', text: '我经常思考抽象的概念和理论', dimension: 'investigative', reverse: false },
  { id: 'i5', type: 'I', text: '做实验或测试想法是我喜欢的工作方式', dimension: 'investigative', reverse: false },
  // 艺术型 (A)
  { id: 'a1', type: 'A', text: '我经常有创意和新颖的想法', dimension: 'artistic', reverse: false },
  { id: 'a2', type: 'A', text: '我喜欢通过写作、绘画、音乐等方式表达自己', dimension: 'artistic', reverse: false },
  { id: 'a3', type: 'A', text: '我欣赏美和艺术，容易被美感打动', dimension: 'artistic', reverse: false },
  { id: 'a4', type: 'A', text: '在自由、没有约束的环境中我最有创造力', dimension: 'artistic', reverse: false },
  { id: 'a5', type: 'A', text: '我宁愿做一个有创意的项目也不愿按部就班工作', dimension: 'artistic', reverse: false },
  // 社会型 (S)
  { id: 's1', type: 'S', text: '我乐于帮助他人解决问题或成长', dimension: 'social', reverse: false },
  { id: 's2', type: 'S', text: '我喜欢与人交流，倾听他们的故事', dimension: 'social', reverse: false },
  { id: 's3', type: 'S', text: '教导或培训他人让我有成就感', dimension: 'social', reverse: false },
  { id: 's4', type: 'S', text: '在团队合作中我感到精力充沛', dimension: 'social', reverse: false },
  { id: 's5', type: 'S', text: '关心他人的福祉是我重要的价值观', dimension: 'social', reverse: false },
  // 企业型 (E)
  { id: 'e1', type: 'E', text: '我喜欢领导团队并影响他人的决定', dimension: 'enterprising', reverse: false },
  { id: 'e2', type: 'E', text: '我对商业机会和市场趋势很敏感', dimension: 'enterprising', reverse: false },
  { id: 'e3', type: 'E', text: '说服他人接受我的观点对我来说不难', dimension: 'enterprising', reverse: false },
  { id: 'e4', type: 'E', text: '我敢于冒险并且乐于接受挑战', dimension: 'enterprising', reverse: false },
  { id: 'e5', type: 'E', text: '我为自己设定高目标并努力实现', dimension: 'enterprising', reverse: false },
  // 常规型 (C)
  { id: 'c1', type: 'C', text: '我喜欢按照既定的流程和规范行事', dimension: 'conventional', reverse: false },
  { id: 'c2', type: 'C', text: '我在整理数据和文档方面很有条理', dimension: 'conventional', reverse: false },
  { id: 'c3', type: 'C', text: '我重视精确性和细节', dimension: 'conventional', reverse: false },
  { id: 'c4', type: 'C', text: '我喜欢清晰的工作指引和稳定的环境', dimension: 'conventional', reverse: false },
  { id: 'c5', type: 'C', text: '完成日常事务性工作让我感到满足', dimension: 'conventional', reverse: false },
];

// ==========================================
// 2. 大五人格测评 (Big Five / BFI-10改编)
// ==========================================

const BIGFIVE_QUESTIONS = [
  // 开放性 (O)
  { id: 'o1', dimension: 'openness', text: '我认为自己是一个想象力丰富的人', reverse: false },
  { id: 'o2', dimension: 'openness', text: '我更喜欢熟悉的环境和常规活动', reverse: true },
  // 尽责性 (C)
  { id: 'c1', dimension: 'conscientiousness', text: '我会把事情做得彻底且完美', reverse: false },
  { id: 'c2', dimension: 'conscientiousness', text: '我经常把事情搁置到最后一刻', reverse: true },
  // 外向性 (E)
  { id: 'e1', dimension: 'extraversion', text: '我在社交场合中很活跃、健谈', reverse: false },
  { id: 'e2', dimension: 'extraversion', text: '我更喜欢独处或与少数人相处', reverse: true },
  // 宜人性 (A)
  { id: 'a1', dimension: 'agreeableness', text: '我通常信任他人并相信人性本善', reverse: false },
  { id: 'a2', dimension: 'agreeableness', text: '我倾向于挑别人的毛病', reverse: true },
  // 神经质 (N)
  { id: 'n1', dimension: 'neuroticism', text: '我很容易感到焦虑或紧张', reverse: false },
  { id: 'n2', dimension: 'neuroticism', text: '我在大多数情况下能保持情绪稳定', reverse: true },
];

// ==========================================
// 3. 职业价值观 (Super's WVI 改编)
// ==========================================

const VALUES_QUESTIONS = [
  { id: 'v1', dimension: 'achievement', text: '工作中获得成就感对我非常重要', reverse: false },
  { id: 'v2', dimension: 'creativity', text: '我需要在工作中发挥创造力', reverse: false },
  { id: 'v3', dimension: 'independence', text: '我希望自主安排工作方式和时间', reverse: false },
  { id: 'v4', dimension: 'economic', text: '高收入和经济保障是我的首要考虑', reverse: false },
  { id: 'v5', dimension: 'security', text: '工作稳定、有长期保障对我很重要', reverse: false },
  { id: 'v6', dimension: 'prestige', text: '我介意他人对我职业的看法和评价', reverse: false },
  { id: 'v7', dimension: 'altruism', text: '帮助他人是我工作的核心动力', reverse: false },
  { id: 'v8', dimension: 'relationships', text: '良好的同事关系对工作满意度影响很大', reverse: false },
  { id: 'v9', dimension: 'management', text: '我希望有机会领导和指导他人', reverse: false },
  { id: 'v10', dimension: 'lifestyle', text: '工作与生活平衡比职业成就更重要', reverse: false },
];

// ==========================================
// 4. 技能自评 (15项核心技能)
// ==========================================

const SKILLS_ITEMS = [
  { id: 'tech_1', category: 'technical', name: '数据分析', level: 0 },
  { id: 'tech_2', category: 'technical', name: '编程/技术', level: 0 },
  { id: 'tech_3', category: 'technical', name: '书面表达', level: 0 },
  { id: 'tech_4', category: 'technical', name: '外语能力', level: 0 },
  { id: 'tech_5', category: 'technical', name: '项目管理', level: 0 },
  { id: 'inter_1', category: 'interpersonal', name: '沟通表达', level: 0 },
  { id: 'inter_2', category: 'interpersonal', name: '团队协作', level: 0 },
  { id: 'inter_3', category: 'interpersonal', name: '人际交往', level: 0 },
  { id: 'analyt_1', category: 'analytical', name: '批判性思维', level: 0 },
  { id: 'analyt_2', category: 'analytical', name: '问题解决', level: 0 },
  { id: 'analyt_3', category: 'analytical', name: '学习能力', level: 0 },
  { id: 'creative_1', category: 'creative', name: '创意思维', level: 0 },
  { id: 'creative_2', category: 'creative', name: '设计审美', level: 0 },
  { id: 'leader_1', category: 'leadership', name: '组织协调', level: 0 },
  { id: 'leader_2', category: 'leadership', name: '决策能力', level: 0 },
];

// ==========================================
// 5. 职业推荐数据库
// ==========================================

const CAREER_DATABASE = [
  // RIASEC 六型对应的推荐职业簇
  {
    code: 'R',
    name: '现实型',
    careers: ['机械工程师', '电气工程师', '建筑设计师', '技术员', '工艺工程师', '施工管理', '运维工程师'],
    personJobFit: { conscientiousness: 0.7, extraversion: 0.2, agreeableness: 0.5, openness: 0.4, neuroticism: 0.3 },
    valueWeights: { security: 0.8, economic: 0.7, independence: 0.4, achievement: 0.6, lifestyle: 0.5 }
  },
  {
    code: 'I',
    name: '研究型',
    careers: ['研发工程师', '数据分析师', '科研人员', '算法工程师', '咨询分析师', '市场研究员', '金融分析师'],
    personJobFit: { conscientiousness: 0.6, extraversion: 0.3, agreeableness: 0.4, openness: 0.8, neuroticism: 0.4 },
    valueWeights: { achievement: 0.8, creativity: 0.7, independence: 0.7, economic: 0.6, prestige: 0.6 }
  },
  {
    code: 'A',
    name: '艺术型',
    careers: ['UI/UX设计师', '内容运营', '品牌策划', '文案编辑', '视频编导', '产品经理', '广告创意'],
    personJobFit: { conscientiousness: 0.4, extraversion: 0.5, agreeableness: 0.5, openness: 0.9, neuroticism: 0.5 },
    valueWeights: { creativity: 0.9, independence: 0.8, achievement: 0.6, lifestyle: 0.6, prestige: 0.5 }
  },
  {
    code: 'S',
    name: '社会型',
    careers: ['人力资源', '教师/培训师', '心理咨询师', '客服管理', '护士/健康管理', '社会工作', '销售支持'],
    personJobFit: { conscientiousness: 0.5, extraversion: 0.7, agreeableness: 0.8, openness: 0.5, neuroticism: 0.4 },
    valueWeights: { altruism: 0.9, relationships: 0.8, achievement: 0.5, security: 0.6, lifestyle: 0.5 }
  },
  {
    code: 'E',
    name: '企业型',
    careers: ['销售经理', '市场总监', '项目经理', '创业创始人', '商务拓展', '投资顾问', '企业管理'],
    personJobFit: { conscientiousness: 0.6, extraversion: 0.8, agreeableness: 0.4, openness: 0.6, neuroticism: 0.5 },
    valueWeights: { achievement: 0.8, economic: 0.8, prestige: 0.8, management: 0.8, independence: 0.6 }
  },
  {
    code: 'C',
    name: '常规型',
    careers: ['财务会计', '行政专员', '数据录入', '审计', '运营专员', '人事专员', '物流管理'],
    personJobFit: { conscientiousness: 0.8, extraversion: 0.3, agreeableness: 0.6, openness: 0.3, neuroticism: 0.3 },
    valueWeights: { security: 0.9, economic: 0.7, lifestyle: 0.7, relationships: 0.5, achievement: 0.4 }
  },
];

// 混合型职业 (两个以上RIASEC代码的组合)
const HYBRID_CAREERS = [
  { code: ['R', 'I'], careers: ['测试工程师', '质量工程师', '数据工程师', '硬件工程师'] },
  { code: ['I', 'A'], careers: ['UX研究员', '数据可视化设计师', '技术写作', '产品设计师'] },
  { code: ['S', 'E'], careers: ['销售管理', '客户成功经理', '咨询顾问', '培训经理'] },
  { code: ['I', 'E'], careers: ['产品经理', '战略咨询', '投资分析师', '科技创业'] },
  { code: ['A', 'S'], careers: ['内容策划', '品牌运营', '新媒体运营', '活动策划'] },
  { code: ['R', 'C'], careers: ['财务系统管理', '供应链管理', '质量管理', '标准化工程师'] },
  { code: ['S', 'A', 'I'], careers: ['心理咨询师', '职业规划师', '用户体验研究员'] },
  { code: ['E', 'C', 'I'], careers: ['金融分析师', '风险管理', '商业分析师'] },
];

// ==========================================
// 6. 测评引擎核心函数
// ==========================================

const CareerAssessmentEngine = {
  /**
   * 获取所有测评题目
   */
  getAllQuestions() {
    return {
      holland: HOLLAND_QUESTIONS,
      bigFive: BIGFIVE_QUESTIONS,
      values: VALUES_QUESTIONS,
      skills: SKILLS_ITEMS,
    };
  },

  /**
   * 获取测评进度信息
   */
  getAssessmentProgress() {
    return {
      holland: { total: HOLLAND_QUESTIONS.length, label: '职业兴趣' },
      bigFive: { total: BIGFIVE_QUESTIONS.length, label: '人格特质' },
      values: { total: VALUES_QUESTIONS.length, label: '职业价值观' },
      skills: { total: SKILLS_ITEMS.length, label: '技能评估' },
    };
  },

  /**
   * 计算 RIASEC 分数
   * @param {Object} answers - { questionId: score(1-5) }
   * @returns {Object} { realistic, investigative, artistic, social, enterprising, conventional }
   */
  calculateHolland(answers) {
    const dimensions = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];
    const scores = {};
    
    dimensions.forEach(dim => {
      const questions = HOLLAND_QUESTIONS.filter(q => q.dimension === dim);
      let sum = 0;
      questions.forEach(q => {
        let score = answers[q.id] || 3;
        if (q.reverse) score = 6 - score;
        sum += score;
      });
      scores[dim] = +(sum / questions.length).toFixed(1);
    });

    // 排序获取前三类型
    const sorted = dimensions
      .map(d => ({ dimension: d, score: scores[d], label: getDimensionLabel(d) }))
      .sort((a, b) => b.score - a.score);

    return {
      scores,
      top3: sorted.slice(0, 3),
      code: sorted.slice(0, 3).map(s => s.dimension.charAt(0).toUpperCase()).join(''),
    };
  },

  /**
   * 计算大五人格分数
   * 每维度2题，范围 2-10
   */
  calculateBigFive(answers) {
    const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const scores = {};
    const descriptions = {};

    dimensions.forEach(dim => {
      const questions = BIGFIVE_QUESTIONS.filter(q => q.dimension === dim);
      let sum = 0;
      questions.forEach(q => {
        let score = answers[q.id] || 3;
        if (q.reverse) score = 6 - score;
        sum += score;
      });
      // 映射到 1-100 分制
      const rawScore = sum;
      const normalizedScore = Math.round(((rawScore - 2) / 8) * 100);
      scores[dim] = normalizedScore;
      descriptions[dim] = describeBigFive(dim, normalizedScore);
    });

    return { scores, descriptions };
  },

  /**
   * 计算职业价值观分数
   */
  calculateValues(answers) {
    const dimensions = ['achievement', 'creativity', 'independence', 'economic', 'security',
      'prestige', 'altruism', 'relationships', 'management', 'lifestyle'];
    const scores = {};

    dimensions.forEach(dim => {
      const q = VALUES_QUESTIONS.find(v => v.dimension === dim);
      let score = answers[q.id] || 3;
      if (q.reverse) score = 6 - score;
      scores[dim] = score;
    });

    // 排序显示最重要的价值观
    const sorted = Object.entries(scores)
      .map(([dimension, score]) => ({ dimension, score, label: getValueLabel(dimension) }))
      .sort((a, b) => b.score - a.score);

    return { scores, sorted };
  },

  /**
   * 计算技能评估
   */
  calculateSkills(answers) {
    const categories = ['technical', 'interpersonal', 'analytical', 'creative', 'leadership'];
    const categoryScores = {};

    categories.forEach(cat => {
      const items = SKILLS_ITEMS.filter(s => s.category === cat);
      let sum = 0;
      items.forEach(item => {
        sum += answers[item.id] || 0;
      });
      categoryScores[cat] = +(sum / items.length).toFixed(1);
    });

    return { categoryScores, skills: SKILLS_ITEMS.map(s => ({ ...s, level: answers[s.id] || 0 })) };
  },

  /**
   * 综合测评分析 - 生成完整测评报告
   */
  generateFullReport(allAnswers) {
    const holland = this.calculateHolland(allAnswers.holland || {});
    const bigFive = this.calculateBigFive(allAnswers.bigFive || {});
    const values = this.calculateValues(allAnswers.values || {});
    const skills = this.calculateSkills(allAnswers.skills || {});

    // 推荐职业
    const recommendedCareers = this.recommendCareers(holland, bigFive, values, skills);

    return {
      timestamp: new Date().toISOString(),
      holland,
      bigFive,
      values,
      skills,
      recommendedCareers: recommendedCareers.slice(0, 8),
      summary: generateSummary(holland, bigFive, values, skills, recommendedCareers),
    };
  },

  /**
   * 基于多维度匹配的职业推荐算法
   */
  recommendCareers(holland, bigFive, values, skills) {
    const recommendations = [];
    const hollandCode = holland.code;
    const topTypes = holland.top3.map(t => t.dimension.charAt(0).toUpperCase());

    // 1. 基于霍兰德类型的推荐
    for (const type of topTypes) {
      const careerCluster = CAREER_DATABASE.find(c => c.code === type);
      if (!careerCluster) continue;

      // 计算人格匹配度
      const personFit = this.calculatePersonJobFit(bigFive.scores, careerCluster.personJobFit);
      
      // 计算价值观匹配度
      const valueFit = this.calculateValueFit(values.scores, careerCluster.valueWeights);

      const overallFit = Math.round(personFit * 0.5 + valueFit * 0.5);

      careerCluster.careers.forEach(career => {
        recommendations.push({
          career,
          type: careerCluster.name,
          code: type,
          matchScore: overallFit,
          personFit: Math.round(personFit),
          valueFit: Math.round(valueFit),
          reason: generateReason(type, personFit, valueFit),
        });
      });
    }

    // 2. 添加混合型推荐
    for (const hybrid of HYBRID_CAREERS) {
      const matchCount = hybrid.code.filter(c => topTypes.includes(c)).length;
      if (matchCount >= 2) {
        hybrid.careers.forEach(career => {
          recommendations.push({
            career,
            type: '综合推荐',
            code: hybrid.code.join(''),
            matchScore: 70 + matchCount * 10,
            personFit: 70,
            valueFit: 65,
            reason: '你的多维特质非常适合这类综合型职业',
          });
        });
      }
    }

    // 按匹配度排序去重
    const seen = new Set();
    return recommendations
      .filter(r => {
        if (seen.has(r.career)) return false;
        seen.add(r.career);
        return true;
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  },

  /**
   * 计算人-人格匹配度 (基于大五人格)
   */
  calculatePersonJobFit(userScores, jobFitProfile) {
    let totalFit = 0;
    let maxFit = 0;
    for (const [dim, weight] of Object.entries(jobFitProfile)) {
      const userScore = (userScores[dim] || 50) / 100;
      const fit = 1 - Math.abs(userScore - weight);
      totalFit += fit * weight;
      maxFit += weight;
    }
    return maxFit > 0 ? (totalFit / maxFit) * 100 : 50;
  },

  /**
   * 计算价值观匹配度
   */
  calculateValueFit(userValues, jobValues) {
    let totalFit = 0;
    let totalWeight = 0;
    for (const [dim, weight] of Object.entries(jobValues)) {
      const userScore = (userValues[dim] || 3) / 5;
      totalFit += userScore * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? (totalFit / totalWeight) * 100 : 50;
  },
};

// ==========================================
// 7. 辅助函数
// ==========================================

function getDimensionLabel(dim) {
  const labels = {
    realistic: '现实型', investigative: '研究型', artistic: '艺术型',
    social: '社会型', enterprising: '企业型', conventional: '常规型',
  };
  return labels[dim] || dim;
}

function getValueLabel(dim) {
  const labels = {
    achievement: '成就感', creativity: '创造性', independence: '独立性',
    economic: '经济报酬', security: '安全感', prestige: '社会地位',
    altruism: '助人', relationships: '人际关系', management: '管理',
    lifestyle: '生活方式',
  };
  return labels[dim] || dim;
}

function describeBigFive(dim, score) {
  const descriptions = {
    openness: score >= 70 ? '你思想开放，富有想象力和好奇心，喜欢尝试新事物' 
      : score >= 40 ? '你在开放性和务实之间取得平衡，能适应不同情境'
      : '你比较务实和传统，偏好熟悉可靠的方式',
    conscientiousness: score >= 70 ? '你高度自律、有条理、可靠，做事追求卓越'
      : score >= 40 ? '你做事有条理但也能灵活应变'
      : '你比较随性和自由，不喜欢被规则束缚',
    extraversion: score >= 70 ? '你性格外向，社交活跃，在人群中充满能量'
      : score >= 40 ? '你的社交风格灵活，既能独处也能社交'
      : '你性格偏内向，喜欢深度而非广度的社交',
    agreeableness: score >= 70 ? '你友善合作，善于共情，重视人际关系和谐'
      : score >= 40 ? '你在友善和坚持己见之间取得了平衡'
      : '你比较直接独立，有时会质疑他人的意见',
    neuroticism: score >= 70 ? '你对外界压力比较敏感，需要注意情绪调节'
      : score >= 40 ? '你的情绪稳定性处于正常范围'
      : '你情绪稳定，抗压能力强，不易受外界干扰',
  };
  return descriptions[dim] || '';
}

function generateReason(type, personFit, valueFit) {
  const reasons = {
    R: '你的动手能力和技术倾向适合实操型工作',
    I: '你的分析思维和研究精神适合探索型工作',
    A: '你的创造力和审美能力适合创意型工作',
    S: '你的人际关怀和合作精神适合服务型工作',
    E: '你的领导力和商业头脑适合管理型工作',
    C: '你的细致和条理性适合规范化工作',
  };
  return reasons[type] || '综合匹配度高';
}

function generateSummary(holland, bigFive, values, skills, careers) {
  const topCareer = careers[0];
  return {
    title: `${getDimensionLabel(holland.top3[0]?.dimension)}-${getDimensionLabel(holland.top3[1]?.dimension)}型`,
    topCareer: topCareer?.career || '待探索',
    topMatch: topCareer?.matchScore || 0,
    brief: `根据测评，你的职业兴趣偏向${holland.top3.map(t => getDimensionLabel(t.dimension)).join('、')}类型。${topCareer ? '最适合你的职业方向是「' + topCareer.career + '」，综合匹配度' + topCareer.matchScore + '%。' : ''}`,
  };
}

module.exports = CareerAssessmentEngine;
if (typeof window !== 'undefined') {
  window.CareerAssessmentEngine = CareerAssessmentEngine;
}
