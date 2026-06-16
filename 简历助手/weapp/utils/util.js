/**
 * 简历助手 - 通用工具函数
 */

const Util = {
  /**
   * 格式化日期
   */
  formatDate(date, fmt) {
    date = new Date(date);
    const o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (let k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
      }
    }
    return fmt;
  },

  /**
   * 防抖
   */
  debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * 对象深拷贝
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * 获取匹配度颜色
   */
  getMatchColor(score) {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#4A6CF7';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  },

  /**
   * 截断字符串
   */
  truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
  },

  /**
   * 检查是否已登录
   */
  checkLogin() {
    return !!wx.getStorageSync('token');
  },

  /**
   * 检查是否完成评测
   */
  hasAssessment() {
    return !!wx.getStorageSync('assessment_completed');
  },

  /**
   * 导出简历为文本
   */
  exportResumeText(resume) {
    if (!resume) return '';
    const parts = [];
    if (resume.basicInfo) {
      parts.push(resume.basicInfo.name || '姓名');
      parts.push('---');
    }
    if (resume.professionalSummary) {
      parts.push('【职业概要】');
      parts.push(resume.professionalSummary);
    }
    if (resume.workExperience && resume.workExperience.length > 0) {
      parts.push('【工作经历】');
      resume.workExperience.forEach(exp => {
        parts.push(exp.company + ' | ' + exp.title);
        if (exp.description) parts.push(exp.description);
      });
    }
    if (resume.education && resume.education.school) {
      parts.push('【教育背景】');
      parts.push(resume.education.school + ' | ' + (resume.education.degree || '') + ' | ' + (resume.education.major || ''));
    }
    if (resume.skills && resume.skills.length > 0) {
      parts.push('【技能清单】');
      parts.push(resume.skills.map(s => s.name + (s.level ? '(' + s.level + ')' : '')).join('、'));
    }
    return parts.join('\n');
  },

  /**
   * 生成随机颜色
   */
  randomColor() {
    const colors = ['#4A6CF7', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#06B6D4'];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  /**
   * 验证手机号
   */
  isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },

  /**
   * 验证邮箱
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
};

module.exports = Util;
if (typeof window !== 'undefined') window.Util = Util;
