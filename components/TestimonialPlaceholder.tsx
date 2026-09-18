const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL?.trim();

// Honest placeholder for future testimonials. The three slots follow the same
// card grid a real testimonial wall will use, so swapping in real feedback
// later needs no structural change.
export default function TestimonialPlaceholder() {
  return (
    <section className="landing-voices" aria-labelledby="voices-title">
      <span className="eyebrow">早期使用者 · 反馈征集</span>
      <h2 id="voices-title">这里还没有使用者的评价</h2>
      <p>
        产品刚上线，还没有足够多的真实反馈，所以这里暂时是空的——我们不放编造的好评。测过之后愿意留一句话，你的反馈会出现在下面的位置。
      </p>
      <div className="landing-voices-grid" aria-hidden="true">
        <div className="landing-voice-slot">第 1 条反馈 · 待真实使用者填写</div>
        <div className="landing-voice-slot">第 2 条反馈 · 待真实使用者填写</div>
        <div className="landing-voice-slot">第 3 条反馈 · 待真实使用者填写</div>
      </div>
      <div className="landing-voices-actions">
        <p className="small">
          可以通过页面右下角的在线客服留言
          {SUPPORT_EMAIL ? (
            <>
              ，或发邮件到{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </>
          ) : null}
          。一句话或几段字都可以；我们只会在征得你同意后展示，可匿名。
        </p>
      </div>
    </section>
  );
}
