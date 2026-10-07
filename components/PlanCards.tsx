import Link from "next/link";
import WeChatContact from "./WeChatContact";

export default function PlanCards() {
  return (
    <section className="landing-offer" id="offer" aria-labelledby="offer-title">
      <div>
        <span className="eyebrow">¥99</span>
        <h2 id="offer-title">想让人陪你把这件事说清楚。</h2>
        <p>看完如果还想再聊一聊，可以约 30 分钟。</p>
        <ul>
          <li>把你看到的整理成一页</li>
          <li>30 分钟</li>
          <li>一起把它变成这周的一件事</li>
        </ul>
      </div>
      <article className="landing-offer-card">
        <p className="price">
          ¥99<span> / 一次沟通</span>
        </p>
        <WeChatContact plan="guided" />
        <Link className="secondary" href="/premium?plan=guided">
          已有兑换码，去开通
        </Link>
      </article>
    </section>
  );
}
