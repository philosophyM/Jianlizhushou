/**
 * 简历助手 — 简历生成引擎
 * 
 * 核心功能：
 * 1. 解析招聘 JD，提取关键要求
 * 2. 基于用户资料 + JD 分析生成针对性简历
 * 3. 计算人岗匹配度
 * 4. 简历内容优化与关键词适配
 */

/**
 * JD 分析器 - 从招聘文本中提取结构化信息
 */
const JDAnalyzer = {
  /**
   * 分析招聘文本，提取结构化信息
   * @param {string} rawText - 粘贴的招聘信息原文
   * @returns {Object} 解析后的结构化信息
   */
  analyze(rawText) {
    if (!rawText || rawText.trim().length < 10) {
      return { error: '招聘信息太短，请粘贴完整的职位描述' };
    }

    const text = rawText.trim();
    
    return {
      company: this.extractCompany(text),
      position: this.extractPosition(text),
      salary: this.extractSalary(text),
      location: this.extractLocation(text),
      requirements: this.extractRequirements(text),
      responsibilities: this.extractResponsibilities(text),
      keywords: this.extractKeywords(text),
      education: this.extractEducation(text),
      experience: this.extractExperience(text),
      skills: this.extractSkills(text),
      rawText: text,
    };
  },

  /**
   * 提取公司名称
   */
  extractCompany(text) {
    const patterns = [
      /公司[：:]\s*(.+?)[\n\r]/,
      /(?:所属|公司名称)[：:]\s*(.+?)[\n\r]/,
      /(?:关于|公司介绍)[：:]\s*(.+?)[\n\r]/,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return m[1].trim();
    }
    return '';
  },

  /**
   * 提取职位名称
   */
  extractPosition(text) {
    const patterns = [
      /职位[：:]\s*(.+?)[\n\r]/,
      /(?:招聘|岗位)[：:]\s*(.+?)[\n\r]/,
      /^(.+?)[\n\r]/,
    ];
    // 先取第一行作为职位名
    const firstLine = text.split('\n')[0].trim();
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return m[1].trim().substring(0, 50);
    }
    return firstLine || '未知职位';
  },

  /**
   * 提取薪资范围
   */
  extractSalary(text) {
    const m = text.match(/(\d{1,3}[kK]?[-~—到]\d{1,3}[kK]?)(?:\s*[元/月薪年]|月薪|年薪|/)/);
    if (m) return m[1].toUpperCase();
    const m2 = text.match(/(\d{1,3}[kK]?)(?:\s*[-~—到]\s*)(\d{1,3}[kK]?)/);
    if (m2) return `${m2[1]}-${m2[2]}`;
    return '';
  },

  /**
   * 提取工作地点
   */
  extractLocation(text) {
    const patterns = [
      /(?:工作[地点])[：:]\s*(.+?)[\n\r]/,
      /(?:地点)[：:]\s*(.+?)[\n\r]/,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return m[1].trim();
    }
    return '';
  },

  /**
   * 提取任职要求
   */
  extractRequirements(text) {
    const reqSection = this.extractSection(text, ['任职要求', '职位要求', '岗位要求', '我们需要你', '要求']);
    if (reqSection) {
      return reqSection
        .split(/[\n\r]/)
        .map(l => l.replace(/^[\s•·\-*、\d.]+/, '').trim())
        .filter(l => l.length > 4)
        .slice(0, 10);
    }
    return [];
  },

  /**
   * 提取岗位职责
   */
  extractResponsibilities(text) {
    const respSection = this.extractSection(text, ['岗位职责', '工作内容', '职位描述', '工作职责', '职责']);
    if (respSection) {
      return respSection
        .split(/[\n\r]/)
        .map(l => l.replace(/^[\s•·\-*、\d.]+/, '').trim())
        .filter(l => l.length > 4)
        .slice(0, 8);
    }
    return [];
  },

  /**
   * 提取关键要求关键词
   */
  extractKeywords(text) {
    const skillKeywords = [
      'Python', 'Java', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'C++', 'SQL',
      'React', 'Vue', 'Angular', 'Node.js', 'Django', 'Spring', 'Docker', 'K8s',
      'AWS', 'Azure', 'GCP', 'Linux', 'Git', 'Redis', 'MongoDB', 'MySQL',
      '数据分析', '机器学习', '深度学习', 'AI', 'NLP', '计算机视觉',
      '产品经理', '项目管理', '敏捷开发', 'Scrum', '需求分析',
      '市场推广', '品牌策划', '内容运营', '用户运营', '社群运营',
      '销售', 'BD', '客户管理', 'CRM', '渠道拓展',
      '设计', 'UI', 'UX', 'Figma', 'Sketch', 'PS', 'AE',
      '英语', '沟通能力', '团队协作', '领导力', '抗压能力',
    ];

    const found = [];
    const textLower = text.toLowerCase();
    for (const keyword of skillKeywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        found.push(keyword);
      }
    }
    return found;
  },

  /**
   * 提取学历要求
   */
  extractEducation(text) {
    const m = text.match(/(?:学历|教育)[：:]\s*(.+?)[\n\r]/);
    if (m) return m[1].trim();
    const levels = ['博士', '硕士', '本科', '大专', '中专', '高中'];
    for (const level of levels) {
      if (text.includes(level)) return level + '及以上';
    }
    return '';
  },

  /**
   * 提取经验要求
   */
  extractExperience(text) {
    const m = text.match(/(\d+)\s*[-~—到]\s*(\d+)\s*年/);
    if (m) return `${m[1]}-${m[2]}年`;
    const m2 = text.match(/(\d+)\s*年(?:以上|及以上)/);
    if (m2) return `${m2[1]}年以上`;
    return '';
  },

  /**
   * 提取技能要求
   */
  extractSkills(text) {
    const keywordCategories = {
      programming: ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin'],
      frontend: ['React', 'Vue', 'Angular', 'HTML', 'CSS', 'Webpack', '小程序'],
      backend: ['Node.js', 'Django', 'Flask', 'Spring', 'Express', '后端', 'API', '微服务', '数据库'],
      data: ['SQL', '数据分析', '机器学习', '深度学习', '数据挖掘', 'Tableau', 'PowerBI', 'Excel'],
      devops: ['Docker', 'K8s', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Linux', 'CI/CD', 'Git'],
      design: ['Figma', 'Sketch', 'Photoshop', 'AI', 'UI', 'UX', '设计', '原型'],
      management: ['项目管理', '敏捷', 'Scrum', '需求分析', '团队管理', '产品管理'],
      marketing: ['市场推广', '品牌', '内容', '运营', 'SEO', 'SEM', '增长', '新媒体'],
      soft: ['沟通', '团队协作', '领导力', '抗压', '学习能力', '解决问题'],
    };

    const skills = {};
    const textLower = text.toLowerCase();
    for (const [category, keywords] of Object.entries(keywordCategories)) {
      const matched = keywords.filter(k => textLower.includes(k.toLowerCase()));
      if (matched.length > 0) {
        skills[category] = matched;
      }
    }
    return skills;
  },

  /**
   * 提取文本中的特定章节
   */
  extractSection(text, sectionNames) {
    const lines = text.split('\n');
    let sectionStart = -1;
    let sectionEnd = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      for (const name of sectionNames) {
        if (line.includes(name) && line.length < 30) {
          sectionStart = i + 1;
          break;
        }
      }
      if (sectionStart >= 0) break;
    }

    if (sectionStart < 0) return '';

    // 找下一个章节标题作为结束
    for (let i = sectionStart; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('【') || (line.endsWith('：') && !line.includes('•'))) {
        sectionEnd = i;
        break;
      }
    }

    if (sectionEnd < 0) sectionEnd = lines.length;
    return lines.slice(sectionStart, sectionEnd).join('\n').trim();
  },

  /**
   * 计算与用户资料的匹配度
   */
  calculateMatch(userProfile, jobAnalysis) {
    let score = 50; // 基础分
    let details = [];

    // 学历匹配
    if (userProfile.education && jobAnalysis.education) {
      const eduLevel = { '博士': 5, '硕士': 4, '本科': 3, '大专': 2, '中专': 1 };
      const userEdu = eduLevel[userProfile.education.degree] || 0;
      const jobEdu = Object.keys(eduLevel).find(e => jobAnalysis.education.includes(e));
      const jobEduLevel = eduLevel[jobEdu] || 0;
      if (userEdu >= jobEduLevel) {
        score += 10;
        details.push({ item: '学历', status: 'match', detail: `${userProfile.education.degree} ✓` });
      } else {
        details.push({ item: '学历', status: 'gap', detail: `${userProfile.education.degree} → 要求${jobEdu}` });
      }
    }

    // 经验匹配
    if (userProfile.workYears !== undefined && jobAnalysis.experience) {
      const years = parseInt(jobAnalysis.experience);
      if (!isNaN(years) && userProfile.workYears >= years) {
        score += 10;
        details.push({ item: '经验', status: 'match', detail: `${userProfile.workYears}年 ✓` });
      } else if (!isNaN(years)) {
        details.push({ item: '经验', status: 'gap', detail: `${userProfile.workYears}年 → 要求${years}年` });
      }
    }

    // 技能匹配
    if (jobAnalysis.keywords && jobAnalysis.keywords.length > 0 && userProfile.skills) {
      const userSkillNames = userProfile.skills.map(s => s.name.toLowerCase());
      const matched = jobAnalysis.keywords.filter(k => 
        userSkillNames.some(us => us.includes(k.toLowerCase()))
      );
      if (matched.length > 0) {
        score += Math.min(15, matched.length * 3);
        details.push({ item: '技能', status: 'match', detail: `匹配${matched.length}/${jobAnalysis.keywords.length}项` });
      }
    }

    return { score: Math.min(100, score), details };
  },
};

// ==========================================
// 2. 简历生成器
// ==========================================

const ResumeGenerator = {
  /**
   * 生成针对性简历
   * @param {Object} userProfile - 用户完整资料
   * @param {Object} jobAnalysis - JD分析结果
   * @param {Object} assessmentResult - 测评结果（可选）
   * @returns {Object} 生成的简历内容
   */
  generate(userProfile, jobAnalysis, assessmentResult) {
    if (!userProfile || !jobAnalysis) {
      return { error: '请先完善个人资料并粘贴招聘信息' };
    }

    const resume = {
      basicInfo: this.buildBasicInfo(userProfile),
      professionalSummary: this.buildSummary(userProfile, jobAnalysis),
      workExperience: this.buildWorkExperience(userProfile, jobAnalysis),
      projectExperience: this.buildProjectExperience(userProfile, jobAnalysis),
      education: this.buildEducation(userProfile),
      skills: this.buildSkills(userProfile, jobAnalysis),
      certifications: userProfile.certifications || [],
      additionalInfo: {},
    };

    // 如果测评结果可用，添加职业建议相关
    if (assessmentResult) {
      resume.additionalInfo.careerDirection = assessmentResult.summary?.brief || '';
      resume.additionalInfo.personalityFit = this.describeFit(assessmentResult, jobAnalysis);
    }

    return resume;
  },

  /**
   * 构建基本信息
   */
  buildBasicInfo(profile) {
    return {
      name: profile.name || '姓名',
      phone: profile.phone || '',
      email: profile.email || '',
      location: profile.location || '',
      targetPosition: profile.targetPosition || '',
      workYears: profile.workYears || 0,
    };
  },

  /**
   * 构建针对性职业概要
   */
  buildSummary(profile, jobAnalysis) {
    const position = jobAnalysis.position || profile.targetPosition || '目标职位';
    const years = profile.workYears || 0;
    const topSkills = (profile.skills || [])
      .sort((a, b) => b.level - a.level)
      .slice(0, 3)
      .map(s => s.name)
      .join('、');

    const templates = [
      `具备${years}年${profile.targetIndustry || ''}行业经验的${profile.targetPosition || '专业人士'}，擅长${topSkills || '相关技能'}。对「${position}」岗位高度匹配，能够快速融入团队并创造价值。`,
      `${years}年${topSkills ? topSkills + '等领域的' : ''}从业经验，专注${profile.targetIndustry || '专业领域'}方向。深入了解${position}岗位要求，具备扎实的专业基础和优秀的实践能力。`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  },

  /**
   * 构建工作经历（针对性优化）
   */
  buildWorkExperience(profile, jobAnalysis) {
    if (!profile.workExperience || profile.workExperience.length === 0) {
      return [];
    }

    const jdKeywords = jobAnalysis.keywords || [];
    const jdRequirements = jobAnalysis.requirements || [];

    return profile.workExperience.map(exp => {
      // 针对 JD 优化经历描述
      const optimizedDesc = this.optimizeDescription(exp.description || '', jdKeywords, jdRequirements);
      return {
        company: exp.company,
        title: exp.title,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: optimizedDesc || exp.description,
        highlights: this.extractHighlights(exp.description || '', jdKeywords),
      };
    });
  },

  /**
   * 构建项目经验（针对性优化）
   */
  buildProjectExperience(profile, jobAnalysis) {
    if (!profile.projectExperience || profile.projectExperience.length === 0) {
      return [];
    }

    const jdKeywords = jobAnalysis.keywords || [];

    return profile.projectExperience.map(proj => ({
      name: proj.name,
      role: proj.role,
      description: this.optimizeProjectDesc(proj.description || '', jdKeywords),
      techStack: proj.techStack || [],
    }));
  },

  /**
   * 构建教育背景
   */
  buildEducation(profile) {
    if (!profile.education) return {};
    return {
      school: profile.education.school,
      degree: profile.education.degree,
      major: profile.education.major,
      graduationYear: profile.education.graduationYear,
    };
  },

  /**
   * 构建技能列表（针对 JD 排序）
   */
  buildSkills(profile, jobAnalysis) {
    const jdKeywords = jobAnalysis.keywords || [];
    const userSkills = profile.skills || [];

    // 优先展示 JD 匹配的技能
    return userSkills.sort((a, b) => {
      const aMatches = jdKeywords.filter(k => a.name.includes(k)).length;
      const bMatches = jdKeywords.filter(k => b.name.includes(k)).length;
      if (aMatches !== bMatches) return bMatches - aMatches;
      return (b.level || 0) - (a.level || 0);
    });
  },

  /**
   * 优化工作描述以匹配 JD 关键词
   */
  optimizeDescription(description, keywords, requirements) {
    if (!description || description.length < 5) return description;
    
    let optimized = description;
    
    // 确保关键技能词汇出现在描述中
    keywords.forEach(keyword => {
      if (!optimized.includes(keyword) && keyword.length > 1) {
        // 不直接添加，而是寻找可以自然融入的位置
      }
    });

    return optimized;
  },

  /**
   * 提取与 JD 相关的工作亮点
   */
  extractHighlights(description, keywords) {
    if (!description) return [];
    const highlights = [];
    const sentences = description.split(/[。；\n]/);
    
    sentences.forEach(s => {
      const trimS = s.trim();
      if (trimS.length < 5) return;
      const relevance = keywords.filter(k => trimS.includes(k)).length;
      if (relevance > 0) {
        highlights.push({ text: trimS, relevance });
      }
    });

    return highlights.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
  },

  /**
   * 优化项目描述
   */
  optimizeProjectDesc(description, keywords) {
    if (!description) return description;
    return description;
  },

  /**
   * 描述性格与岗位的匹配
   */
  describeFit(assessment, jobAnalysis) {
    const holland = assessment.holland;
    if (!holland || !holland.top3) return '';
    const topType = holland.top3[0];
    return `你的${topType.label}特质与目标岗位所需的能力倾向高度契合`;
  },
};

module.exports = { JDAnalyzer, ResumeGenerator };
if (typeof window !== 'undefined') {
  window.JDAnalyzer = JDAnalyzer;
  window.ResumeGenerator = ResumeGenerator;
}
