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

  const renderResultView = () => (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header Bar */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => setView('input')}
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
              暴走的极客
            </h2>
            <p className="text-sm text-[#666666] mt-3">INTP · RIA · 7w8</p>
          </div>
        </div>

        {/* Core Advantages */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#0A1F3D] mb-4 flex items-center gap-3">
            <span className="w-8 h-0.5 bg-[#0A1F3D]"></span>
            核心优势
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: '抽象思维怪兽', desc: '能在脑海中构建复杂的系统架构' },
              { title: '独立研究者', desc: '不需要他人指引，自己就能深挖问题本质' },
              { title: '创新破局者', desc: '总能找到别人想不到的解决方案' },
            ].map((item, i) => (
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
              {[
                { name: '创新力', score: 92 },
                { name: '逻辑推演', score: 95 },
                { name: '抗压韧性', score: 85 },
                { name: '落地执行', score: 78 },
                { name: '影响力', score: 70 },
                { name: '情绪资本', score: 65 },
              ].map((item) => (
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
                  INTP 7w8 的致命短板：三分钟热度+执行力不足。容易沉迷于构思完美方案，却难以坚持落地。你的大脑像台超级跑车，但常常忘记加油。
                </p>
              </div>
              <div className="border-t border-[#E5E5E5] pt-6">
                <h4 className="font-semibold text-[#1A1A1A] mb-2">职场雷区</h4>
                <p className="text-sm text-[#666666] leading-relaxed">
                  以下环境会让你痛苦：<span className="font-medium text-[#1A1A1A]">严格打卡+形式主义汇报+重复性工作+层级森严的科层制</span>。你需要自主权和创新空间，国企/传统大厂可能让你窒息。
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
            {[
              {
                name: 'UX 研究员',
                match: 78,
                logic: '用研究思维理解用户行为，发挥你的洞察力',
                threshold: '心理学/社会学背景优先，数据分析能力',
              },
              {
                name: '产品分析师',
                match: 75,
                logic: '结合数据分析和逻辑推理，为产品决策提供支持',
                threshold: 'SQL/Excel必备，商业敏感度优先',
              },
            ].map((job, i) => (
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
                {[
                  { name: 'AI 产品经理', match: 96, logic: '结合你的INTP逻辑推演能力和对创新的追求，这个岗位能充分发挥你的系统思维', threshold: '需要了解机器学习基础，有技术背景加分', advice: '前三个月多和开发沟通，学会用产品思维翻译技术语言' },
                  { name: '数据科学家', match: 93, logic: '你的抽象思维和独立研究能力，非常适合从数据中挖掘洞察', threshold: 'Python/SQL必备，统计学基础优先', advice: '先精通一种工具，不要贪多，Kaggle练手' },
                  { name: '技术战略分析师', match: 89, logic: '能够站在行业高度思考技术趋势，符合你的大局观', threshold: '需要3-5年技术背景+商业敏感度', advice: '多看行业报告，培养商业嗅觉' },
                  { name: '算法工程师', match: 86, logic: '用数学思维解决复杂问题，INTP的逻辑优势在这里得到极致发挥', threshold: '数学/计算机背景，LeetCode中等题以上', advice: '扎实的基础比刷题更重要，理解原理比记住公式关键' },
                  { name: '独立开发者', match: 85, logic: '完全自主的工作方式，没人管你，但需要自律', threshold: '全栈能力+产品思维+市场意识', advice: '先从MVP开始，不要追求完美' },
                  { name: 'UX 研究员', match: 82, logic: '用研究思维理解用户行为，发挥你的洞察力', threshold: '心理学/社会学背景优先，数据分析能力', advice: '学会讲故事，把数据变成洞察' },
                  { name: '产品分析师', match: 78, logic: '结合数据分析和逻辑推理，为产品决策提供支持', threshold: 'SQL/Excel必备，商业敏感度优先', advice: '关注业务指标而非数据本身' },
                  { name: '技术文档工程师', match: 76, logic: '将复杂技术概念转化为清晰文档，符合你的分析能力', threshold: '技术背景+优秀的写作能力', advice: '站在用户角度思考，他们需要知道什么' },
                  { name: '商业分析师', match: 74, logic: '分析市场趋势和商业模式，需要系统性思维', threshold: 'Excel/PPT精通，逻辑思维强', advice: '多看行业报告，学习框架思维' },
                  { name: '数据产品经理', match: 72, logic: '介于技术和产品之间，需要理解数据和用户需求', threshold: 'SQL基础+产品思维', advice: '先做数据分析师积累经验' },
                ].map((job, i) => (
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
                    &ldquo;你的大脑是台超级跑车，但常常忘记加油。INTP 7w8 的致命短板是三分钟热度+执行力不足。找一个能容忍你发散又能托底你落地的环境，比选行业更重要。&rdquo;
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
                  <p className="text-2xl font-bold text-[#0A1F3D]">8-12K</p>
                  <p className="text-xs text-[#666666]">月薪</p>
                </div>
                <div>
                  <p className="text-xs text-[#999999] uppercase tracking-wider mb-1">3-5年</p>
                  <p className="text-2xl font-bold text-[#0A1F3D]">20-35K</p>
                  <p className="text-xs text-[#666666]">月薪</p>
                </div>
                <div>
                  <p className="text-xs text-[#999999] uppercase tracking-wider mb-1">5年+</p>
                  <p className="text-2xl font-bold text-[#0A1F3D]">40-80K</p>
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
