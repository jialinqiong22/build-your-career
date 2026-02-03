'use client';

import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

type ViewState = 'input' | 'loading' | 'result' | 'history' | 'survey';

// 历史记录类型
type TestHistory = {
  id: string;
  mbti: string;
  holland: string;
  enneagram: string;
  personaTitle: string;
  timestamp: number;
};

// localStorage 操作
const HISTORY_STORAGE_KEY = 'career_gps_history';
const MAX_HISTORY_COUNT = 10;

const saveToHistory = (mbti: string, holland: string, enneagram: string, personaTitle: string) => {
  if (typeof window === 'undefined') return;

  try {
    const existingHistory = getHistory();
    const newRecord: TestHistory = {
      id: Date.now().toString(),
      mbti,
      holland,
      enneagram,
      personaTitle,
      timestamp: Date.now(),
    };

    // 去重：如果已存在相同组合，先删除旧记录
    const filteredHistory = existingHistory.filter(
      (h) => !(h.mbti === mbti && h.holland === holland && h.enneagram === enneagram)
    );

    // 添加新记录并保留最近 10 条
    const updatedHistory = [newRecord, ...filteredHistory].slice(0, MAX_HISTORY_COUNT);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
};

const getHistory = (): TestHistory[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
};

const clearHistory = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
};

const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

// ==================== 动态主题色系统 ====================

type ThemeColors = {
  background: string;
  text: string;
  accent: string;
  secondary: string;
  cardBg: string;
};

// 根据 MBTI 类型返回主题色
const getThemeColors = (mbti: string): ThemeColors => {
  // NT 型 (理性派) - 冷色调
  if (['INTJ', 'INTP', 'ENTJ', 'ENTP'].includes(mbti)) {
    return {
      background: '#1A1A1B', // 玄青
      text: '#C0C0C0', // Silver
      accent: '#4A9EFF', // 科技蓝
      secondary: '#7B68EE', // 中紫
      cardBg: '#252526',
    };
  }

  // NF 型 (理想派) - 暖色调
  if (['INFJ', 'INFP', 'ENFJ', 'ENFP'].includes(mbti)) {
    return {
      background: '#7397AB', // 苍筤
      text: '#FFFFF0', // Ivory
      accent: '#FFB6C1', // 浅粉
      secondary: '#DDA0DD', // 梅红
      cardBg: '#8BA8B8',
    };
  }

  // ST 型 (现实派) - 中性冷色
  if (['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].includes(mbti)) {
    return {
      background: '#2F4F4F', // 深岩灰
      text: '#F5F5DC', // 米色
      accent: '#87CEEB', // 天蓝
      secondary: '#4682B4', // 钢蓝
      cardBg: '#3A5F5F',
    };
  }

  // SP 型 (感知派) - 温暖活力
  return {
    background: '#CD853F', // 秘鲁色
    text: '#FFF8DC', // 玉米丝
    accent: '#FFD700', // 金色
    secondary: '#FF6347', // 番茄红
    cardBg: '#DAA520',
  };
};

// 个性化加载文案生成器
const getPersonalizedLoadingMessages = (mbti: string, holland: string, enneagram: string): string[] => {
  const messages: string[] = [
    `正在读取 ${mbti} 认知模式...`,
    `分析 ${holland} 职业兴趣图谱...`,
    `检测到 ${enneagram} 核心动机...`,
    '正在扫描全网 20,000+ 岗位库...',
  ];

  // 根据 MBTI 添加个性化消息
  if (['INTJ', 'INTP'].includes(mbti)) {
    messages.push('检测到超强逻辑分析能力...');
    messages.push('正在匹配高创新度岗位...');
  } else if (['INFJ', 'INFP'].includes(mbti)) {
    messages.push('发现深度共情天赋...');
    messages.push('正在寻找有社会价值的岗位...');
  } else if (['ENTJ', 'ESTJ'].includes(mbti)) {
    messages.push('识别到天然领导力...');
    messages.push('正在匹配管理类岗位...');
  } else if (['ENFP', 'ESFP'].includes(mbti)) {
    messages.push('发现超强感染力...');
    messages.push('正在匹配创意类岗位...');
  }

  // 添加跨维度分析消息
  messages.push(`交叉分析 ${mbti} × ${holland} × ${enneagram}...`);
  messages.push('正在生成性格冲突预警...');
  messages.push('计算避坑指南中...');

  return messages;
};

// 计算稀有度评分（基于组合的独特性）
const calculateRarity = (mbti: string, holland: string, enneagram: string): {
  score: number;
  label: string;
  color: string;
} => {
  // 模拟稀有度计算（实际可基于真实统计数据）
  const hash = (mbti + holland + enneagram).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const score = ((hash % 100) + 1) / 100; // 1% - 100%

  if (score <= 0.05) {
    return { score: Math.round(score * 100), label: 'SSS 级稀有', color: '#FFD700' };
  } else if (score <= 0.15) {
    return { score: Math.round(score * 100), label: 'SS 级稀有', color: '#C0C0C0' };
  } else if (score <= 0.30) {
    return { score: Math.round(score * 100), label: 'S 级稀有', color: '#CD7F32' };
  } else {
    return { score: Math.round(score * 100), label: '独特', color: '#4A9EFF' };
  }
};

const LOADING_MESSAGES = [
  '正在连接全网岗位库...',
  '正在分析性格冲突...',
  '正在生成避坑指南...',
  '正在交叉比对 38 项性格因子...',
  '正在预测职场雷区...',
];

// 4 个示例案例
const EXAMPLE_CASES = [
  {
    id: 1,
    title: '温暖的社交达人',
    mbti: 'ESFJ',
    holland: 'ESC',
    enneagram: '6w7',
    description: '外向、社交型，擅长人际协调',
    jobs: ['人力资源经理', '客户成功经理', '活动策划', '社群运营'],
    salary: { entry: '10-18K', mid: '20-35K', senior: '35-60K' },
  },
  {
    id: 2,
    title: '战略规划专家',
    mbti: 'INTJ',
    holland: 'RIA',
    enneagram: '1w4',
    description: '理性、完美主义，追求系统化解决方案',
    jobs: ['产品设计师', 'UX 研究员', '数据分析师', '系统架构师'],
    salary: { entry: '15-25K', mid: '30-50K', senior: '50-90K' },
  },
  {
    id: 3,
    title: '稳健执行专家',
    mbti: 'ISTJ',
    holland: 'CEI',
    enneagram: '5w6',
    description: '细致、可靠，擅长规范化流程管理',
    jobs: ['财务分析师', '合规专员', '项目经理', '数据工程师'],
    salary: { entry: '12-20K', mid: '25-45K', senior: '40-70K' },
  },
  {
    id: 4,
    title: '创意创新先锋',
    mbti: 'ENFP',
    holland: 'AIS',
    enneagram: '7w8',
    description: '热情、创新，擅长激发团队灵感',
    jobs: ['品牌策划', '内容营销', '产品运营', '用户体验设计师'],
    salary: { entry: '12-22K', mid: '25-45K', senior: '45-80K' },
  },
];

// 性格组合数据配置
type PersonalityProfile = {
  personaTitle: string;
  coreAdvantages: Array<{ title: string; desc: string }>;
  careerRadar: Array<{ name: string; score: number }>;
  riskBlackhole: string;
  riskWorkplace: string;
  previewJobs: Array<{ name: string; match: number; logic: string; threshold: string; advice?: string }>;
  fullJobs: Array<{ name: string; match: number; logic: string; threshold: string; advice: string }>;
  expertQuote: string;
  salary: { entry: string; mid: string; senior: string };
};

// 根据性格组合获取对应数据
const getPersonalityProfile = (mbti: string, holland: string, enneagram: string): PersonalityProfile => {
  const key = `${mbti}-${holland}-${enneagram}`;

  const profiles: Record<string, PersonalityProfile> = {
    // ESFJ ESC 6w7 - 温暖的社交达人
    'ESFJ-ESC-6w7': {
      personaTitle: '温暖的连接者',
      coreAdvantages: [
        { title: '人际粘合剂', desc: '天生擅长建立和谐的人际关系，团队氛围调节器' },
        { title: '细节关怀者', desc: '能敏锐感知他人情绪，提供恰到好处的支持' },
        { title: '执行推动者', desc: '把计划落地的能力超强，团队可靠的后盾' },
      ],
      careerRadar: [
        { name: '创新力', score: 72 },
        { name: '逻辑推演', score: 68 },
        { name: '抗压韧性', score: 88 },
        { name: '落地执行', score: 92 },
        { name: '影响力', score: 85 },
        { name: '情绪资本', score: 95 },
      ],
      riskBlackhole: 'ESFJ 6w7 的致命短板：过度在意他人评价，容易因冲突而焦虑。你的善良可能被利用，需要学会设立边界。',
      riskWorkplace: '以下环境会让你痛苦：高强度竞争+孤立工作+频繁变动+冷冰冰的KPI导向。你需要人情味和团队归属感，纯狼性文化会让你崩溃。',
      previewJobs: [
        { name: '人力资源经理', match: 92, logic: '发挥你的情商和组织能力，成为团队文化的塑造者', threshold: '人力资源管理背景，沟通协调能力' },
        { name: '客户成功经理', match: 88, logic: '用服务意识维护客户关系，建立长期信任', threshold: '客户服务经验，问题解决能力' },
      ],
      fullJobs: [
        { name: '人力资源经理', match: 92, logic: '发挥你的情商和组织能力，成为团队文化的塑造者', threshold: '人力资源管理背景，沟通协调能力', advice: '先从招聘专员做起，积累识人经验' },
        { name: '客户成功经理', match: 88, logic: '用服务意识维护客户关系，建立长期信任', threshold: '客户服务经验，问题解决能力', advice: '学会用数据说话，证明你的价值' },
        { name: '活动策划', match: 85, logic: '统筹协调各方资源，让每个人都能发挥价值', threshold: '项目管理能力，创意执行', advice: '建立供应商资源库，提升议价能力' },
        { name: '社群运营', match: 83, logic: '天然的社群氛围营造者，让人产生归属感', threshold: '内容能力，用户思维', advice: '持续输出有价值的内容，不要只做客服' },
        { name: '培训师', match: 81, logic: '耐心细致的讲解，让学员感受到关怀', threshold: '专业知识+演讲能力', advice: '多观察优秀讲师的授课技巧' },
        { name: '销售主管', match: 78, logic: '团队管理比个人销售更适合你', threshold: '销售经验+管理能力', advice: '学会用激励而非命令带团队' },
        { name: '办公室主任', match: 76, logic: '细致周到，让公司运转更顺畅', threshold: '组织能力，多任务处理', advice: '建立标准化流程，提升效率' },
        { name: '教育顾问', match: 74, logic: '用真诚和专业赢得家长信任', threshold: '教育行业知识，沟通能力', advice: '持续学习最新的教育理念' },
        { name: '公关专员', match: 72, logic: '维护媒体关系，塑造品牌形象', threshold: '写作能力，媒体资源', advice: '积累媒体人脉，建立危机应对预案' },
        { name: '项目经理', match: 70, logic: '协调各方进度，确保项目顺利交付', threshold: 'PMP认证，沟通协调', advice: '学会使用项目管理工具' },
      ],
      expertQuote: '你的温暖是天生的天赋，但别忘了也需要被呵护。ESFJ 6w7 容易过度付出而忽视自己，设立边界不是自私，而是为了更可持续地帮助他人。',
      salary: { entry: '10-18K', mid: '20-35K', senior: '35-60K' },
    },

    // INTJ RIA 1w4 - 战略规划专家
    'INTJ-RIA-1w4': {
      personaTitle: '完美的建筑师',
      coreAdvantages: [
        { title: '系统战略家', desc: '能看到别人看不到的全局图景和长期趋势' },
        { title: '完美主义引擎', desc: '对细节的极致追求，造就卓越品质' },
        { title: '独立创新者', desc: '不需要他人的认可也能坚持自己的方向' },
      ],
      careerRadar: [
        { name: '创新力', score: 95 },
        { name: '逻辑推演', score: 98 },
        { name: '抗压韧性', score: 82 },
        { name: '落地执行', score: 85 },
        { name: '影响力', score: 72 },
        { name: '情绪资本', score: 58 },
      ],
      riskBlackhole: 'INTJ 1w4 的致命短板：过度理想化+人际疏离。你的完美标准可能让团队感到压力，孤独感可能影响决策质量。',
      riskWorkplace: '以下环境会让你痛苦：需要频繁社交+政治斗争+重复执行+缺乏自主权。你需要深度思考和创造空间，官僚体系会让你窒息。',
      previewJobs: [
        { name: '产品设计师', match: 94, logic: '用系统思维设计产品体验，每个细节都追求完美', threshold: '设计/技术背景，用户体验思维' },
        { name: 'UX 研究员', match: 91, logic: '深度洞察用户行为，发现隐藏的需求模式', threshold: '心理学/社会学背景，数据分析能力' },
      ],
      fullJobs: [
        { name: '产品设计师', match: 94, logic: '用系统思维设计产品体验，每个细节都追求完美', threshold: '设计/技术背景，用户体验思维', advice: '学会妥协，完美不是目标，用户价值才是' },
        { name: 'UX 研究员', match: 91, logic: '深度洞察用户行为，发现隐藏的需求模式', threshold: '心理学/社会学背景，数据分析能力', advice: '多和产品经理沟通，把洞察转化为方案' },
        { name: '数据分析师', match: 89, logic: '从复杂数据中发现趋势和洞察', threshold: '统计学/数学背景，SQL/Python', advice: '业务理解比技术能力更重要' },
        { name: '系统架构师', match: 87, logic: '设计复杂系统的整体架构', threshold: '5年以上开发经验，技术广度', advice: '多看开源项目的架构设计' },
        { name: '战略咨询顾问', match: 85, logic: '为客户制定长期发展战略', threshold: '名校MBA，商业分析能力', advice: '案例库很重要，多复盘总结' },
        { name: '用户体验研究员', match: 83, logic: '研究用户行为，优化产品体验', threshold: '用户研究方法，数据分析', advice: '学会用讲故事的方式呈现发现' },
        { name: '商业分析师', match: 80, logic: '分析商业模式，识别增长机会', threshold: '商业敏感度，逻辑思维', advice: '多关注行业动态和竞品分析' },
        { name: '产品经理', match: 78, logic: '负责产品的整体规划和执行', threshold: '技术/设计背景，项目管理', advice: '提升沟通能力，学会平衡各方利益' },
        { name: '数据产品经理', match: 75, logic: '设计和优化数据产品', threshold: '数据理解+产品思维', advice: '先做数据分析师积累经验' },
        { name: '技术战略师', match: 72, logic: '规划技术发展路线', threshold: '技术背景+商业视野', advice: '多关注技术趋势和行业报告' },
      ],
      expertQuote: '你的理想主义是珍贵的品质，但别让它成为孤立你的高墙。INTJ 1w4 需要学会的是：不完美的执行胜过完美的构想，他人的价值不在你的标准之下。',
      salary: { entry: '15-25K', mid: '30-50K', senior: '50-90K' },
    },

    // ISTJ CEI 5w6 - 稳健执行专家
    'ISTJ-CEI-5w6': {
      personaTitle: '可靠的磐石',
      coreAdvantages: [
        { title: '执行机器', desc: '说到做到，计划完成的可靠保证' },
        { title: '细节守护者', desc: '不放过任何可能出问题的细节' },
        { title: '系统建设者', desc: '擅长建立可复用的流程和规范' },
      ],
      careerRadar: [
        { name: '创新力', score: 65 },
        { name: '逻辑推演', score: 88 },
        { name: '抗压韧性', score: 90 },
        { name: '落地执行', score: 96 },
        { name: '影响力', score: 68 },
        { name: '情绪资本', score: 72 },
      ],
      riskBlackhole: 'ISTJ 5w6 的致命短板：过度保守+缺乏灵活性。你可能错失创新机会，对变化的抵触可能限制发展。',
      riskWorkplace: '以下环境会让你痛苦：快速变化+规则不明确+需要即兴发挥+过度强调社交。你需要清晰的目标和流程，混乱创业公司可能让你焦虑。',
      previewJobs: [
        { name: '财务分析师', match: 93, logic: '用严谨的数据分析支持决策，确保财务合规', threshold: '财务/会计背景，数据分析能力' },
        { name: '合规专员', match: 90, logic: '确保公司运营符合法规要求，风险控制专家', threshold: '法律/财务背景，细心耐心' },
      ],
      fullJobs: [
        { name: '财务分析师', match: 93, logic: '用严谨的数据分析支持决策，确保财务合规', threshold: '财务/会计背景，数据分析能力', advice: '考取CPA/CFA提升竞争力' },
        { name: '合规专员', match: 90, logic: '确保公司运营符合法规要求，风险控制专家', threshold: '法律/财务背景，细心耐心', advice: '持续学习最新的法规变化' },
        { name: '项目经理', match: 88, logic: '用系统化方法确保项目按时交付', threshold: 'PMP认证，组织协调能力', advice: '学会使用项目管理软件工具' },
        { name: '数据工程师', match: 85, logic: '构建和维护数据管道，确保数据质量', threshold: 'SQL/ETL经验，编程能力', advice: '掌握主流的大数据处理技术' },
        { name: '质量保证工程师', match: 83, logic: '用严格的标准确保产品质量', threshold: '测试方法，细节关注', advice: '学习自动化测试工具' },
        { name: '运营专员', match: 80, logic: '优化运营流程，提升效率', threshold: '数据分析，流程优化', advice: '建立标准化操作手册' },
        { name: '供应链分析师', match: 78, logic: '优化供应链管理，降低成本', threshold: '供应链知识，数据分析', advice: '了解行业供应链特点' },
        { name: '审计师', match: 76, logic: '检查和评估公司运营合规性', threshold: '会计/审计背景，CPA', advice: '四大审计经验是很好的起点' },
        { name: '数据库管理员', match: 73, logic: '维护数据库稳定和安全', threshold: '数据库技术，责任心', advice: '掌握主流数据库系统' },
        { name: '风控专员', match: 70, logic: '识别和控制业务风险', threshold: '风险分析方法，细心', advice: '建立风险识别清单' },
      ],
      expertQuote: '你的可靠是团队最宝贵的财富，但别让稳健变成固执。ISTJ 5w6 需要学会的是：变化中也有机会，适度冒险是成长的必经之路。',
      salary: { entry: '12-20K', mid: '25-45K', senior: '40-70K' },
    },

    // ENFP AIS 7w8 - 创意创新先锋
    'ENFP-AIS-7w8': {
      personaTitle: '灵感催化剂',
      coreAdvantages: [
        { title: '创意发电机', desc: '脑子里永远有新点子，灵感源源不断' },
        { title: '能量放大器', desc: '你的热情能点燃整个团队的创造力' },
        { title: '可能性的探索者', desc: '总能看到别人看不到的机会和方向' },
      ],
      careerRadar: [
        { name: '创新力', score: 96 },
        { name: '逻辑推演', score: 72 },
        { name: '抗压韧性', score: 78 },
        { name: '落地执行', score: 70 },
        { name: '影响力', score: 92 },
        { name: '情绪资本', score: 90 },
      ],
      riskBlackhole: 'ENFP 7w8 的致命短板：三分钟热度+虎头蛇尾。你善于开始但不擅长收尾，可能同时开太多项目而无法完成。',
      riskWorkplace: '以下环境会让你痛苦：重复性工作+严格规范+缺乏创意+孤立无交流。你需要自由和新鲜感，传统层级制会让你想逃跑。',
      previewJobs: [
        { name: '品牌策划', match: 91, logic: '用创意打造品牌故事，让消费者产生情感连接', threshold: '品牌营销知识，创意能力' },
        { name: '内容营销', match: 88, logic: '创造有感染力的内容，吸引和留住用户', threshold: '写作/视频能力，用户洞察' },
      ],
      fullJobs: [
        { name: '品牌策划', match: 91, logic: '用创意打造品牌故事，让消费者产生情感连接', threshold: '品牌营销知识，创意能力', advice: '建立个人作品集，展示你的创意' },
        { name: '内容营销', match: 88, logic: '创造有感染力的内容，吸引和留住用户', threshold: '写作/视频能力，用户洞察', advice: '分析爆款内容，总结规律' },
        { name: '产品运营', match: 86, logic: '用创意活动提升用户活跃和留存', threshold: '用户思维，数据分析', advice: '关注用户反馈，快速迭代' },
        { name: '用户体验设计师', match: 84, logic: '设计让用户愉悦的产品体验', threshold: '设计/心理学背景，同理心', advice: '多做用户访谈，了解真实需求' },
        { name: '社群运营', match: 82, logic: '打造有温度的社群，让用户产生归属感', threshold: '沟通能力，活动策划', advice: '持续输出有价值的内容' },
        { name: '创意总监', match: 80, logic: '领导创意团队，产出优秀作品', threshold: '创意能力+管理能力', advice: '学会平衡创意和商业目标' },
        { name: '市场营销经理', match: 78, logic: '策划创意营销活动，提升品牌影响力', threshold: '营销知识，项目管理', advice: '多关注成功的营销案例' },
        { name: '新媒体运营', match: 76, logic: '运营新媒体账号，扩大品牌影响力', threshold: '内容能力，平台理解', advice: '每个平台都有特点，针对性运营' },
        { name: '活动策划', match: 74, logic: '策划创意活动，制造品牌声量', threshold: '创意能力，执行力', advice: '建立供应商资源库' },
        { name: '用户增长', match: 72, logic: '用创意方法实现用户快速增长', threshold: '数据分析，创意思维', advice: 'A/B测试是有效的方法' },
      ],
      expertQuote: '你的创意是天赋，但需要执行力来兑现价值。ENFP 7w8 需要学会的是：少开几个项目，把每个项目真正做透做深。完成比完美更重要。',
      salary: { entry: '12-22K', mid: '25-45K', senior: '45-80K' },
    },

    // INFP AIS 9w1 - 理想主义治愈者
    'INFP-AIS-9w1': {
      personaTitle: '温柔的治愈者',
      coreAdvantages: [
        { title: '理想主义旗手', desc: '坚持内心价值观，追求有意义的工作' },
        { title: '共情能力超强', desc: '深度理解他人情感，温暖人心' },
        { title: '创意无限', desc: '天马行空的想象力，独特的表达方式' },
      ],
      careerRadar: [
        { name: '创新力', score: 93 },
        { name: '逻辑推演', score: 65 },
        { name: '抗压韧性', score: 72 },
        { name: '落地执行', score: 68 },
        { name: '影响力', score: 78 },
        { name: '情绪资本', score: 96 },
      ],
      riskBlackhole: 'INFP 9w1 的致命短板：过度理想化+难以拒绝他人。你的完美主义可能让自己陷入自我怀疑，容易被他人情绪影响。',
      riskWorkplace: '以下环境会让你痛苦：高压竞争+利益至上+人际冷漠+机械重复。你需要意义感和人文关怀，纯粹的商业环境会让你失去热情。',
      previewJobs: [
        { name: '心理咨询师', match: 93, logic: '用共情能力帮助他人解决心理问题', threshold: '心理学专业，咨询师资格证' },
        { name: '内容策划', match: 89, logic: '用真挚的情感打动人心', threshold: '写作能力，同理心' },
      ],
      fullJobs: [
        { name: '心理咨询师', match: 93, logic: '用共情能力帮助他人解决心理问题', threshold: '心理学专业，咨询师资格证', advice: '积累实践经验，持续督导学习' },
        { name: '内容策划', match: 89, logic: '用真挚的情感打动人心', threshold: '写作能力，同理心', advice: '找到自己真正热爱的领域' },
        { name: '用户体验研究员', match: 86, logic: '深入理解用户需求和情感', threshold: '用户研究方法，同理心', advice: '学会用数据支撑你的洞察' },
        { name: '品牌文案', match: 84, logic: '用文字传递品牌温度', threshold: '文字功底，创意能力', advice: '建立个人作品集' },
        { name: '教育顾问', match: 81, logic: '用耐心和专业帮助家长', threshold: '教育知识，沟通能力', advice: '持续学习最新的教育理念' },
        { name: '社群运营', match: 79, logic: '营造温暖有爱的社群氛围', threshold: '沟通能力，活动策划', advice: '真诚对待每一个成员' },
        { name: '公益项目专员', match: 77, logic: '为弱势群体发声和提供帮助', threshold: '社会责任感，组织能力', advice: '选择你真正关心的议题' },
        { name: '编辑', match: 74, logic: '打磨文字，传递有价值的内容', threshold: '文字功底，细心耐心', advice: '多读多写，积累经验' },
        { name: '培训师', match: 71, logic: '用温暖的方式传授知识', threshold: '专业知识+演讲能力', advice: '找到适合自己的授课风格' },
        { name: '活动策划', match: 68, logic: '策划有意义的活动', threshold: '创意能力，执行力', advice: '注重活动的情感体验' },
      ],
      expertQuote: '你的理想主义是珍贵的礼物，但别让它成为沉重的负担。INFP 9w1 需要学会的是：适当的自我保护不是自私，而是为了更可持续地帮助他人。',
      salary: { entry: '10-18K', mid: '22-40K', senior: '40-70K' },
    },

    // ENTP RIE 8w7 - 创新挑战者
    'ENTP-RIE-8w7': {
      personaTitle: '创新颠覆者',
      coreAdvantages: [
        { title: '创意风暴', desc: '总是有打破常规的新点子' },
        { title: '辩论高手', desc: '擅长从多个角度分析问题' },
        { title: '快速学习', desc: '对新事物充满好奇，学习能力强' },
      ],
      careerRadar: [
        { name: '创新力', score: 97 },
        { name: '逻辑推演', score: 90 },
        { name: '抗压韧性', score: 75 },
        { name: '落地执行', score: 70 },
        { name: '影响力', score: 88 },
        { name: '情绪资本', score: 68 },
      ],
      riskBlackhole: 'ENTP 8w7 的致命短板：容易虎头蛇尾+过于自信。你可能同时开太多项目而无法完成，忽视细节和执行力。',
      riskWorkplace: '以下环境会让你痛苦：严格规范+重复执行+缺乏挑战+层级森严。你需要自由和刺激，传统体制会让你窒息。',
      previewJobs: [
        { name: '产品经理', match: 92, logic: '用创新思维打造颠覆性产品', threshold: '产品思维，跨部门沟通' },
        { name: '创业公司CEO', match: 89, logic: '敢于冒险，快速试错', threshold: '领导力，抗压能力' },
      ],
      fullJobs: [
        { name: '产品经理', match: 92, logic: '用创新思维打造颠覆性产品', threshold: '产品思维，跨部门沟通', advice: '学会专注，不要什么都想做' },
        { name: '创业公司CEO', match: 89, logic: '敢于冒险，快速试错', threshold: '领导力，抗压能力', advice: '找一个执行力强的合伙人' },
        { name: '战略咨询顾问', match: 86, logic: '为客户带来创新解决方案', threshold: '名校MBA，商业分析能力', advice: '积累不同行业的案例' },
        { name: '市场营销总监', match: 84, logic: '策划出人意料营销活动', threshold: '营销知识，创意能力', advice: '关注新兴营销渠道' },
        { name: '用户体验设计师', match: 81, logic: '设计突破常规的产品体验', threshold: '设计/心理学背景，同理心', advice: '多做用户测试验证想法' },
        { name: '内容创作者', match: 79, logic: '用独特视角吸引粉丝', threshold: '创作能力，个人魅力', advice: '持续输出有价值的内容' },
        { name: '商业分析师', match: 76, logic: '发现别人看不到的商业机会', threshold: '商业敏感度，逻辑思维', advice: '多关注创业动态' },
        { name: '投资经理', match: 73, logic: '识别有潜力的创业项目', threshold: '财务知识，行业洞察', advice: '积累项目资源' },
        { name: '科技创新专员', match: 70, logic: '推动企业技术创新', threshold: '技术理解，创新思维', advice: '保持对前沿技术的敏感度' },
        { name: '品牌策划', match: 67, logic: '打造差异化的品牌形象', threshold: '品牌营销知识，创意能力', advice: '研究成功的品牌案例' },
      ],
      expertQuote: '你的创新思维是难得的天赋，但需要执行力来兑现价值。ENTP 8w7 需要学会的是：专注做好一件事，比同时做十件半成品更有价值。',
      salary: { entry: '15-25K', mid: '30-60K', senior: '60-120K' },
    },

    // ISFJ SEC 2w3 - 温暖守护者
    'ISFJ-SEC-2w3': {
      personaTitle: '温暖的守护者',
      coreAdvantages: [
        { title: '默默奉献', desc: '用实际行动照顾身边的人' },
        { title: '细节关注', desc: '能察觉他人忽略的小需求' },
        { title: '忠诚可靠', desc: '值得信赖的团队伙伴' },
      ],
      careerRadar: [
        { name: '创新力', score: 63 },
        { name: '逻辑推演', score: 74 },
        { name: '抗压韧性', score: 90 },
        { name: '落地执行', score: 94 },
        { name: '影响力', score: 75 },
        { name: '情绪资本', score: 92 },
      ],
      riskBlackhole: 'ISFJ 2w3 的致命短板：过度付出+难以拒绝。你可能为了帮助他人而忽视自己，容易被不感恩的人伤害。',
      riskWorkplace: '以下环境会让你痛苦：激烈竞争+频繁变动+人际关系复杂+需要自我推销。你需要稳定和认可，高压环境会让你焦虑。',
      previewJobs: [
        { name: '护士', match: 94, logic: '用细心和耐心照顾患者', threshold: '护理专业，执业资格证' },
        { name: '行政专员', match: 91, logic: '让办公室运转更顺畅', threshold: '组织能力，细心耐心', advice: '掌握办公软件技能' },
      ],
      fullJobs: [
        { name: '护士', match: 94, logic: '用细心和耐心照顾患者', threshold: '护理专业，执业资格证', advice: '培养抗压能力，学会自我关怀' },
        { name: '行政专员', match: 91, logic: '让办公室运转更顺畅', threshold: '组织能力，细心耐心', advice: '掌握办公软件技能' },
        { name: '人力资源专员', match: 88, logic: '处理员工关系，营造温暖氛围', threshold: '人力资源管理，沟通能力', advice: '学习劳动法规' },
        { name: '客户服务专员', match: 85, logic: '耐心解答用户问题', threshold: '服务意识，问题解决', advice: '学会情绪管理' },
        { name: '图书管理员', match: 83, logic: '安静整理知识，服务读者', threshold: '细心耐心，组织能力', advice: '学习信息管理知识' },
        { name: '教育顾问', match: 80, logic: '耐心和家长沟通', threshold: '教育知识，沟通能力', advice: '积累成功案例' },
        { name: '社会工作者', match: 77, logic: '帮助弱势群体', threshold: '社会责任感，耐心', advice: '考取社工资格证' },
        { name: '办公室主任', match: 74, logic: '细致处理日常事务', threshold: '组织能力，多任务处理', advice: '建立标准化流程' },
        { name: '档案管理员', match: 71, logic: '整理和保护重要文件', threshold: '细心责任心', advice: '学习档案管理知识' },
        { name: '售后客服', match: 68, logic: '耐心解决客户问题', threshold: '服务意识，问题解决', advice: '积累常见问题处理经验' },
      ],
      expertQuote: '你的温暖和可靠是珍贵的品质，但别忘了也要照顾好自己。ISFJ 2w3 需要学会的是：设立边界不是自私，而是为了更可持续地帮助他人。',
      salary: { entry: '8-15K', mid: '18-35K', senior: '35-60K' },
    },

    // ESTJ CER 3w4 - 实干领导者
    'ESTJ-CER-3w4': {
      personaTitle: '高效的领导者',
      coreAdvantages: [
        { title: '执行力强', desc: '说到做到，效率至上' },
        { title: '组织天赋', desc: '善于规划和安排资源' },
        { title: '目标导向', desc: '明确目标，全力以赴达成' },
      ],
      careerRadar: [
        { name: '创新力', score: 70 },
        { name: '逻辑推演', score: 85 },
        { name: '抗压韧性', score: 92 },
        { name: '落地执行', score: 98 },
        { name: '影响力', score: 88 },
        { name: '情绪资本', score: 65 },
      ],
      riskBlackhole: 'ESTJ 3w4 的致命短板：过于强势+缺乏耐心。你的高效可能让团队感到压力，容易忽视他人的感受。',
      riskWorkplace: '以下环境会让你痛苦：目标模糊+决策缓慢+缺乏效率+过度强调情感。你需要清晰的目标和执行，官僚体系会让你沮丧。',
      previewJobs: [
        { name: '运营总监', match: 93, logic: '用高效的执行力推动业务', threshold: '5年以上运营经验，团队管理' },
        { name: '项目经理', match: 90, logic: '确保项目按时高质量交付', threshold: 'PMP认证，组织协调', advice: '学会使用项目管理工具' },
      ],
      fullJobs: [
        { name: '运营总监', match: 93, logic: '用高效的执行力推动业务', threshold: '5年以上运营经验，团队管理', advice: '提升领导力，学会授权' },
        { name: '项目经理', match: 90, logic: '确保项目按时高质量交付', threshold: 'PMP认证，组织协调', advice: '学会使用项目管理工具' },
        { name: '部门主管', match: 87, logic: '带领团队达成业绩目标', threshold: '3年+相关经验，管理能力', advice: '学习管理技巧' },
        { name: '销售总监', match: 85, logic: '制定销售策略，推动团队执行', threshold: '销售经验+管理能力', advice: '用数据驱动决策' },
        { name: '供应链经理', match: 82, logic: '优化供应链效率', threshold: '供应链知识，管理能力', advice: '关注成本和效率' },
        { name: '财务经理', match: 80, logic: '确保财务规范和高效运转', threshold: 'CPA/CFA，管理经验', advice: '提升团队管理能力' },
        { name: '生产经理', match: 77, logic: '确保生产计划顺利执行', threshold: '生产管理知识，执行力', advice: '学习精益生产' },
        { name: '酒店总经理', match: 74, logic: '全面管理酒店运营', threshold: '酒店管理经验，领导力', advice: '注重服务质量' },
        { name: '连锁店长', match: 71, logic: '管理门店日常运营', threshold: '零售经验，管理能力', advice: '建立标准化流程' },
        { name: '办公室主任', match: 68, logic: '高效处理日常事务', threshold: '组织能力，执行力', advice: '建立工作标准' },
      ],
      expertQuote: '你的执行力是难得的天赋，但别忘了团队是由人组成的。ESTJ 3w4 需要学会的是：效率和人性化并不冲突，关怀团队才能走得更远。',
      salary: { entry: '15-25K', mid: '35-60K', senior: '60-100K' },
    },

    // INFJ AIE 4w5 - 深邃洞察者
    'INFJ-AIE-4w5': {
      personaTitle: '神秘的洞察者',
      coreAdvantages: [
        { title: '深度洞察', desc: '能看到事物背后的本质' },
        { title: '理想主义', desc: '追求意义和价值，不甘平庸' },
        { title: '直觉敏锐', desc: '能预测趋势，察觉潜在问题' },
      ],
      careerRadar: [
        { name: '创新力', score: 88 },
        { name: '逻辑推演', score: 82 },
        { name: '抗压韧性', score: 70 },
        { name: '落地执行', score: 72 },
        { name: '影响力', score: 80 },
        { name: '情绪资本', score: 92 },
      ],
      riskBlackhole: 'INFJ 4w5 的致命短板：过度完美+容易倦怠。你的理想主义可能让你失望，深度思考可能让你与现实脱节。',
      riskWorkplace: '以下环境会让你痛苦：肤浅浮躁+利益至上+人际复杂+缺乏意义。你需要深度和意义感，纯粹商业环境会让你空虚。',
      previewJobs: [
        { name: '职业规划师', match: 94, logic: '用洞察力帮助他人规划职业', threshold: 'HR/心理学背景，咨询能力' },
        { name: '品牌策略', match: 90, logic: '深入理解品牌内涵和价值', threshold: '品牌知识，战略思维', advice: '多研究成功品牌案例' },
      ],
      fullJobs: [
        { name: '职业规划师', match: 94, logic: '用洞察力帮助他人规划职业', threshold: 'HR/心理学背景，咨询能力', advice: '积累行业知识和人脉' },
        { name: '品牌策略', match: 90, logic: '深入理解品牌内涵和价值', threshold: '品牌知识，战略思维', advice: '多研究成功品牌案例' },
        { name: '用户体验研究员', match: 87, logic: '深度理解用户行为动机', threshold: '心理学背景，研究方法', advice: '学会用数据支撑洞察' },
        { name: '组织发展顾问', match: 84, logic: '帮助企业改善组织效能', threshold: 'OD知识，咨询能力', advice: '积累不同行业的案例' },
        { name: '心理咨询师', match: 82, logic: '深入理解他人内心世界', threshold: '心理学专业，咨询师资格证', advice: '持续督导和个人成长' },
        { name: '内容总监', match: 79, logic: '规划有深度的内容策略', threshold: '内容经验，战略思维', advice: '关注内容质量而非数量' },
        { name: '教育顾问', match: 76, logic: '深度理解学生需求', threshold: '教育知识，沟通能力', advice: '持续学习新的教育理念' },
        { name: '社会责任专员', match: 73, logic: '推动企业社会责任项目', threshold: '项目管理，社会责任意识', advice: '关注ESG趋势' },
        { name: '市场研究分析师', match: 70, logic: '深入分析市场趋势', threshold: '研究方法，分析能力', advice: '培养商业敏感度' },
        { name: '编辑', match: 67, logic: '打磨有深度的内容', threshold: '文字功底，判断力', advice: '建立个人审稿标准' },
      ],
      expertQuote: '你的洞察力是珍贵的礼物，但别让它成为孤立的枷锁。INFJ 4w5 需要学会的是：理想需要落地才能改变世界，适度接地气才能更好地帮助他人。',
      salary: { entry: '12-20K', mid: '25-45K', senior: '45-80K' },
    },

    // ENTJ ECI 8w3 - 果断指挥官
    'ENTJ-ECI-8w3': {
      personaTitle: '天生的领导者',
      coreAdvantages: [
        { title: '战略思维', desc: '能看到全局，制定长远规划' },
        { title: '果断决策', desc: '能在复杂情况下快速做出决定' },
        { title: '组织能力', desc: '善于调动资源达成目标' },
      ],
      careerRadar: [
        { name: '创新力', score: 85 },
        { name: '逻辑推演', score: 95 },
        { name: '抗压韧性', score: 90 },
        { name: '落地执行', score: 94 },
        { name: '影响力', score: 92 },
        { name: '情绪资本', score: 60 },
      ],
      riskBlackhole: 'ENTJ 8w3 的致命短板：过于强势+缺乏耐心。你的果断可能让人感到压抑，容易忽视团队的情感需求。',
      riskWorkplace: '以下环境会让你痛苦：决策缓慢+层级过多+缺乏挑战+目标模糊。你需要自主权和挑战，官僚体系会让你窒息。',
      previewJobs: [
        { name: 'CEO/总经理', match: 95, logic: '制定战略，带领团队实现目标', threshold: '10年+管理经验，领导力' },
        { name: '战略总监', match: 92, logic: '制定企业长期发展战略', threshold: '名校MBA，战略思维', advice: '积累不同行业经验' },
      ],
      fullJobs: [
        { name: 'CEO/总经理', match: 95, logic: '制定战略，带领团队实现目标', threshold: '10年+管理经验，领导力', advice: '学会倾听和授权' },
        { name: '战略总监', match: 92, logic: '制定企业长期发展战略', threshold: '名校MBA，战略思维', advice: '积累不同行业经验' },
        { name: '管理咨询顾问', match: 89, logic: '为企业提供战略建议', threshold: '名校背景，分析能力', advice: '积累行业案例' },
        { name: '投资总监', match: 86, logic: '制定投资策略，管理投资组合', threshold: 'CFA，投资经验', advice: '建立行业人脉' },
        { name: '创业公司创始人', match: 84, logic: '从零开始建立事业', threshold: '综合能力，抗压能力', advice: '找互补的合伙人' },
        { name: '部门负责人', match: 81, logic: '带领团队达成业绩目标', threshold: '5年+管理经验', advice: '提升领导力' },
        { name: '销售总监', match: 78, logic: '制定销售策略，推动执行', threshold: '销售经验+管理能力', advice: '用数据驱动决策' },
        { name: '运营总监', match: 75, logic: '优化运营效率和流程', threshold: '运营经验，管理能力', advice: '关注ROI' },
        { name: '项目总监', match: 72, logic: '管理多个重大项目', threshold: 'PMP，管理经验', advice: '培养战略思维' },
        { name: '合伙人', match: 69, logic: '参与企业核心决策', threshold: '专业能力+商业头脑', advice: '积累行业资源' },
      ],
      expertQuote: '你的领导力是难得的天赋，但别忘了领导是服务团队。ENTJ 8w3 需要学会的是：真正的领导者不是发号施令，而是激发团队的潜力。',
      salary: { entry: '20-35K', mid: '50-100K', senior: '100-200K' },
    },

    // ISTP RIC 5w4 - 冷静分析者
    'ISTP-RIC-5w4': {
      personaTitle: '冷静的技术专家',
      coreAdvantages: [
        { title: '逻辑分析', desc: '善于拆解复杂问题' },
        { title: '动手能力强', desc: '喜欢实际操作和实践' },
        { title: '危机冷静', desc: '在压力下保持理性' },
      ],
      careerRadar: [
        { name: '创新力', score: 78 },
        { name: '逻辑推演', score: 94 },
        { name: '抗压韧性', score: 88 },
        { name: '落地执行', score: 85 },
        { name: '影响力', score: 62 },
        { name: '情绪资本', score: 65 },
      ],
      riskBlackhole: 'ISTP 5w4 的致命短板：过于独立+沟通不足。你可能因为不够表达而被人误解，情感疏离可能影响人际关系。',
      riskWorkplace: '以下环境会让你痛苦：过度社交+政治斗争+需要频繁沟通+缺乏技术深度。你需要专注的空间，办公室政治会让你想逃离。',
      previewJobs: [
        { name: '软件工程师', match: 93, logic: '专注技术，解决复杂问题', threshold: '编程能力，逻辑思维', advice: '持续学习新技术' },
        { name: '数据工程师', match: 90, logic: '构建和维护数据系统', threshold: 'SQL/ETL经验，编程能力', advice: '掌握大数据技术' },
      ],
      fullJobs: [
        { name: '软件工程师', match: 93, logic: '专注技术，解决复杂问题', threshold: '编程能力，逻辑思维', advice: '持续学习新技术' },
        { name: '数据工程师', match: 90, logic: '构建和维护数据系统', threshold: 'SQL/ETL经验，编程能力', advice: '掌握大数据技术' },
        { name: '系统管理员', match: 87, logic: '维护系统稳定运行', threshold: '系统知识，问题解决', advice: '考取相关认证' },
        { name: '网络安全专家', match: 85, logic: '保护系统安全', threshold: '安全知识，技术能力', advice: '关注安全趋势' },
        { name: '测试工程师', match: 82, logic: '发现和定位问题', threshold: '技术能力，细心', advice: '学习自动化测试' },
        { name: '技术支持工程师', match: 79, logic: '解决技术问题', threshold: '技术知识，沟通能力', advice: '提升服务意识' },
        { name: '运维工程师', match: 76, logic: '确保系统稳定运行', threshold: '系统知识，应急能力', advice: '掌握监控工具' },
        { name: '质量工程师', match: 73, logic: '保证产品质量', threshold: '质量知识，技术能力', advice: '学习质量管理方法' },
        { name: '硬件工程师', match: 70, logic: '设计和维护硬件系统', threshold: '电子知识，动手能力', advice: '关注新技术' },
        { name: '实验室技术员', match: 67, logic: '进行实验和分析', threshold: '实验技能，细心', advice: '掌握标准操作流程' },
      ],
      expertQuote: '你的技术能力是宝贵的财富，但别忘了人是技术的使用者。ISTP 5w4 需要学会的是：适当表达你的想法，与他人协作能创造更大价值。',
      salary: { entry: '15-25K', mid: '30-60K', senior: '60-100K' },
    },

    // ESFP AIR 7w6 - 热情表演者
    'ESFP-AIR-7w6': {
      personaTitle: '活力四射的表演家',
      coreAdvantages: [
        { title: '魅力无限', desc: '天生的社交达人，能活跃气氛' },
        { title: '热爱生活', desc: '对美和艺术有敏锐感知' },
        { title: '即兴发挥', desc: '善于随机应变，应对突发情况' },
      ],
      careerRadar: [
        { name: '创新力', score: 88 },
        { name: '逻辑推演', score: 65 },
        { name: '抗压韧性', score: 80 },
        { name: '落地执行', score: 75 },
        { name: '影响力', score: 95 },
        { name: '情绪资本', score: 93 },
      ],
      riskBlackhole: 'ESFP 7w6 的致命短板：冲动行事+缺乏规划。你可能因为过于追求当下而忽视长远，容易受情绪影响决策。',
      riskWorkplace: '以下环境会让你痛苦：长时间独处+重复枯燥+严格规范+缺乏互动。你需要社交和新鲜感，孤独工作会让你枯萎。',
      previewJobs: [
        { name: '活动策划', match: 92, logic: '策划有创意的活动方案', threshold: '创意能力，执行力', advice: '建立供应商资源' },
        { name: '销售代表', match: 89, logic: '用个人魅力打动客户', threshold: '沟通能力，销售技巧', advice: '积累客户资源' },
      ],
      fullJobs: [
        { name: '活动策划', match: 92, logic: '策划有创意的活动方案', threshold: '创意能力，执行力', advice: '建立供应商资源' },
        { name: '销售代表', match: 89, logic: '用个人魅力打动客户', threshold: '沟通能力，销售技巧', advice: '积累客户资源' },
        { name: '公关专员', match: 86, logic: '维护媒体和公众关系', threshold: '沟通能力，应变能力', advice: '积累媒体人脉' },
        { name: '主播/主持人', match: 84, logic: '用个人魅力吸引观众', threshold: '表达能力，个人魅力', advice: '找到自己的风格' },
        { name: '品牌大使', match: 81, logic: '代表品牌形象', threshold: '形象气质，沟通能力', advice: '真诚对待品牌' },
        { name: '培训师', match: 78, logic: '用生动方式传授知识', threshold: '专业知识，演讲能力', advice: '提升互动技巧' },
        { name: '客户经理', match: 75, logic: '维护客户关系', threshold: '服务意识，沟通能力', advice: '建立信任关系' },
        { name: '婚礼策划师', match: 72, logic: '策划浪漫婚礼', threshold: '创意能力，执行能力', advice: '建立供应商资源' },
        { name: '旅游顾问', match: 69, logic: '为客人规划旅行', threshold: '服务意识，地理知识', advice: '积累旅行资源' },
        { name: '社群运营', match: 66, logic: '活跃社群氛围', threshold: '沟通能力，活动策划', advice: '真诚对待成员' },
      ],
      expertQuote: '你的热情和魅力是天赋，但需要理性来引导。ESFP 7w6 需要学会的是：冲动不是自由，理性规划才能让热情持久绽放。',
      salary: { entry: '10-20K', mid: '25-50K', senior: '50-100K' },
    },

    // ISFP AIR 4w3 - 艺术创作者
    'ISFP-AIR-4w3': {
      personaTitle: '敏感的艺术家',
      coreAdvantages: [
        { title: '审美天赋', desc: '对美有敏锐感知和独特表达' },
        { title: '情感丰富', desc: '内心世界细腻，情感表达能力强' },
        { title: '灵活变通', desc: '善于适应变化，不喜欢约束' },
      ],
      careerRadar: [
        { name: '创新力', score: 92 },
        { name: '逻辑推演', score: 62 },
        { name: '抗压韧性', score: 70 },
        { name: '落地执行', score: 73 },
        { name: '影响力', score: 78 },
        { name: '情绪资本', score: 90 },
      ],
      riskBlackhole: 'ISFP 4w3 的致命短板：过于敏感+缺乏规划。你可能因为情绪波动影响工作，容易因为自我怀疑而放弃。',
      riskWorkplace: '以下环境会让你痛苦：高压竞争+严格规范+缺乏创意+人际复杂。你需要创作空间和自由，传统办公室会让你窒息。',
      previewJobs: [
        { name: 'UI/UX设计师', match: 91, logic: '用审美创造优秀设计', threshold: '设计能力，审美能力', advice: '建立作品集' },
        { name: '插画师', match: 88, logic: '用绘画表达内心世界', threshold: '绘画技能，创意能力', advice: '形成个人风格' },
      ],
      fullJobs: [
        { name: 'UI/UX设计师', match: 91, logic: '用审美创造优秀设计', threshold: '设计能力，审美能力', advice: '建立作品集' },
        { name: '插画师', match: 88, logic: '用绘画表达内心世界', threshold: '绘画技能，创意能力', advice: '形成个人风格' },
        { name: '平面设计师', match: 85, logic: '创作视觉设计作品', threshold: '设计软件，审美能力', advice: '关注设计趋势' },
        { name: '摄影师', match: 82, logic: '用镜头捕捉美好瞬间', threshold: '摄影技术，审美能力', advice: '建立个人风格' },
        { name: '视频剪辑师', match: 79, logic: '剪辑有感染力的视频', threshold: '剪辑技能，创意能力', advice: '关注视频趋势' },
        { name: '内容创作者', match: 76, logic: '用独特视角创作内容', threshold: '创作能力，个人魅力', advice: '持续输出' },
        { name: '美术老师', match: 73, logic: '教授美术知识', threshold: '美术功底，教学能力', advice: '培养教学风格' },
        { name: '艺术治疗师', match: 70, logic: '用艺术帮助他人', threshold: '艺术能力，心理学', advice: '考取相关资格证' },
        { name: '陈设设计师', match: 67, logic: '设计空间陈设', threshold: '设计能力，审美能力', advice: '积累供应商资源' },
      ],
      expertQuote: '你的艺术天赋是珍贵的礼物，但需要执行力来变现。ISFP 4w3 需要学会的是：灵感需要落地才能成为作品，坚持比天赋更重要。',
      salary: { entry: '10-18K', mid: '20-40K', senior: '40-80K' },
    },

    // ESTP RCI 7w8 - 冒险企业家
    'ESTP-RCI-7w8': {
      personaTitle: '大胆的冒险家',
      coreAdvantages: [
        { title: '行动力强', desc: '想到就做，不拖延' },
        { title: '应变能力', desc: '善于应对突发情况' },
        { title: '商业嗅觉', desc: '能发现赚钱机会' },
      ],
      careerRadar: [
        { name: '创新力', score: 85 },
        { name: '逻辑推演', score: 78 },
        { name: '抗压韧性', score: 90 },
        { name: '落地执行', score: 92 },
        { name: '影响力', score: 85 },
        { name: '情绪资本', score: 72 },
      ],
      riskBlackhole: 'ESTP 7w8 的致命短板：冲动冒险+缺乏规划。你可能因为追求刺激而忽视风险，容易因为急功近利而做出错误决策。',
      riskWorkplace: '以下环境会让你痛苦：按部就班+需要长期规划+缺乏挑战+过于规范。你需要冒险和刺激，稳定工作会让你厌烦。',
      previewJobs: [
        { name: '销售总监', match: 91, logic: '用冒险精神开拓市场', threshold: '销售经验，领导力', advice: '用数据驱动决策' },
        { name: '创业公司创始人', match: 88, logic: '敢于冒险创业', threshold: '综合能力，抗压能力', advice: '找互补合伙人' },
      ],
      fullJobs: [
        { name: '销售总监', match: 91, logic: '用冒险精神开拓市场', threshold: '销售经验，领导力', advice: '用数据驱动决策' },
        { name: '创业公司创始人', match: 88, logic: '敢于冒险创业', threshold: '综合能力，抗压能力', advice: '找互补合伙人' },
        { name: '投资顾问', match: 85, logic: '发现投资机会', threshold: '财务知识，风险意识', advice: '积累投资经验' },
        { name: '房地产经纪人', match: 82, logic: '促成房产交易', threshold: '销售能力，人脉资源', advice: '建立客户资源' },
        { name: '企业销售', match: 79, logic: '开发大客户', threshold: '销售能力，沟通能力', advice: '积累行业知识' },
        { name: '活动执行', match: 76, logic: '现场执行活动', threshold: '应变能力，执行力', advice: '建立供应商资源' },
        { name: '保险经纪人', match: 73, logic: '销售保险产品', threshold: '销售能力，产品知识', advice: '积累客户资源' },
        { name: '贸易商', match: 70, logic: '从事商品贸易', threshold: '商业头脑，风险意识', advice: '了解市场动态' },
        { name: '体育教练', match: 67, logic: '指导运动员训练', threshold: '专业知识，领导力', advice: '考取教练资格证' },
        { name: '现场管理', match: 64, logic: '管理现场运营', threshold: '应变能力，执行力', advice: '积累现场经验' },
      ],
      expertQuote: '你的行动力是难得的天赋，但需要思考来引导。ESTP 7w8 需要学会的是：冒险不等于盲目，风险评估比冲动更重要。',
      salary: { entry: '12-25K', mid: '30-70K', senior: '70-150K' },
    },

    // INTP IRA 5w6 - 逻辑思想家
    'INTP-IRA-5w6': {
      personaTitle: '深邃的思考者',
      coreAdvantages: [
        { title: '逻辑严密', desc: '擅长复杂分析和推理' },
        { title: '创新思维', desc: '能提出突破性的想法' },
        { title: '独立思考', desc: '不盲从，有自己的见解' },
      ],
      careerRadar: [
        { name: '创新力', score: 94 },
        { name: '逻辑推演', score: 96 },
        { name: '抗压韧性', score: 68 },
        { name: '落地执行', score: 70 },
        { name: '影响力', score: 65 },
        { name: '情绪资本', score: 58 },
      ],
      riskBlackhole: 'INTP 5w6 的致命短板：过度分析+行动力不足。你可能陷入分析瘫痪，想法很多但缺乏执行。',
      riskWorkplace: '以下环境会让你痛苦：频繁社交+政治斗争+重复执行+时间紧迫。你需要思考空间，高压快节奏会让你焦虑。',
      previewJobs: [
        { name: '算法工程师', match: 94, logic: '解决复杂算法问题', threshold: '计算机背景，数学基础', advice: '持续学习新技术' },
        { name: '数据科学家', match: 91, logic: '从数据中发现规律', threshold: '统计学/数学，编程能力', advice: '业务理解很重要' },
      ],
      fullJobs: [
        { name: '算法工程师', match: 94, logic: '解决复杂算法问题', threshold: '计算机背景，数学基础', advice: '持续学习新技术' },
        { name: '数据科学家', match: 91, logic: '从数据中发现规律', threshold: '统计学/数学，编程能力', advice: '业务理解很重要' },
        { name: '研究员', match: 88, logic: '进行深入研究', threshold: '研究能力，学术背景', advice: '发表论文积累影响力' },
        { name: '系统架构师', match: 85, logic: '设计系统架构', threshold: '技术广度，架构思维', advice: '学习开源项目' },
        { name: '软件工程师', match: 82, logic: '开发软件产品', threshold: '编程能力，逻辑思维', advice: '关注代码质量' },
        { name: '金融分析师', match: 79, logic: '分析金融数据', threshold: '财务知识，分析能力', advice: '考取CFA' },
        { name: '技术作家', match: 76, logic: '撰写技术文档', threshold: '技术能力，写作能力', advice: '建立个人风格' },
        { name: '产品策略师', match: 73, logic: '制定产品策略', threshold: '分析能力，战略思维', advice: '关注行业趋势' },
        { name: '实验室研究员', match: 70, logic: '进行实验研究', threshold: '实验技能，耐心', advice: '发表论文' },
        { name: '知识管理专员', match: 67, logic: '整理和组织知识', threshold: '信息管理能力', advice: '使用专业工具' },
      ],
      expertQuote: '你的思维能力是珍贵的礼物，但需要行动来创造价值。INTP 5w6 需要学会的是：完美的想法不如不完美的执行，把想法变成现实更重要。',
      salary: { entry: '15-25K', mid: '30-60K', senior: '60-120K' },
    },

    // ENFJ ESA 2w1 - 魅力领导者
    'ENFJ-ESA-2w1': {
      personaTitle: '充满魅力的领导者',
      coreAdvantages: [
        { title: '感染力强', desc: '能激励和带动他人' },
        { title: '共情能力', desc: '理解他人需求和情感' },
        { title: '组织协调', desc: '善于组织人力达成目标' },
      ],
      careerRadar: [
        { name: '创新力', score: 78 },
        { name: '逻辑推演', score: 72 },
        { name: '抗压韧性', score: 85 },
        { name: '落地执行', score: 83 },
        { name: '影响力', score: 96 },
        { name: '情绪资本', score: 94 },
      ],
      riskBlackhole: 'ENFJ 2w1 的致命短板：过度关心他人+忽视自己。你可能为了帮助他人而耗尽自己，难以拒绝不合理的请求。',
      riskWorkplace: '以下环境会让你痛苦：利益至上+人际冷漠+缺乏意义+孤立无交流。你需要人文关怀和团队氛围，纯商业环境会让你疲惫。',
      previewJobs: [
        { name: '人力资源总监', match: 93, logic: '打造有温度的企业文化', threshold: 'HR经验，领导力', advice: '提升战略思维' },
        { name: '培训总监', match: 90, logic: '设计和实施培训体系', threshold: '培训经验，演讲能力', advice: '关注培训效果' },
      ],
      fullJobs: [
        { name: '人力资源总监', match: 93, logic: '打造有温度的企业文化', threshold: 'HR经验，领导力', advice: '提升战略思维' },
        { name: '培训总监', match: 90, logic: '设计和实施培训体系', threshold: '培训经验，演讲能力', advice: '关注培训效果' },
        { name: '团队负责人', match: 87, logic: '带领团队达成目标', threshold: '管理能力，沟通能力', advice: '学会授权' },
        { name: '教育机构校长', match: 84, logic: '管理教育机构', threshold: '教育背景，管理能力', advice: '关注教育质量' },
        { name: '公关总监', match: 81, logic: '维护公共关系', threshold: '公关经验，媒体资源', advice: '建立媒体人脉' },
        { name: '客户成功总监', match: 78, logic: '确保客户成功', threshold: '服务意识，管理能力', advice: '用数据说话' },
        { name: '销售经理', match: 75, logic: '带领销售团队', threshold: '销售经验，领导力', advice: '用激励而非命令' },
        { name: '市场经理', match: 72, logic: '制定市场策略', threshold: '营销知识，管理能力', advice: '关注ROI' },
        { name: '社群运营总监', match: 69, logic: '运营社群生态', threshold: '运营经验，沟通能力', advice: '建立社群文化' },
        { name: '企业文化建设师', match: 66, logic: '建设企业文化', threshold: 'HR背景，文化敏感度', advice: '了解企业文化案例' },
      ],
      expertQuote: '你的魅力和感染力是天赋，但别忘了也要照顾好自己。ENFJ 2w1 需要学会的是：你不是救世主，设立边界才能更可持续地帮助他人。',
      salary: { entry: '15-25K', mid: '35-60K', senior: '60-100K' },
    },

    // INTJ RIA 5w6 - 战略规划师
    'INTJ-RIA-5w6': {
      personaTitle: '深谋远虑的战略家',
      coreAdvantages: [
        { title: '战略思维', desc: '能制定长期规划和战略' },
        { title: '系统分析', desc: '善于分析复杂系统' },
        { title: '独立判断', desc: '不受他人影响，坚持自己的判断' },
      ],
      careerRadar: [
        { name: '创新力', score: 93 },
        { name: '逻辑推演', score: 97 },
        { name: '抗压韧性', score: 80 },
        { name: '落地执行', score: 82 },
        { name: '影响力', score: 70 },
        { name: '情绪资本', score: 56 },
      ],
      riskBlackhole: 'INTJ 5w6 的致命短板：过度分析+人际疏离。你可能因为追求完美而错过机会，孤独感可能影响判断。',
      riskWorkplace: '以下环境会让你痛苦：需要频繁社交+政治斗争+重复执行+缺乏自主权。你需要深度思考空间，官僚体系会让你窒息。',
      previewJobs: [
        { name: '首席技术官', match: 92, logic: '规划技术发展方向', threshold: '10年+技术经验，战略思维', advice: '提升商业理解' },
        { name: '战略咨询顾问', match: 89, logic: '制定企业发展战略', threshold: '名校MBA，战略思维', advice: '积累行业案例' },
      ],
      fullJobs: [
        { name: '首席技术官', match: 92, logic: '规划技术发展方向', threshold: '10年+技术经验，战略思维', advice: '提升商业理解' },
        { name: '战略咨询顾问', match: 89, logic: '制定企业发展战略', threshold: '名校MBA，战略思维', advice: '积累行业案例' },
        { name: '系统架构师', match: 86, logic: '设计系统架构', threshold: '技术广度，架构能力', advice: '学习开源项目' },
        { name: '产品战略师', match: 83, logic: '制定产品战略', threshold: '产品思维，战略思维', advice: '关注行业趋势' },
        { name: '数据科学家', match: 80, logic: '分析数据发现洞察', threshold: '统计学/数学，编程能力', advice: '业务理解很重要' },
        { name: '研究科学家', match: 77, logic: '进行前沿研究', threshold: '博士学历，研究能力', advice: '发表论文' },
        { name: '投资分析师', match: 74, logic: '分析投资机会', threshold: '财务知识，分析能力', advice: '考取CFA' },
        { name: '技术顾问', match: 71, logic: '提供技术咨询', threshold: '技术背景，沟通能力', advice: '积累行业经验' },
        { name: '商业分析师', match: 68, logic: '分析商业模式', threshold: '商业敏感度，分析能力', advice: '关注行业动态' },
      ],
      expertQuote: '你的战略思维是珍贵的天赋，但需要执行力来变现。INTJ 5w6 需要学会的是：不完美的执行胜过完美的构想，他人的意见也值得倾听。',
      salary: { entry: '18-30K', mid: '40-80K', senior: '80-150K' },
    },

    // ENFP AIS 9w8 - 灵感启发者
    'ENFP-AIS-9w8': {
      personaTitle: '热情的启发者',
      coreAdvantages: [
        { title: '灵感无限', desc: '总能激发他人创造力' },
        { title: '沟通魅力', desc: '天生的演讲者和沟通者' },
        { title: '乐观积极', desc: '能看到事情积极的一面' },
      ],
      careerRadar: [
        { name: '创新力', score: 95 },
        { name: '逻辑推演', score: 70 },
        { name: '抗压韧性', score: 80 },
        { name: '落地执行', score: 72 },
        { name: '影响力', score: 93 },
        { name: '情绪资本', score: 91 },
      ],
      riskBlackhole: 'ENFP 9w8 的致命短板：三分钟热度+缺乏深度。你可能同时开始太多项目而无法完成，容易因为追求新鲜感而浅尝辄止。',
      riskWorkplace: '以下环境会让你痛苦：重复枯燥+严格规范+缺乏创意+孤立无交流。你需要自由和新鲜感，传统层级制会让你窒息。',
      previewJobs: [
        { name: '创意总监', match: 91, logic: '领导创意团队', threshold: '创意能力+管理能力', advice: '学会平衡创意和商业' },
        { name: '内容营销总监', match: 88, logic: '制定内容策略', threshold: '内容经验，战略思维', advice: '关注内容ROI' },
      ],
      fullJobs: [
        { name: '创意总监', match: 91, logic: '领导创意团队', threshold: '创意能力+管理能力', advice: '学会平衡创意和商业' },
        { name: '内容营销总监', match: 88, logic: '制定内容策略', threshold: '内容经验，战略思维', advice: '关注内容ROI' },
        { name: '品牌策划', match: 85, logic: '策划品牌活动', threshold: '品牌知识，创意能力', advice: '建立个人风格' },
        { name: '市场营销经理', match: 82, logic: '策划营销活动', threshold: '营销知识，项目管理', advice: '关注成功案例' },
        { name: '活动策划', match: 79, logic: '策划创意活动', threshold: '创意能力，执行力', advice: '建立供应商资源' },
        { name: '社群运营', match: 76, logic: '运营活跃社群', threshold: '沟通能力，活动策划', advice: '真诚对待成员' },
        { name: '产品运营', match: 73, logic: '运营产品提升活跃', threshold: '用户思维，数据分析', advice: '关注用户反馈' },
        { name: '公关专员', match: 70, logic: '维护媒体关系', threshold: '沟通能力，应变能力', advice: '积累媒体人脉' },
        { name: '内容创作者', match: 67, logic: '创作有感染力内容', threshold: '创作能力，个人魅力', advice: '持续输出' },
        { name: '新媒体运营', match: 64, logic: '运营新媒体账号', threshold: '内容能力，平台理解', advice: '每个平台有特点' },
      ],
      expertQuote: '你的热情和创意是天赋，但需要专注来兑现价值。ENFP 9w8 需要学会的是：少开几个项目，把每个做透做深，专注比广度更重要。',
      salary: { entry: '12-22K', mid: '25-50K', senior: '50-100K' },
    },

    // ISTJ CEI 1w9 - 稳健执行者
    'ISTJ-CEI-1w9': {
      personaTitle: '可信赖的执行者',
      coreAdvantages: [
        { title: '一丝不苟', desc: '对质量有极高要求' },
        { title: '可靠稳定', desc: '说到做到，值得信赖' },
        { title: '流程化', desc: '善于建立和遵循流程' },
      ],
      careerRadar: [
        { name: '创新力', score: 62 },
        { name: '逻辑推演', score: 90 },
        { name: '抗压韧性', score: 92 },
        { name: '落地执行', score: 98 },
        { name: '影响力', score: 65 },
        { name: '情绪资本', score: 70 },
      ],
      riskBlackhole: 'ISTJ 1w9 的致命短板：过于保守+完美主义。你可能因为追求完美而效率低下，对变化的抵触可能限制发展。',
      riskWorkplace: '以下环境会让你痛苦：快速变化+规则不明确+需要即兴发挥+过度强调社交。你需要清晰目标和流程，混乱创业公司可能让你焦虑。',
      previewJobs: [
        { name: '质量管理', match: 94, logic: '确保产品质量', threshold: '质量知识，细心', advice: '学习质量管理方法' },
        { name: '财务经理', match: 91, logic: '管理财务工作', threshold: 'CPA/CFA，管理经验', advice: '提升管理能力' },
      ],
      fullJobs: [
        { name: '质量管理', match: 94, logic: '确保产品质量', threshold: '质量知识，细心', advice: '学习质量管理方法' },
        { name: '财务经理', match: 91, logic: '管理财务工作', threshold: 'CPA/CFA，管理经验', advice: '提升管理能力' },
        { name: '审计师', match: 88, logic: '检查合规性', threshold: '会计/审计背景，CPA', advice: '四大经验很好' },
        { name: '合规专员', match: 85, logic: '确保合规运营', threshold: '法律/财务背景，细心', advice: '持续学习法规' },
        { name: '成本控制', match: 82, logic: '控制运营成本', threshold: '财务知识，分析能力', advice: '关注细节' },
        { name: '数据库管理', match: 79, logic: '维护数据库稳定', threshold: '数据库技术，责任心', advice: '掌握主流系统' },
        { name: 'IT运维', match: 76, logic: '维护系统稳定', threshold: '系统知识，应急能力', advice: '掌握监控工具' },
        { name: '档案管理', match: 73, logic: '管理档案资料', threshold: '细心耐心，组织能力', advice: '学习档案管理' },
        { name: '库存管理', match: 70, logic: '管理库存物资', threshold: '细心，组织能力', advice: '使用管理系统' },
        { name: '标准制定', match: 67, logic: '制定工作标准', threshold: '专业知识，细心', advice: '了解行业标准' },
      ],
      expertQuote: '你的可靠是团队财富，但别让保守成为枷锁。ISTJ 1w9 需要学会的是：完美不是目标，适当的风险是成长的必经之路。',
      salary: { entry: '12-20K', mid: '25-45K', senior: '45-80K' },
    },

    // ESFP AIR 3w2 - 活力沟通者
    'ESFP-AIR-3w2': {
      personaTitle: '阳光的沟通家',
      coreAdvantages: [
        { title: '热情开朗', desc: '天生的开心果，能带动气氛' },
        { title: '人际网络', desc: '善于建立和维护人际关系' },
        { title: '表现力强', desc: '善于表达和展示自己' },
      ],
      careerRadar: [
        { name: '创新力', score: 82 },
        { name: '逻辑推演', score: 64 },
        { name: '抗压韧性', score: 82 },
        { name: '落地执行', score: 76 },
        { name: '影响力', score: 94 },
        { name: '情绪资本', score: 95 },
      ],
      riskBlackhole: 'ESFP 3w2 的致命短板：追求认可+缺乏规划。你可能为了获得认可而过度表现，容易因为追求当下而忽视长远。',
      riskWorkplace: '以下环境会让你痛苦：长时间独处+重复枯燥+严格规范+缺乏互动。你需要社交和认可，孤独工作会让你枯萎。',
      previewJobs: [
        { name: '销售经理', match: 91, logic: '用热情带领销售团队', threshold: '销售经验，领导力', advice: '用数据说话' },
        { name: '公关经理', match: 88, logic: '维护公共关系', threshold: '公关经验，媒体资源', advice: '建立媒体人脉' },
      ],
      fullJobs: [
        { name: '销售经理', match: 91, logic: '用热情带领销售团队', threshold: '销售经验，领导力', advice: '用数据说话' },
        { name: '公关经理', match: 88, logic: '维护公共关系', threshold: '公关经验，媒体资源', advice: '建立媒体人脉' },
        { name: '活动策划', match: 85, logic: '策划精彩活动', threshold: '创意能力，执行力', advice: '建立供应商资源' },
        { name: '客户经理', match: 82, logic: '维护客户关系', threshold: '服务意识，沟通能力', advice: '建立信任关系' },
        { name: '品牌大使', match: 79, logic: '代表品牌形象', threshold: '形象气质，沟通能力', advice: '真诚对待品牌' },
        { name: '主持人', match: 76, logic: '主持各类活动', threshold: '表达能力，应变能力', advice: '找到个人风格' },
        { name: '培训师', match: 73, logic: '用生动方式授课', threshold: '专业知识，演讲能力', advice: '提升互动技巧' },
        { name: '社群运营', match: 70, logic: '活跃社群氛围', threshold: '沟通能力，活动策划', advice: '真诚对待成员' },
        { name: '旅游顾问', match: 67, logic: '为客户规划旅行', threshold: '服务意识，地理知识', advice: '积累旅行资源' },
        { name: '婚庆策划', match: 64, logic: '策划浪漫婚礼', threshold: '创意能力，执行能力', advice: '建立供应商资源' },
      ],
      expertQuote: '你的热情和魅力是天赋，但需要深度来持久。ESFP 3w2 需要学会的是：真正的认可来自专业和价值，而非表面的表现。',
      salary: { entry: '10-20K', mid: '25-50K', senior: '50-100K' },
    },
  };

  // 默认配置（用于未预定义的组合）
  const defaultProfile: PersonalityProfile = {
    personaTitle: '独特的探索者',
    coreAdvantages: [
      { title: '独特视角', desc: '你有着自己独特的观察和理解方式' },
      { title: '成长潜力', desc: '持续学习和适应变化的能力' },
      { title: '价值创造', desc: '能为团队带来不同的思考角度' },
    ],
    careerRadar: [
      { name: '创新力', score: 75 },
      { name: '逻辑推演', score: 78 },
      { name: '抗压韧性', score: 80 },
      { name: '落地执行', score: 75 },
      { name: '影响力', score: 72 },
      { name: '情绪资本', score: 76 },
    ],
    riskBlackhole: `${mbti} ${enneagram} 需要注意：持续自我反思，发现并改进自己的盲点。每种性格都有独特优势，关键是如何发挥和平衡。`,
    riskWorkplace: '找到适合自己的环境很重要。避免与核心价值观冲突的工作场景，寻求能让你成长和发挥才能的平台。',
    previewJobs: [
      { name: '产品经理', match: 80, logic: '结合你的分析能力和用户洞察', threshold: '产品思维，沟通协调' },
      { name: '运营专员', match: 78, logic: '用数据驱动优化运营策略', threshold: '数据分析，执行力' },
    ],
    fullJobs: [
      { name: '产品经理', match: 80, logic: '结合你的分析能力和用户洞察', threshold: '产品思维，沟通协调', advice: '多和用户沟通，了解真实需求' },
      { name: '运营专员', match: 78, logic: '用数据驱动优化运营策略', threshold: '数据分析，执行力', advice: '学习数据分析工具' },
      { name: '数据分析师', match: 76, logic: '从数据中发现商业洞察', threshold: 'SQL/Excel，统计学基础', advice: 'Kaggle练手，积累实战经验' },
      { name: '项目经理', match: 75, logic: '协调资源确保项目交付', threshold: 'PMP认证，沟通能力', advice: '使用项目管理工具提升效率' },
      { name: '用户研究员', match: 73, logic: '理解用户需求和行为', threshold: '研究方法，同理心', advice: '多做用户访谈' },
      { name: '商业分析师', match: 72, logic: '分析商业模式和趋势', threshold: '商业敏感度，逻辑思维', advice: '多看行业报告' },
      { name: '内容运营', match: 70, logic: '创造有价值的内容', threshold: '写作能力，用户思维', advice: '分析爆款内容规律' },
      { name: 'UX设计师', match: 68, logic: '设计优秀的产品体验', threshold: '设计工具，用户思维', advice: '建立作品集' },
      { name: '市场专员', match: 66, logic: '执行市场营销活动', threshold: '营销知识，执行力', advice: '关注成功营销案例' },
      { name: '客户成功', match: 65, logic: '帮助客户成功使用产品', threshold: '沟通能力，问题解决', advice: '建立客户成功案例库' },
    ],
    expertQuote: `每种性格都有其独特的价值和潜力。${mbti} ${holland} ${enneagram} 的组合意味着你有着特别的优势。关键是要了解自己，找到适合自己的发展路径。持续学习和成长，你会发现更多的可能性。`,
    salary: { entry: '10-18K', mid: '20-40K', senior: '40-70K' },
  };

  return profiles[key] || defaultProfile;
};

export default function Home() {
  const [view, setView] = useState<ViewState>('input');
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState<string[]>(LOADING_MESSAGES);
  const [mbti, setMbti] = useState('');
  const [holland, setHolland] = useState('');
  const [enneagram, setEnneagram] = useState('');
  const [industry, setIndustry] = useState('');
  const [blacklist, setBlacklist] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [history, setHistory] = useState<TestHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareCardUrl, setShareCardUrl] = useState('');
  const shareCardRef = useRef<HTMLDivElement>(null);

  // 求职问题问卷状态
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [wechatId, setWechatId] = useState('');
  const [email, setEmail] = useState('');
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // 求职问题选项
  const PROBLEM_OPTIONS = [
    { id: 'resume', label: '简历优化：如何突出经历、量化成果' },
    { id: 'timeline', label: '求职时间线：何时开始准备、申请窗口期' },
    { id: 'networking', label: 'networking技巧：如何拓展人脉、内推渠道' },
    { id: 'interview', label: '面试准备：案例面试、行为面试、技术面试' },
    { id: 'offer', label: 'offer选择：多个offer如何权衡' },
    { id: 'visa', label: '身份/签证：工作签证、身份限制问题' },
    { id: 'industry', label: '行业选择：不确定适合哪个方向' },
    { id: 'skills', label: '技能提升：需要补充哪些硬技能/软技能' },
    { id: 'company', label: '公司选择：大厂vs小厂、不同公司文化' },
    { id: 'salary', label: '薪资谈判：如何争取更好待遇' },
    { id: 'career', label: '职业规划：长期发展路径不清晰' },
    { id: 'mindset', label: '心态调整：焦虑、挫败感' },
    { id: 'info', label: '信息差：不了解招聘流程和要求' },
    { id: 'background', label: '背景提升：实习、项目经历不足' },
    { id: 'other', label: '其他' },
  ];

  // 加载历史记录
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // 更新个性化加载消息
  useEffect(() => {
    if (mbti && holland && enneagram) {
      setLoadingMessages(getPersonalizedLoadingMessages(mbti, holland, enneagram));
    }
  }, [mbti, holland, enneagram]);

  useEffect(() => {
    if (view === 'loading') {
      const interval = setInterval(() => {
        setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 600);
      return () => clearInterval(interval);
    }
  }, [view, loadingMessages]);

  const handleGenerate = () => {
    if (!mbti || !holland || !enneagram) return;
    setView('loading');
    setTimeout(() => {
      // 保存到历史记录
      const profile = getPersonalityProfile(mbti, holland, enneagram);
      saveToHistory(mbti, holland, enneagram, profile.personaTitle);
      setHistory(getHistory());
      setView('result');
    }, 3000);
  };

  const handleHistoryClick = (record: TestHistory) => {
    setMbti(record.mbti);
    setHolland(record.holland);
    setEnneagram(record.enneagram);
    setIndustry('');
    setBlacklist('');
    setIsUnlocked(false);
    setShowHistory(false);
    setView('loading');
    setTimeout(() => {
      setView('result');
    }, 3000);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  // 生成分享卡片
  const handleGenerateShareCard = async () => {
    if (!shareCardRef.current) return;

    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2, // 提高清晰度
        useCORS: true,
        backgroundColor: null,
      });

      const imageUrl = canvas.toDataURL('image/png');
      setShareCardUrl(imageUrl);
      setShowShareCard(true);

      // 自动下载
      const link = document.createElement('a');
      link.download = `我的职业性格-${mbti}-${holland}-${enneagram}.png`;
      link.href = imageUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate share card:', error);
      alert('生成分享卡片失败，请重试');
    }
  };

  // 发送消息到飞书群机器人
  const sendToFeishu = async (data: any) => {
    // 飞书群机器人 Webhook URL - 请替换为你的实际 URL
    const FEISHU_WEBHOOK_URL = process.env.NEXT_PUBLIC_FEISHU_WEBHOOK_URL || 'YOUR_WEBHOOK_URL_HERE';

    if (FEISHU_WEBHOOK_URL === 'YOUR_WEBHOOK_URL_HERE') {
      console.warn('飞书 Webhook URL 未配置，跳过发送');
      return;
    }

    // 获取用户人格画像
    const profile = getPersonalityProfile(data.mbti, data.holland, data.enneagram);
    const rarity = calculateRarity(data.mbti, data.holland, data.enneagram);

    // 格式化问题列表
    const problemLabels = data.problems.map((id: string) => {
      const option = PROBLEM_OPTIONS.find(o => o.id === id);
      return option ? option.label : id;
    });

    // 构建飞书消息卡片
    const feishuMessage = {
      msg_type: 'interactive',
      card: {
        header: {
          title: {
            tag: 'plain_text',
            content: '🔔 新用户提交了求职困惑'
          },
          template: 'blue'
        },
        elements: [
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: '**👤 用户画像**\n' +
                `• **MBTI**: ${data.mbti}\n` +
                `• **霍兰德**: ${data.holland}\n` +
                `• **九型人格**: ${data.enneagram}\n` +
                `• **人格类型**: ${profile.personaTitle}\n` +
                `• **稀有度**: ${rarity.label}`
            }
          },
          {
            tag: 'hr'
          },
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: '**📋 遇到的问题**\n' +
                problemLabels.map((label: string) => `• ${label}`).join('\n')
            }
          },
          {
            tag: 'hr'
          },
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: '**📞 联系方式**\n' +
                (data.wechatId ? `• **微信**: \`${data.wechatId}\`\n` : '') +
                (data.email ? `• **邮箱**: \`${data.email}\`\n` : '')
            }
          },
          {
            tag: 'hr'
          },
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: '**💡 推荐岗位**\n' +
                profile.previewJobs?.slice(0, 3).map((job: any) =>
                  `• **${job.name}** (匹配度 ${job.match}%)`
                ).join('\n') || '暂无建议'
            }
          },
          {
            tag: 'hr'
          },
          {
            tag: 'div',
            text: {
              tag: 'plain_text',
              content: `📅 ${new Date(data.timestamp).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}`
            }
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: {
                  tag: 'plain_text',
                  content: '复制微信号'
                },
                type: 'default',
                url: data.wechatId ? `feishu://copy_text?text=${encodeURIComponent(data.wechatId)}` : ''
              },
              {
                tag: 'button',
                text: {
                  tag: 'plain_text',
                  content: '复制邮箱'
                },
                type: 'default',
                url: data.email ? `feishu://copy_text?text=${encodeURIComponent(data.email)}` : ''
              }
            ].filter((action: any) => action.url)
          }
        ]
      }
    };

    try {
      const response = await fetch(FEISHU_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feishuMessage),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('飞书发送失败:', errorText);
      } else {
        console.log('飞书消息发送成功');
      }
    } catch (error) {
      console.error('发送到飞书时出错:', error);
    }
  };

  // 处理问卷提交
  const handleSurveySubmit = async () => {
    if (selectedProblems.length === 0) {
      alert('请至少选择一个问题');
      return;
    }
    if (!wechatId.trim() && !email.trim()) {
      alert('请填写微信号或邮箱，方便我们联系你');
      return;
    }

    const surveyData = {
      problems: selectedProblems,
      wechatId,
      email,
      mbti,
      holland,
      enneagram,
      timestamp: new Date().toISOString(),
    };

    // 保存到 localStorage
    const existingSurveys = JSON.parse(localStorage.getItem('career_gps_surveys') || '[]');
    existingSurveys.push(surveyData);
    localStorage.setItem('career_gps_surveys', JSON.stringify(existingSurveys.slice(-100)));

    // 发送到飞书多维表格
    await sendToFeishu(surveyData);

    alert('提交成功！我们会尽快联系你，为你提供专业建议。');
    setSurveySubmitted(true);
    setView('input');
    // 重置表单
    setSelectedProblems([]);
    setWechatId('');
    setEmail('');
    setSurveySubmitted(false);
  };

  // 赛博小票风文案生成器
  const getCyberReceiptData = (mbti: string, holland: string, enneagram: string, profile: any) => {
    // 高光称号库（根据性格类型生成）
    const getHeroTitle = () => {
      const titles: Record<string, string[]> = {
        'INTJ': ['整顿职场的神', '莫得感情的杀手', '人间清醒'],
        'INTP': ['拖延症冠军', '脑洞爆炸体', '社交电量 ERROR'],
        'ENTJ': ['天选打工人', '资本家预备役', 'KPI 狂魔'],
        'ENTP': ['杠精转世', '创意核弹', '不靠谱天才'],
        'INFJ': ['深夜哲学家', '治愈系小天使', '过度共情怪'],
        'INFP': ['玻璃心艺术家', '梦想收藏家', 'emo 常驻民'],
        'ENFJ': ['传销头子', '团宠本宠', '社交恐怖分子'],
        'ENFP': ['快乐修勾', '社牛天花板', '三分钟热度'],
        'ISTJ': ['靠谱机器', '规则守护者', 'Excel 成精'],
        'ISFJ': ['老母亲人格', '温暖抱枕', '万年备胎'],
        'ESTJ': ['项目经理', '控制欲怪物', '效率狂人'],
        'ESFJ': [' gossip 女王', '气氛组组长', '人形暖宝宝'],
        'ISTP': ['工具人担当', '手搓高达', '沉默寡言哥'],
        'ISFP': ['佛系躺平', '文艺青年', '活在当下'],
        'ESTP': ['肾上腺素', '现充大佬', '刺激 seeker'],
        'ESFP': ['派对动物', '戏精本精', '朋友圈摄影师'],
      };
      return titles[mbti]?.[Math.floor(Math.random() * 3)] || '神秘物种';
    };

    // 灵魂账单项
    const getReceiptItems = () => {
      const itemSets: Record<string, Array<{name: string, value: string}>> = {
        'NT': [
          { name: '脑洞容量', value: '999 TB' },
          { name: '社交电量', value: 'ERROR' },
          { name: '搬砖意愿', value: '-50%' },
          { name: '搞钱野心', value: '⭐⭐⭐⭐⭐' },
        ],
        'NF': [
          { name: '泪腺流量', value: '∞ mL' },
          { name: '共情能力', value: 'MAX' },
          { name: '现实感', value: 'OFFLINE' },
          { name: '浪漫指数', value: '⭐⭐⭐⭐⭐' },
        ],
        'ST': [
          { name: '执行效率', value: '200%' },
          { name: '规则偏好', value: '∞' },
          { name: '风险厌恶', value: '-100%' },
          { name: '靠谱指数', value: '⭐⭐⭐⭐⭐' },
        ],
        'SP': [
          { name: '行动力', value: 'INSTANT' },
          { name: '耐心值', value: '0.01s' },
          { name: '计划性', value: 'WHAT?' },
          { name: '适应力', value: '⭐⭐⭐⭐⭐' },
        ],
      };

      const type = ['INTJ', 'INTP', 'ENTJ', 'ENTP'].includes(mbti) ? 'NT' :
                   ['INFJ', 'INFP', 'ENFJ', 'ENFP'].includes(mbti) ? 'NF' :
                   ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].includes(mbti) ? 'ST' : 'SP';
      return itemSets[type] || itemSets.NT;
    };

    // 金句库
    const getQuote = () => {
      const quotes: Record<string, string[]> = {
        'INTJ': [
          '你的才华，撑不起你想要睡到自然醒的野心。',
          '世界很吵，但你内心的 BGM 很好听。',
          '别试图理解 INTJ，我们自己都不理解自己。',
        ],
        'INTP': [
          '间歇性踌躇满志，持续性混吃等死。',
          '你的大脑是台超级计算机，但显卡是集成的。',
          '想得太多，做得太少，这就是你的悲剧。',
        ],
        'ENTJ': [
          '你不需要休息，你需要的是 KPI。',
          '你的野心很大，但时间不多。',
          '要么成为大佬，要么成为大佬的踏脚石。',
        ],
        'default': [
          '人生苦短，别为难自己。',
          '你的人生，你做主，但也别太任性。',
          '每颗星星都有自己的轨迹，包括你这颗。',
        ],
      };
      const typeQuotes = quotes[mbti] || quotes.default;
      return typeQuotes[Math.floor(Math.random() * typeQuotes.length)];
    };

    // MBTI社交标签
    const getSocialTag = () => {
      const tags: Record<string, {type: string, target: string}> = {
        'INTJ': { type: 'warning', target: '寻找 ENTJ 老板领养' },
        'INTP': { type: 'warning', target: '禁止 ESFJ 靠近' },
        'INFJ': { type: 'seeking', target: '寻找 ENFP 快乐修勾' },
        'INFP': { type: 'warning', target: '禁止 ESTJ 伤害' },
        'ENTJ': { type: 'seeking', target: '收购有执行力的 INTJ' },
        'ENFP': { type: 'seeking', target: '需要 INFJ 治愈' },
        'ISTJ': { type: 'seeking', target: '寻找靠谱队友' },
        'ESTP': { type: 'warning', target: '禁止 INTP 纠结' },
      };
      return tags[mbti] || { type: 'neutral', target: '寻找同类灵魂' };
    };

    const rarity = calculateRarity(mbti, holland, enneagram);
    const items = getReceiptItems();
    const socialTag = getSocialTag();

    return {
      heroTitle: getHeroTitle(),
      items,
      quote: getQuote(),
      rarity: rarity.label,
      rarityScore: rarity.score,
      socialTag,
      orderId: `#${mbti}-${enneagram}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
    };
  };

  // 分享卡片组件 - 赛博朋克小票风
  const ShareCard = ({ mbti: cardMbti, holland: cardHolland, enneagram: cardEnneagram }: {
    mbti: string;
    holland: string;
    enneagram: string;
  }) => {
    const profile = getPersonalityProfile(cardMbti, cardHolland, cardEnneagram);
    const receiptData = getCyberReceiptData(cardMbti, cardHolland, cardEnneagram, profile);

    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

    return (
      <div
        ref={shareCardRef}
        className="relative overflow-hidden"
        style={{
          width: '375px',
          height: '667px',
          fontFamily: '"Courier New", "Menlo", monospace',
          backgroundColor: '#f5f5f5',
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px)
          `,
        }}
      >
        {/* 锯齿边缘效果 - 顶部 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: `linear-gradient(135deg, #e0e0e0 25%, transparent 25%) -8px 0,
                        linear-gradient(225deg, #e0e0e0 25%, transparent 25%) -8px 0,
                        linear-gradient(315deg, #e0e0e0 25%, transparent 25%),
                        linear-gradient(45deg, #e0e0e0 25%, transparent 25%)`,
          backgroundSize: '16px 16px',
          }}
        />

        {/* 锯齿边缘效果 - 底部 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: `linear-gradient(135deg, #e0e0e0 25%, transparent 25%) -8px 0,
                        linear-gradient(225deg, #e0e0e0 25%, transparent 25%) -8px 0,
                        linear-gradient(315deg, #e0e0e0 25%, transparent 25%),
                        linear-gradient(45deg, #e0e0e0 25%, transparent 25%)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* 皱褶纹理 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* 内容区域 */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          {/* 区域 A: 头部信息 */}
          <div className="mb-4 pt-2">
            <div className="text-center mb-4">
              <div
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  padding: '4px 12px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  display: 'inline-block',
                }}
              >
                [ 赛博职场实验室 © 2025 ]
              </div>
            </div>

            {/* 元数据 */}
            <div className="text-xs" style={{ color: '#333', fontSize: '10px', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>DATE: {dateStr}</span>
                <span>TIME: {timeStr}</span>
              </div>
              <div>ORDER ID: {receiptData.orderId}</div>
            </div>
          </div>

          {/* 区域 B: 核心视觉 - 高光称号 */}
          <div className="mb-4">
            <div
              style={{
                position: 'relative',
                border: '3px solid #1a1a1a',
                padding: '12px',
                backgroundColor: '#fff',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.2)',
                transform: 'rotate(-1deg)',
              }}
            >
              {/* 荧光高亮效果 */}
              <div
                style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '-2px',
                  right: '-2px',
                  bottom: '-2px',
                  border: '2px solid #00ff88',
                  zIndex: -1,
                  transform: 'rotate(1deg)',
                }}
              />
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color: '#1a1a1a',
                  textAlign: 'center',
                  lineHeight: '1.2',
                  fontFamily: '"Arial Black", sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '-1px',
                }}
              >
                {receiptData.heroTitle}
              </div>
            </div>

            {/* 性格标签 */}
            <div className="flex justify-center gap-2 mt-3">
              <span
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                {cardMbti}
              </span>
              <span
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                {cardHolland}
              </span>
              <span
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                {cardEnneagram}
              </span>
            </div>
          </div>

          {/* 区域 C: 灵魂账单 */}
          <div className="mb-4">
            <div style={{ borderTop: '1px dashed #333', marginBottom: '8px' }}></div>
            <div style={{ fontSize: '11px', color: '#1a1a1a' }}>
              {receiptData.items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                    lineHeight: '1.4',
                  }}
                >
                  <span style={{ color: '#666' }}>ITEM: {item.name}</span>
                  <span style={{
                    fontWeight: 'bold',
                    color: item.value.includes('ERROR') ? '#ff4444' :
                           item.value.includes('⭐') ? '#ffaa00' : '#1a1a1a',
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed #333', margin: '8px 0' }}></div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: '900',
                  fontSize: '12px',
                }}
              >
                <span>TOTAL VALUE:</span>
                <span>无法估量</span>
              </div>
            </div>
          </div>

          {/* 区域 D: 毒舌金句 */}
          <div className="mb-4" style={{ position: 'relative' }}>
            {/* 手写标注线 */}
            <div style={{ position: 'absolute', top: '-4px', left: '-8px', right: '-8px', bottom: '-4px', border: '1px solid #ff4444', transform: 'rotate(-0.5deg)' }} />
            <div
              style={{
                fontSize: '11px',
                color: '#333',
                fontStyle: 'italic',
                lineHeight: '1.5',
                padding: '8px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                fontFamily: '"Comic Sans MS", cursive, sans-serif',
              }}
            >
              &quot;{receiptData.quote}&quot;
            </div>
          </div>

          {/* 区域 E: 底部社交区 */}
          <div className="mt-auto">
            {/* 稀有度标签 */}
            <div
              style={{
                border: '2px solid #00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                padding: '8px',
                textAlign: 'center',
                marginBottom: '12px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#00aa55', fontWeight: 'bold', marginBottom: '2px' }}>
                {receiptData.rarity}
              </div>
              <div style={{ fontSize: '9px', color: '#666' }}>
                全网仅 {receiptData.rarityScore}% 的人拥有此配置
              </div>
            </div>

            {/* 社交标签 */}
            <div
              style={{
                backgroundColor: receiptData.socialTag.type === 'warning' ? '#ff4444' : '#1a1a1a',
                color: '#fff',
                padding: '6px',
                textAlign: 'center',
                fontSize: '10px',
                marginBottom: '12px',
                fontWeight: 'bold',
              }}
            >
              {receiptData.socialTag.type === 'warning' ? '⚠️ 警告：' : '🔍 寻找：'}
              {receiptData.socialTag.target}
            </div>

            {/* 条形码 + 二维码 */}
            <div className="flex items-center justify-center gap-3 mb-2">
              {/* 条形码装饰 */}
              <div
                style={{
                  display: 'flex',
                  gap: '2px',
                  height: '40px',
                  width: '120px',
                }}
              >
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: Math.random() > 0.5 ? 2 : 1,
                      backgroundColor: '#1a1a1a',
                      height: '100%',
                    }}
                  />
                ))}
              </div>
              {/* 二维码占位 */}
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#fff',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '2px',
                    padding: '4px',
                  }}
                >
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: Math.random() > 0.3 ? '#1a1a1a' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 引导文案 */}
            <div className="text-center" style={{ fontSize: '9px', color: '#999', marginTop: '8px' }}>
              扫码打印你的灵魂小票 👇
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleExampleClick = (exampleCase: typeof EXAMPLE_CASES[0]) => {
    setMbti(exampleCase.mbti);
    setHolland(exampleCase.holland);
    setEnneagram(exampleCase.enneagram);
    setIndustry('');
    setBlacklist('');
    setIsUnlocked(false);
    setView('loading');
    setTimeout(() => {
      // 保存到历史记录
      const profile = getPersonalityProfile(exampleCase.mbti, exampleCase.holland, exampleCase.enneagram);
      saveToHistory(exampleCase.mbti, exampleCase.holland, exampleCase.enneagram, profile.personaTitle);
      setHistory(getHistory());
      setView('result');
    }, 3000);
  };

  const renderInputView = () => (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-[#0A1F3D] mb-4 tracking-tight">
          Build Your Career
        </h1>
        <p className="text-[#666666] text-lg">
          观己 Discover Self —— 知人者智，自知者明。澄怀观道，择木而栖。
        </p>
        <div className="w-16 h-0.5 bg-[#0A1F3D] mx-auto mt-6"></div>
      </div>

      {/* Form */}
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-8 shadow-sm">
          <div className="space-y-6">
            {/* MBTI */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                MBTI 性格类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={mbti}
                onChange={(e) => setMbti(e.target.value)}
                className="w-full h-12 border border-[#E5E5E5] rounded px-4 text-[#1A1A1A] bg-white focus:border-[#0A1F3D] focus:outline-none transition-colors"
              >
                <option value="">请选择</option>
                {MBTI_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Holland Code */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                霍兰德代码 (RIASEC) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={holland}
                onChange={(e) => setHolland(e.target.value.toUpperCase())}
                placeholder="例如：RIA"
                maxLength={3}
                className="w-full h-12 border border-[#E5E5E5] rounded px-4 text-[#1A1A1A] placeholder-[#999999] focus:border-[#0A1F3D] focus:outline-none transition-colors"
              />
            </div>

            {/* Enneagram */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                九型人格 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={enneagram}
                onChange={(e) => setEnneagram(e.target.value)}
                placeholder="例如：7w8"
                maxLength={3}
                className="w-full h-12 border border-[#E5E5E5] rounded px-4 text-[#1A1A1A] placeholder-[#999999] focus:border-[#0A1F3D] focus:outline-none transition-colors"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                意向赛道 <span className="text-[#999999] font-normal">(可选)</span>
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="例如：互联网、金融、教育"
                className="w-full h-12 border border-[#E5E5E5] rounded px-4 text-[#1A1A1A] placeholder-[#999999] focus:border-[#0A1F3D] focus:outline-none transition-colors"
              />
            </div>

            {/* Blacklist */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                避坑黑名单 <span className="text-[#999999] font-normal">(可选)</span>
              </label>
              <input
                type="text"
                value={blacklist}
                onChange={(e) => setBlacklist(e.target.value)}
                placeholder="例如：不接受加班、拒绝纯销售"
                className="w-full h-12 border border-[#E5E5E5] rounded px-4 text-[#1A1A1A] placeholder-[#999999] focus:border-[#0A1F3D] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGenerate}
            disabled={!mbti || !holland || !enneagram}
            className={`w-full h-12 mt-8 font-semibold text-base rounded transition-all duration-300 ${
              !mbti || !holland || !enneagram
                ? 'bg-[#E5E5E5] text-[#999999] cursor-not-allowed'
                : 'bg-[#0A1F3D] text-white hover:bg-[#0A1830] active:scale-[0.98]'
            }`}
          >
            生成分析报告
          </button>
        </div>

        {/* Example Cases */}
        <div className="w-full max-w-lg mt-10">
          <h3 className="text-center text-sm font-semibold text-[#666666] mb-4">快速体验案例</h3>
          <div className="grid grid-cols-2 gap-3">
            {EXAMPLE_CASES.map((example) => (
              <button
                key={example.id}
                onClick={() => handleExampleClick(example)}
                className="bg-white rounded-lg border border-[#E5E5E5] p-4 text-left hover:border-[#0A1F3D] hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#0A1F3D] bg-[#F5F5F5] px-2 py-1 rounded">
                    {example.mbti}
                  </span>
                  <svg className="w-4 h-4 text-[#999999] group-hover:text-[#0A1F3D] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-[#1A1A1A] mb-1">{example.title}</h4>
                <p className="text-xs text-[#666666] mb-2">{example.description}</p>
                <div className="flex items-center gap-2 text-xs text-[#999999]">
                  <span>{example.holland}</span>
                  <span>·</span>
                  <span>{example.enneagram}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#F5F5F5]">
                  <p className="text-xs text-[#0A1F3D]">
                    推荐: {example.jobs[0]} 等
                  </p>
                  <p className="text-xs text-[#999999] mt-1">
                    薪资: {example.salary.entry} ~ {example.salary.mid}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-[#E5E5E5]">
          <p className="text-sm text-[#666666] mb-3">不知道自己的性格类型？</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://enneagram-personality.com/zh-Hans"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#0A1F3D] bg-[#F5F5F5] px-4 py-2 rounded-lg hover:bg-[#0A1F3D] hover:text-white transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              九型人格测试
            </a>
            <a
              href="https://m.psyctest.cn/t/PqxDRKGv/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#0A1F3D] bg-[#F5F5F5] px-4 py-2 rounded-lg hover:bg-[#0A1F3D] hover:text-white transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              霍兰德职业兴趣测试（90题完整版）
            </a>
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="w-full max-w-lg mt-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full text-center text-sm text-[#0A1F3D] hover:underline transition-colors"
            >
              {showHistory ? '收起' : '查看历史记录'} ({history.length})
            </button>
            {showHistory && (
              <div className="mt-4 bg-white rounded-lg border border-[#E5E5E5] p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-[#1A1A1A]">测试历史</h4>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-[#999999] hover:text-[#0A1F3D] transition-colors"
                  >
                    清空
                  </button>
                </div>
                <div className="space-y-2">
                  {history.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => handleHistoryClick(record)}
                      className="w-full text-left p-3 rounded-lg border border-[#E5E5E5] hover:border-[#0A1F3D] hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#0A1F3D]">
                            {record.personaTitle}
                          </p>
                          <p className="text-xs text-[#666666] mt-1">
                            {record.mbti} · {record.holland} · {record.enneagram}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-[#999999] group-hover:text-[#0A1F3D] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderLoadingView = () => (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-[#F5F5F5]">
      <div className="w-16 h-16 border-4 border-[#E5E5E5] border-t-[#0A1F3D] rounded-full animate-spin mb-8"></div>
      <p className="text-[#1A1A1A] text-lg font-medium">
        {loadingMessages[loadingIndex]}
      </p>
      <div className="w-64 h-1 bg-[#E5E5E5] rounded-full mt-8 overflow-hidden">
        <div className="h-full bg-[#0A1F3D] animate-[loading_3s_ease-in-out_forwards]"></div>
      </div>
    </div>
  );

  const renderResultView = () => {
    const profile = getPersonalityProfile(mbti, holland, enneagram);
    const theme = getThemeColors(mbti);
    const rarity = calculateRarity(mbti, holland, enneagram);

    return (
      <div className="min-h-screen" style={{ backgroundColor: `${theme.background}10` }}>
        {/* Header Bar */}
        <div className="sticky top-0 z-10 backdrop-blur-sm" style={{ backgroundColor: `${theme.background}95`, borderBottomColor: `${theme.accent}20` }}>
          <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
            <button
              onClick={() => {
                setView('input');
                setIsUnlocked(false);
              }}
              className="text-sm hover:opacity-80 transition-opacity flex items-center gap-2"
              style={{ color: theme.text }}
            >
              <span>←</span> 重新测试
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold" style={{ color: theme.text }}>职业分析报告</span>
              <button
                onClick={handleGenerateShareCard}
                className="px-3 py-1 rounded-full text-xs font-bold hover:opacity-80 transition-opacity flex items-center gap-1"
                style={{ backgroundColor: theme.accent, color: theme.background }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                生成海报
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 py-12">
          {/* Persona Tag */}
          <div className="rounded-lg border p-8 mb-6" style={{ backgroundColor: theme.cardBg, borderColor: `${theme.accent}30`, color: theme.text }}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">AI 人设标签</p>
                <div className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: rarity.color, color: theme.background }}>
                  {rarity.label} {rarity.score}%
                </div>
              </div>
              <h2 className="text-3xl font-bold" style={{ color: theme.text }}>
                {profile.personaTitle}
              </h2>
              <p className="text-sm mt-3 opacity-80">{mbti} · {holland} · {enneagram}</p>
            </div>
          </div>

          {/* Core Advantages */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3" style={{ color: theme.text }}>
              <span className="w-8 h-0.5" style={{ backgroundColor: theme.accent }}></span>
              核心优势
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.coreAdvantages.map((item, i) => (
                <div key={i} className="rounded-lg border p-6" style={{ backgroundColor: theme.cardBg, borderColor: `${theme.secondary}30`, color: theme.text }}>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm leading-relaxed opacity-80">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Career Radar */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3" style={{ color: theme.text }}>
              <span className="w-8 h-0.5" style={{ backgroundColor: theme.accent }}></span>
              职场六维雷达
            </h3>
            <div className="rounded-lg border p-6" style={{ backgroundColor: theme.cardBg, borderColor: `${theme.secondary}30` }}>
              <div className="space-y-4">
                {profile.careerRadar.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium" style={{ color: theme.text }}>{item.name}</span>
                      <span className="text-sm font-bold" style={{ color: theme.accent }}>{item.score}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${theme.text}10` }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${item.score}%`, backgroundColor: theme.accent }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3" style={{ color: theme.text }}>
              <span className="w-8 h-0.5" style={{ backgroundColor: theme.accent }}></span>
              避坑预警
            </h3>
            <div className="rounded-lg border p-6" style={{ backgroundColor: theme.cardBg, borderColor: `${theme.secondary}30` }}>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: theme.text }}>性格黑洞</h4>
                  <p className="text-sm leading-relaxed opacity-80" style={{ color: theme.text }}>
                    {profile.riskBlackhole}
                  </p>
                </div>
                <div className="border-t pt-6" style={{ borderColor: `${theme.secondary}30` }}>
                  <h4 className="font-semibold mb-2" style={{ color: theme.text }}>职场雷区</h4>
                  <p className="text-sm leading-relaxed opacity-80" style={{ color: theme.text }}>
                    {profile.riskWorkplace}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Jobs (2 positions) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3" style={{ color: theme.text }}>
              <span className="w-8 h-0.5" style={{ backgroundColor: theme.accent }}></span>
              推荐岗位预览
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.previewJobs.map((job, i) => (
                <div key={i} className="rounded-lg border p-5" style={{ backgroundColor: theme.cardBg, borderColor: `${theme.secondary}30` }}>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold" style={{ color: theme.text }}>{job.name}</h4>
                    <span className="text-sm font-bold px-2 py-1 rounded" style={{ backgroundColor: theme.accent, color: theme.background }}>{job.match}%</span>
                  </div>
                  <p className="text-xs mb-2 opacity-80" style={{ color: theme.text }}>{job.logic}</p>
                  <p className="text-xs opacity-60" style={{ color: theme.text }}>入行门槛：{job.threshold}</p>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3 text-center opacity-60" style={{ color: theme.text }}>解锁后查看 Top 10 完整岗位推荐</p>
          </div>

          {/* Locked Section */}
          <div className="relative">
            {!isUnlocked ? (
              <>
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
                  <div className="w-12 h-12 border-2 border-[#0A1F3D] rounded-full flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-[#0A1F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">解锁完整报告</h3>
                  <p className="text-sm text-[#666666] text-center mb-6 max-w-xs">
                    获取 Top 10 高匹配岗位、薪资预测及专家建议
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#0A1F3D] text-white px-8 py-3 rounded font-semibold text-sm hover:bg-[#0A1830] transition-colors"
                  >
                    立即解锁
                  </button>
                  <p className="text-xs text-[#999999] mt-4">已有 2,847 人解锁</p>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E5E5] p-6 opacity-40">
                  <h3 className="text-lg font-semibold text-[#0A1F3D] mb-4">完整岗位推荐 Top 10</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="border border-[#E5E5E5] rounded p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-[#1A1A1A] text-sm">高匹配岗位 {i}</span>
                          <span className="text-xs text-[#0A1F3D] font-bold">--%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-[#0A1F3D]">完整岗位推荐 Top 10</h3>
                  <span className="text-xs bg-[#0A1F3D] text-white px-3 py-1 rounded-full">已解锁</span>
                </div>
                <div className="space-y-4">
                  {profile.fullJobs.map((job, i) => (
                    <div key={i} className="border border-[#E5E5E5] rounded-lg p-4 hover:border-[#0A1F3D] transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#999999]">#{i + 1}</span>
                            <h4 className="font-semibold text-[#1A1A1A]">{job.name}</h4>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-[#0A1F3D] bg-[#F5F5F5] px-3 py-1 rounded-full">{job.match}%</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-[#666666]"><span className="font-medium text-[#1A1A1A]">匹配逻辑：</span>{job.logic}</p>
                        <p className="text-[#666666]"><span className="font-medium text-[#1A1A1A]">入行门槛：</span>{job.threshold}</p>
                        <p className="text-[#0A1F3D] bg-[#F5F5F5] px-3 py-2 rounded text-xs"><span className="font-semibold">新手建议：</span>{job.advice}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expert Quote */}
                <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
                  <h4 className="text-sm font-semibold text-[#666666] uppercase tracking-wider mb-4">专家寄语</h4>
                  <div className="bg-[#F5F5F5] rounded-lg p-6">
                    <p className="text-[#1A1A1A] text-sm leading-relaxed">
                      &ldquo;{profile.expertQuote}&rdquo;
                    </p>
                    <p className="text-xs text-[#999999] mt-3 text-right">— Build Your Career AI</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Salary Prediction (Only show when unlocked) */}
          {isUnlocked && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[#0A1F3D] mb-4 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-[#0A1F3D]"></span>
                薪资预测
              </h3>
              <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-xs text-[#999999] uppercase tracking-wider mb-1">应届生</p>
                    <p className="text-2xl font-bold text-[#0A1F3D]">{profile.salary.entry}</p>
                    <p className="text-xs text-[#666666]">月薪</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#999999] uppercase tracking-wider mb-1">3-5年</p>
                    <p className="text-2xl font-bold text-[#0A1F3D]">{profile.salary.mid}</p>
                    <p className="text-xs text-[#666666]">月薪</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#999999] uppercase tracking-wider mb-1">5年+</p>
                    <p className="text-2xl font-bold text-[#0A1F3D]">{profile.salary.senior}</p>
                    <p className="text-xs text-[#666666]">月薪</p>
                  </div>
                </div>
                <p className="text-xs opacity-60 mt-4 text-center">基于当前市场数据估算，实际薪资因城市和公司而异</p>
              </div>
            </div>
          )}

          {/* 求职困惑收集 */}
          <div className="mt-8 pt-8 border-t" style={{ borderColor: `${theme.secondary}20` }}>
            <div className="text-center mb-4">
              <p className="text-sm font-semibold mb-1" style={{ color: theme.text }}>遇到求职困惑？</p>
              <p className="text-xs opacity-60" style={{ color: theme.text }}>告诉我们你遇到的求职问题，我们会为你提供专业建议</p>
            </div>
            <button
              onClick={() => setView('survey')}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{ backgroundColor: theme.accent, color: '#fff' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              提交你的求职困惑
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSurveyView = () => {
    // 高盛极简蓝色配色方案
    const gsColors = {
      background: '#FFFFFF',
      headerBg: '#FFFFFF',
      primaryBlue: '#0A1F3D',
      lightBlue: '#1E3A5F',
      borderBlue: '#E2E8F0',
      textMain: '#0A1F3D',
      textSecondary: '#4A5568',
      inputBg: '#F7F9FC',
      selectedBg: '#EBF2FF',
      selectedBorder: '#0A1F3D',
      hoverBg: '#F0F4F8',
    };

    return (
      <div className="min-h-screen" style={{ backgroundColor: gsColors.background }}>
        {/* Header Bar */}
        <div className="sticky top-0 z-10 backdrop-blur-sm" style={{ backgroundColor: gsColors.headerBg, borderBottom: `1px solid ${gsColors.borderBlue}` }}>
          <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
            <button
              onClick={() => setView('result')}
              className="flex items-center gap-2 transition-all hover:scale-105"
              style={{ color: gsColors.textMain }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回结果
            </button>
            <h1 className="text-lg font-semibold" style={{ color: gsColors.textMain, letterSpacing: '0.5px' }}>求职困惑收集</h1>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-5 py-8">
          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3" style={{ color: gsColors.textMain, letterSpacing: '0.5px' }}>告诉我们你的求职困惑</h2>
            <p className="text-sm" style={{ color: gsColors.textSecondary }}>
              选择你遇到的问题，我们会为你提供专业建议
            </p>
          </div>

          {/* Problem Selection */}
          <div className="mb-10">
            <p className="text-sm font-semibold mb-4" style={{ color: gsColors.textMain, letterSpacing: '0.5px' }}>
              你遇到哪些求职问题？<span style={{ color: '#0A1F3D' }}>*</span>
            </p>
            <div className="grid grid-cols-1 gap-2">
              {PROBLEM_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 p-4 rounded cursor-pointer transition-all ${
                    selectedProblems.includes(option.id)
                      ? 'ring-1'
                      : ''
                  }`}
                  style={{
                    backgroundColor: selectedProblems.includes(option.id) ? gsColors.selectedBg : gsColors.inputBg,
                    borderColor: selectedProblems.includes(option.id) ? gsColors.selectedBorder : 'transparent',
                    borderWidth: selectedProblems.includes(option.id) ? '1px' : '0'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedProblems.includes(option.id)) {
                      e.currentTarget.style.backgroundColor = gsColors.hoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedProblems.includes(option.id)) {
                      e.currentTarget.style.backgroundColor = gsColors.inputBg;
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedProblems.includes(option.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProblems([...selectedProblems, option.id]);
                      } else {
                        setSelectedProblems(selectedProblems.filter(p => p !== option.id));
                      }
                    }}
                    className="w-5 h-5 rounded"
                    style={{ accentColor: gsColors.primaryBlue }}
                  />
                  <span className="text-sm font-medium" style={{ color: gsColors.textMain }}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-10">
            <p className="text-sm font-semibold mb-4" style={{ color: gsColors.textMain, letterSpacing: '0.5px' }}>
              联系方式 <span className="text-xs font-normal" style={{ color: gsColors.textSecondary }}>(至少填写一项)*</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block font-medium" style={{ color: gsColors.textMain }}>微信号</label>
                <input
                  type="text"
                  value={wechatId}
                  onChange={(e) => setWechatId(e.target.value)}
                  placeholder="请输入你的微信号"
                  className="w-full px-4 py-3 rounded border focus:outline-none focus:ring-1 transition-all"
                  style={{
                    backgroundColor: gsColors.inputBg,
                    borderColor: gsColors.borderBlue,
                    color: gsColors.textMain,
                    '--tw-ring-color': gsColors.primaryBlue
                  } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="text-sm mb-2 block font-medium" style={{ color: gsColors.textMain }}>邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入你的邮箱"
                  className="w-full px-4 py-3 rounded border focus:outline-none focus:ring-1 transition-all"
                  style={{
                    backgroundColor: gsColors.inputBg,
                    borderColor: gsColors.borderBlue,
                    color: gsColors.textMain,
                    '--tw-ring-color': gsColors.primaryBlue
                  } as React.CSSProperties}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSurveySubmit}
            disabled={surveySubmitted}
            className="w-full py-4 rounded text-white font-semibold text-base transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: gsColors.primaryBlue, letterSpacing: '0.5px' }}
          >
            {surveySubmitted ? '已提交 ✓' : '提交困惑，获取建议'}
          </button>

          {/* Info Text */}
          <p className="text-xs text-center mt-6" style={{ color: gsColors.textSecondary }}>
            提交后我们会尽快通过微信或邮箱联系你，为你提供专业建议
          </p>
        </div>
      </div>
    );
  };

  const renderModal = () => (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowModal(false)}
      />
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-lg shadow-2xl z-50 transition-all duration-300 ${
          showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-8">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-[#999999] hover:text-[#1A1A1A] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">添加导师微信</h3>
            <p className="text-sm text-[#666666] mb-6">支付 ¥9.9 获取完整职业分析报告</p>

            {/* WeChat QR Code */}
            <div className="w-52 h-52 mx-auto bg-[#F5F5F5] rounded-lg flex items-center justify-center mb-6 p-4">
              <img src="/wechat-qr.png" alt="微信二维码" className="w-full h-full object-contain" />
            </div>

            <div className="bg-[#F5F5F5] rounded-lg py-3 px-4 mb-4">
              <p className="text-[#1A1A1A] font-mono text-lg font-semibold">zhizhi275</p>
            </div>

            <div className="bg-[#0A1F3D] rounded-lg py-3 px-4 mb-4">
              <p className="text-white text-2xl font-bold">¥9.9</p>
            </div>

            <p className="text-sm text-[#666666] mb-2">
              扫码添加微信，备注 <span className="font-semibold text-[#0A1F3D]">【99】</span> 支付
            </p>
            <p className="text-xs text-[#999999] mb-6">
              支付后发送完整 PDF 报告
            </p>

            {/* What you get */}
            <div className="text-left bg-[#F5F5F5] rounded-lg p-4 mb-6">
              <p className="text-xs font-semibold text-[#0A1F3D] mb-3">支付 ¥9.9 后可获得：</p>
              <ul className="space-y-2 text-xs text-[#666666]">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0A1F3D]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Top 10 高匹配岗位推荐
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0A1F3D]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  每个岗位的入行门槛+新手建议
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0A1F3D]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  薪资预测（应届生~5年+）
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0A1F3D]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  完整 PDF 报告 + 专家寄语
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setShowModal(false);
                setIsUnlocked(true);
              }}
              className="w-full bg-[#0A1F3D] text-white py-3 rounded font-semibold hover:bg-[#0A1830] transition-colors"
            >
              我已添加
            </button>

            <p className="text-xs text-[#999999] mt-4">
              有问题？<span className="text-[#0A1F3D]">微信号：zhizhi275</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-white">
      {view === 'input' && renderInputView()}
      {view === 'loading' && renderLoadingView()}
      {view === 'result' && renderResultView()}
      {view === 'survey' && renderSurveyView()}
      {renderModal()}

      {/* Hidden ShareCard for screenshot generation */}
      {view === 'result' && (
        <div className="fixed -left-[9999px] top-0">
          <ShareCard mbti={mbti} holland={holland} enneagram={enneagram} />
        </div>
      )}

      {/* Share Card Modal */}
      {showShareCard && shareCardUrl && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-50 transition-opacity"
            onClick={() => setShowShareCard(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <button
              onClick={() => setShowShareCard(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-center mb-4" style={{ color: '#0A1F3D' }}>
              分享卡片已生成！
            </h3>
            <div className="mb-4">
              <img src={shareCardUrl} alt="分享卡片" className="w-full rounded-lg shadow-lg" />
            </div>
            <p className="text-sm text-center text-gray-600 mb-4">
              图片已自动下载，快去小红书或朋友圈分享吧！
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareCard(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={handleGenerateShareCard}
                className="flex-1 bg-[#0A1F3D] text-white py-3 rounded-lg font-semibold hover:bg-[#0A1830] transition-colors"
              >
                重新生成
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </main>
  );
}
