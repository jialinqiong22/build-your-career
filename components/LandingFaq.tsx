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
        question: "这是不是又一个网红测评？",
        answer: (
          <>霍兰德、价值观和九型使用原创探索题，大五采用IPIP公开量表。题库来源、许可和使用边界都列在<Link href="/sources">“测评来源、授权与边界说明”</Link>中。</>
        ),
      },
      {
        question: "报告会不会都是套话？",
        answer: (
          <>报告使用预先编写的规则与解读句，区分“已有自述证据支持的线索”和“还没验证的假设”，不会只给一个笼统结论。自述信息未经独立核验。</>
        ),
      },
      {
        question: "测完到底有没有用？",
        answer: (
          <>这不是职业诊断，而是帮你理清已有的信息和还缺的信息。¥9.9版会给出在线结构化小结；选择¥99版时，可以在1对1沟通中进一步把下一步理清楚。</>
        ),
      },
      {
        question: "需要一次做完吗？",
        answer: (
          <>不需要。主动选择本机保存后，可以分次完成。请在共用设备上谨慎保存；浏览与免费大五不要求注册，付费、兑换、云端保存、历史记录和PDF需要验证身份。</>
        ),
      },
      {
        question: "首页样本区里的报告是真实案例吗？",
        answer: (
          <>当前均为示例数据，人物是虚构的。真实案例只会在取得本人明确同意后展示，并且会和示例数据一样，在卡片上标明来源。</>
        ),
      },
    ],
  },
  {
    id: "pricing",
    label: "价格与支付",
    items: [
      {
        question: "怎么付款？会自动扣费吗？",
        answer: (
          <>微信或支付宝人工确认到账后发放兑换码。没有支付接口、不自动订阅、不会自动扣费，套餐页会展示当前可用的联系渠道。</>
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
        answer: (
          <>默认只在本机：免费大五仅页面内处理，完整测评默认页面内暂存，选择本机保存后写入浏览器localStorage，直到你清除。只有主动选择云端保存才会上传。</>
        ),
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
