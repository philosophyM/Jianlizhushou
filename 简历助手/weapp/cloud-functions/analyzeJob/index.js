const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { rawText, userId } = event;
  if (!rawText || rawText.trim().length < 10) {
    return { code: -1, error: '招聘信息太短' };
  }
  try {
    const analysis = await analyzeJobText(rawText);
    const record = { userId: userId || 'anonymous', rawText, parsed: analysis, keyRequirements: analysis.keywords, createdAt: db.serverDate() };
    const result = await db.collection('job_analyses').add({ data: record });
    return { code: 0, data: { ...analysis, id: result._id } };
  } catch (e) {
    return { code: -1, error: e.message };
  }
};

async function analyzeJobText(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const requirements = extractSection(text, ['任职要求', '职位要求', '岗位要求']);
  const responsibilities = extractSection(text, ['岗位职责', '工作内容', '职位描述']);
  const keywords = extractKeywords(text);
  return {
    company: extractField(text, ['公司', '所属公司']),
    position: (lines[0] || '未知职位').substring(0, 60),
    salary: (text.match(/(\d{1,3}[kK]?[-~到]\d{1,3}[kK]?)/) || [''])[0],
    location: extractField(text, ['工作地点', '地点']),
    requirements: requirements.slice(0, 12),
    responsibilities: responsibilities.slice(0, 8),
    keywords: keywords.slice(0, 15),
    education: extractField(text, ['学历', '教育']),
    experience: (text.match(/(\d+)\s*[-~到]\s*(\d+)\s*年/) || [''])[0],
  };
}

function extractSection(text, names) {
  const lines = text.split('\n');
  let start = -1, end = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    for (const n of names) { if (line.includes(n) && line.length < 30) { start = i + 1; break; } }
    if (start >= 0) break;
  }
  if (start < 0) return [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i].trim();
    if ((line.includes('【') || line.includes('：')) && !line.includes('•')) { end = i; break; }
  }
  if (end < 0) end = lines.length;
  return lines.slice(start, end).map(l => l.replace(/^[\s•·\-*\d.]+/, '').trim()).filter(l => l.length > 4);
}

function extractKeywords(text) {
  const dict = ['Python','Java','JavaScript','React','Vue','SQL','Node.js','Docker','AWS','Linux','数据分析','机器学习','AI','产品经理','项目管理','设计','运营','销售','英语','沟通能力','团队协作','领导力','本科','硕士'];
  return dict.filter(k => text.includes(k));
}

function extractField(text, names) {
  for (const n of names) {
    const m = text.match(new RegExp(n + '[：:]\\s*(.+?)[\\n\\r]'));
    if (m) return m[1].trim();
  }
  return '';
}
