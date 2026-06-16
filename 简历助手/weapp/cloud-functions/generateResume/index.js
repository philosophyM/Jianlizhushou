const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { userId, profile, jobAnalysis, style } = event;
  if (!profile || !jobAnalysis) return { code: -1, error: '缺少必要数据' };
  try {
    const resume = generateTargetedResume(profile, jobAnalysis, style || 'professional');
    const record = { userId: userId || 'anonymous', jobAnalysisId: jobAnalysis.id || '', version: 1, content: resume, status: 'completed', createdAt: db.serverDate() };
    const result = await db.collection('resumes').add({ data: record });
    return { code: 0, data: { ...resume, id: result._id } };
  } catch (e) {
    return { code: -1, error: e.message };
  }
};

function generateTargetedResume(profile, jobAnalysis, style) {
  const jdKeywords = jobAnalysis.keywords || [];
  const position = jobAnalysis.position || profile.targetPosition || '';
  return {
    basicInfo: { name: profile.name || '', phone: profile.phone || '', email: profile.email || '', targetPosition: position },
    professionalSummary: buildSummary(profile, jobAnalysis),
    workExperience: (profile.workExperience || []).map(exp => ({
      ...exp,
      highlights: (exp.description || '').split(/[。；\n]/).filter(s => jdKeywords.some(k => s.includes(k))).slice(0, 3),
    })),
    education: profile.education || {},
    skills: (profile.skills || []).sort((a, b) => {
      const aM = jdKeywords.filter(k => (a.name || '').includes(k)).length;
      const bM = jdKeywords.filter(k => (b.name || '').includes(k)).length;
      return bM - aM;
    }),
    matchScore: calculateMatch(profile, jobAnalysis),
    style,
  };
}

function buildSummary(profile, job) {
  const y = profile.workYears || '若干';
  const skills = (profile.skills || []).slice(0, 3).map(s => s.name).join('、');
  return `${y}年${profile.targetIndustry || ''}行业经验，擅长${skills || '专业技能'}。对${job.position || profile.targetPosition || '目标岗位'}有深入了解和高匹配度。`;
}

function calculateMatch(profile, job) {
  let score = 50;
  if (profile.education && job.education) score += 10;
  const matched = (job.keywords || []).filter(k => (profile.skills || []).some(s => (s.name || '').includes(k))).length;
  score += Math.min(20, matched * 4);
  return Math.min(100, Math.round(score));
}
