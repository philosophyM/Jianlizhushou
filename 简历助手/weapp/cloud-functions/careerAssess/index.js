const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { userId, answers } = event;
  if (!answers) return { code: -1, error: '缺少答案' };
  try {
    const report = calculateReport(answers);
    await db.collection('assessments').add({
      data: { userId: userId || 'anonymous', holland: report.holland, bigFive: report.bigFive, workValues: report.workValues, recommendedCareers: report.recommendedCareers, createdAt: db.serverDate() },
    });
    return { code: 0, data: report };
  } catch (e) {
    return { code: -1, error: e.message };
  }
};

function calculateReport(answers) {
  const holland = calcHolland(answers.holland || {});
  const bigFive = calcBigFive(answers.bigFive || {});
  const workValues = calcValues(answers.values || {});
  const careers = recommend(holland);
  return { holland, bigFive, workValues, recommendedCareers: careers, summary: { topType: holland.top3[0]?.label || '', code: holland.code, topCareer: careers[0]?.career || '' } };
}

function calcHolland(answers) {
  const map = { r1:'realistic',r2:'realistic',r3:'realistic',r4:'realistic',r5:'realistic',i1:'investigative',i2:'investigative',i3:'investigative',i4:'investigative',i5:'investigative',a1:'artistic',a2:'artistic',a3:'artistic',a4:'artistic',a5:'artistic',s1:'social',s2:'social',s3:'social',s4:'social',s5:'social',e1:'enterprising',e2:'enterprising',e3:'enterprising',e4:'enterprising',e5:'enterprising',c1:'conventional',c2:'conventional',c3:'conventional',c4:'conventional',c5:'conventional' };
  const dims = { realistic:0,investigative:0,artistic:0,social:0,enterprising:0,conventional:0 };
  const cnt = { realistic:0,investigative:0,artistic:0,social:0,enterprising:0,conventional:0 };
  for (const [id, dim] of Object.entries(map)) { dims[dim] += answers[id] || 3; cnt[dim]++; }
  const scores = {};
  for (const d of Object.keys(dims)) scores[d] = +(dims[d] / (cnt[d] || 5)).toFixed(1);
  const labels = { realistic:'现实型',investigative:'研究型',artistic:'艺术型',social:'社会型',enterprising:'企业型',conventional:'常规型' };
  const sorted = Object.entries(scores).map(([dim, score]) => ({ dim, score, label: labels[dim] })).sort((a, b) => b.score - a.score);
  return { scores, top3: sorted.slice(0, 3), code: sorted.slice(0, 3).map(s => s.dim.charAt(0).toUpperCase()).join('') };
}

function calcBigFive(answers) {
  const o = (answers.o1||3) + (6-(answers.o2||3));
  const c = (answers.c1||3) + (6-(answers.c2||3));
  const e = (answers.e1||3) + (6-(answers.e2||3));
  const a = (answers.a1||3) + (6-(answers.a2||3));
  const n = (answers.n1||3) + (6-(answers.n2||3));
  return { scores: { openness: Math.round(((o-2)/8)*100), conscientiousness: Math.round(((c-2)/8)*100), extraversion: Math.round(((e-2)/8)*100), agreeableness: Math.round(((a-2)/8)*100), neuroticism: Math.round(((n-2)/8)*100) } };
}

function calcValues(answers) {
  return { scores: { achievement: answers.v1||3, creativity: answers.v2||3, independence: answers.v3||3, economic: answers.v4||3, security: answers.v5||3, prestige: answers.v6||3, altruism: answers.v7||3, relationships: answers.v8||3, management: answers.v9||3, lifestyle: answers.v10||3 } };
}

function recommend(holland) {
  const db = [
    { code:'R', name:'现实型', careers:['机械工程师','电气工程师','运维工程师','建筑设计师','工艺工程师'] },
    { code:'I', name:'研究型', careers:['研发工程师','数据分析师','算法工程师','咨询分析师','金融分析师'] },
    { code:'A', name:'艺术型', careers:['UI/UX设计师','内容运营','品牌策划','产品经理','广告创意'] },
    { code:'S', name:'社会型', careers:['人力资源','教师/培训师','心理咨询师','客服管理','社会工作'] },
    { code:'E', name:'企业型', careers:['销售经理','市场总监','项目经理','商务拓展','企业管理'] },
    { code:'C', name:'常规型', careers:['财务会计','行政专员','审计','运营专员','物流管理'] },
  ];
  const code = holland.top3?.[0]?.dim?.charAt(0)?.toUpperCase() || 'I';
  const c = db.find(x => x.code === code) || db[1];
  return c.careers.map(cc => ({ career: cc, type: c.name, code, matchScore: 75 + Math.floor(Math.random() * 20) }));
}
