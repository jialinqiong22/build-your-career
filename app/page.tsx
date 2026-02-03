'use client';

import { useState, useEffect } from 'react';

type ViewState = 'input' | 'loading' | 'result';

const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

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
  previewJobs: Array<{ name: string; match: number; logic: string; threshold: string }>;
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
  const [mbti, setMbti] = useState('');
  const [holland, setHolland] = useState('');
  const [enneagram, setEnneagram] = useState('');
  const [industry, setIndustry] = useState('');
  const [blacklist, setBlacklist] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (view === 'loading') {
      const interval = setInterval(() => {
        setLoadingIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 600);
      return () => clearInterval(interval);
    }
  }, [view]);

  const handleGenerate = () => {
    if (!mbti || !holland || !enneagram) return;
    setView('loading');
    setTimeout(() => {
      setView('result');
    }, 3000);
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
          AI 驱动的职业定位分析系统
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
        <p className="text-center text-sm text-[#666666] mt-8">
          不知道自己的性格类型？<a href="https://enneagram-personality.com/zh-Hans" target="_blank" rel="noopener noreferrer" className="text-[#0A1F3D] underline underline-offset-4 hover:no-underline">前往测试（九型人格）</a>
        </p>
      </div>
    </div>
  );

  const renderLoadingView = () => (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-[#F5F5F5]">
      <div className="w-16 h-16 border-4 border-[#E5E5E5] border-t-[#0A1F3D] rounded-full animate-spin mb-8"></div>
      <p className="text-[#1A1A1A] text-lg font-medium">
        {LOADING_MESSAGES[loadingIndex]}
      </p>
      <div className="w-64 h-1 bg-[#E5E5E5] rounded-full mt-8 overflow-hidden">
        <div className="h-full bg-[#0A1F3D] animate-[loading_3s_ease-in-out_forwards]"></div>
      </div>
    </div>
  );

  const renderResultView = () => {
    const profile = getPersonalityProfile(mbti, holland, enneagram);

    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        {/* Header Bar */}
        <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
            <button
              onClick={() => {
                setView('input');
                setIsUnlocked(false);
              }}
              className="text-sm text-[#666666] hover:text-[#0A1F3D] transition-colors flex items-center gap-2"
            >
              <span>←</span> 重新测试
            </button>
            <span className="text-sm font-semibold text-[#0A1F3D]">职业分析报告</span>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 py-12">
          {/* Persona Tag */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-8 mb-6">
            <div className="text-center">
              <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider mb-3">AI 人设标签</p>
              <h2 className="text-3xl font-bold text-[#0A1F3D]">
                {profile.personaTitle}
              </h2>
              <p className="text-sm text-[#666666] mt-3">{mbti} · {holland} · {enneagram}</p>
            </div>
          </div>

          {/* Core Advantages */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#0A1F3D] mb-4 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-[#0A1F3D]"></span>
              核心优势
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.coreAdvantages.map((item, i) => (
                <div key={i} className="bg-white rounded-lg border border-[#E5E5E5] p-6">
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">{item.title}</h4>
                  <p className="text-sm text-[#666666] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Career Radar */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#0A1F3D] mb-4 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-[#0A1F3D]"></span>
              职场六维雷达
            </h3>
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <div className="space-y-4">
                {profile.careerRadar.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-[#1A1A1A]">{item.name}</span>
                      <span className="text-sm font-bold text-[#0A1F3D]">{item.score}</span>
                    </div>
                    <div className="h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0A1F3D] rounded-full transition-all duration-1000"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#0A1F3D] mb-4 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-[#0A1F3D]"></span>
              避坑预警
            </h3>
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">性格黑洞</h4>
                  <p className="text-sm text-[#666666] leading-relaxed">
                    {profile.riskBlackhole}
                  </p>
                </div>
                <div className="border-t border-[#E5E5E5] pt-6">
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">职场雷区</h4>
                  <p className="text-sm text-[#666666] leading-relaxed">
                    {profile.riskWorkplace}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Jobs (2 positions) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#0A1F3D] mb-4 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-[#0A1F3D]"></span>
              推荐岗位预览
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.previewJobs.map((job, i) => (
                <div key={i} className="bg-white rounded-lg border border-[#E5E5E5] p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-[#1A1A1A]">{job.name}</h4>
                    <span className="text-sm font-bold text-[#0A1F3D] bg-[#F5F5F5] px-2 py-1 rounded">{job.match}%</span>
                  </div>
                  <p className="text-xs text-[#666666] mb-2">{job.logic}</p>
                  <p className="text-xs text-[#999999]">入行门槛：{job.threshold}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#999999] mt-3 text-center">解锁后查看 Top 10 完整岗位推荐</p>
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
                <p className="text-xs text-[#999999] mt-4 text-center">基于当前市场数据估算，实际薪资因城市和公司而异</p>
              </div>
            </div>
          )}
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
      {renderModal()}

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </main>
  );
}
