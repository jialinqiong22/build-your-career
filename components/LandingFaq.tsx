"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

interface FaqItem {
  question: string;
  answer: ReactNode;
}

interface FaqCategory {
  id: string;
  label: string;
  items: FaqItem[];
}

const categories: FaqCategory[] = [
  {
    id: "product",
    label: "产品说明",
    items: [
      {
        question: "这是性格测试吗？",
        answer: (
          <>
            这是大五人格、霍兰德职业兴趣、职业价值观和九型人格四个模块，分别呈现倾向，不需要填写经历。免费大五人格可以从
            <Link href="/big-five">这里</Link>
            进入。
          </>
        ),
      },
      {
        question: "看完会得到一个职业吗？",
        answer: <>你会得到四个模块的结果及统一结果图，可以带着具体问题预约求职定位沟通。测评不会直接确定一个职业。</>,
      },
      {
        question: "看完还想再聊怎么办？",
        answer: <>保存结果后添加微信，发送你愿意分享的结果，说明求职定位问题，再确认沟通时间和服务安排。</>,
      },
      {
        question: "要一次看完吗？",
        answer: <>可以分模块、分次完成。主动选择本机保存后，可以在同一设备和浏览器恢复进度。</>,
      },
      {
        question: "首页深色卡片是谁的结果？",
        answer: <>是一个例子，用来看看结束后长什么样。</>,
      },
    ],
  },
  {
    id: "pricing",
    label: "价格与支付",
    items: [
      {
        question: "怎么付款？",
        answer: (
          <>¥99，微信或支付宝转到账后，会给你一个兑换码。不会自动扣费。</>
        ),
      },
      {
        question: "兑换码能用几次？换设备怎么办？",
        answer: (
          <>兑换码在有效期内可以在同一账号重复兑换，换设备后登录同一账号重新兑换即可。兑换码绑定账号，不能转借给他人。</>
        ),
      },
      {
        question: "付完款多久能开始测评？",
        answer: (
          <>以人工核实到账为准，核实通过后发放兑换码。具体节奏以套餐页联系渠道的说明为准；如果尚未配置联系渠道，页面会明确提示暂不收款。</>
        ),
      },
    ],
  },
  {
    id: "privacy",
    label: "隐私与数据",
    items: [
      {
        question: "我的答案存在哪里？",
        answer: <>默认在当前页面暂存；选择本机保存后留在当前设备和浏览器。主动选择云端保存时才写入账号记录。结果图片在浏览器生成，是否发送给咨询老师由你决定。</>,
      },
      {
        question: "云端记录和账号可以删除吗？",
        answer: (
          <>可以。云端测评记录在“我的测评”页逐条删除；账号也可以在同一页自助注销，注销会立即删除账号、全部云端记录和相关社交数据，不可恢复。</>
        ),
      },
      {
        question: "注册时为什么需要邮箱验证码？",
        answer: (
          <>验证码用于确认邮箱属于你本人，注册、找回密码都需要它。验证码10分钟内有效，请勿告诉任何人；忘记密码时可以通过邮箱验证码重置。</>
        ),
      },
    ],
  },
];

export default function LandingFaq() {
  const [active, setActive] = useState(categories[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = categories.findIndex((category) => category.id === active);
    if (index < 0) return;
    let next = -1;
    if (event.key === "ArrowRight") next = (index + 1) % categories.length;
    if (event.key === "ArrowLeft") next = (index - 1 + categories.length) % categories.length;
    if (next >= 0) {
      event.preventDefault();
      setActive(categories[next].id);
      tabRefs.current[next]?.focus();
    }
  }

  const current = categories.find((category) => category.id === active) ?? categories[0];
  return (
    <div>
      <div className="landing-faq-tabs" role="tablist" aria-label="常见问题分类">
        {categories.map((category, index) => (
          <button
            key={category.id}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`faq-tab-${category.id}`}
            aria-selected={category.id === active}
            aria-controls={`faq-panel-${category.id}`}
            tabIndex={category.id === active ? 0 : -1}
            onClick={() => setActive(category.id)}
            onKeyDown={onKeyDown}
          >
            {category.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`faq-panel-${current.id}`}
        aria-labelledby={`faq-tab-${current.id}`}
      >
        {current.items.map((item) => (
          <div className="landing-faq-item" key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
