"use client";
import { useEffect, useRef, useState } from "react";
import type { BigFiveDomainScore } from "@/lib/bigfive/types";
import { shareDimensions } from "@/lib/share-card";

export default function ShareCard({
  scores,
}: {
  scores: BigFiveDomainScore[];
}) {
  const payload = JSON.stringify(
    Object.fromEntries(
      shareDimensions.map((key) => [
        key,
        scores.find((score) => score.dimension === key)?.score ?? null,
      ]),
    ),
  );
  const [preview, setPreview] = useState<{
    payload: string;
    url: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    generation.current++;
    controller.current?.abort();
    setBusy(false);
    setError("");
    setPreview(null);
    return () => {
      controller.current?.abort();
    };
  }, [payload]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );
  async function generate() {
    const current = ++generation.current;
    controller.current?.abort();
    const requestController = new AbortController();
    controller.current = requestController;
    setBusy(true);
    setError("");
    setPreview(null);
    try {
      const response = await fetch("/api/social/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        signal: requestController.signal,
      });
      if (!response.ok) throw new Error("生成失败，请稍后重试。");
      const blob = await response.blob();
      if (current !== generation.current || requestController.signal.aborted)
        return;
      setPreview({ payload, url: URL.createObjectURL(blob) });
    } catch (err) {
      if (current === generation.current && !requestController.signal.aborted)
        setError(err instanceof Error ? err.message : "生成失败。");
    } finally {
      if (current === generation.current && !requestController.signal.aborted)
        setBusy(false);
    }
  }
  return (
    <section
      className="report-card no-print"
      aria-labelledby="share-card-title"
    >
      <h2 id="share-card-title">主动分享你的工作方式</h2>
      <p>
        点击生成后，仅将五维分数发送到本站生成图片，不发送回答、姓名或账号资料，不保存图片，也不建立公开结果链接。下载后，由你决定分享给谁；已经被他人保存的图片无法远程撤回。
      </p>
      <p className="small">
        卡片使用固定英文字体，依次对应开放性、尽责性、外向性、宜人性、情绪稳定性，并根据最鲜明的两项倾向生成200词以内的优势、注意点和行动建议。情绪稳定性为100减去情绪敏感性分数；信息不足时不推断。
      </p>
      <button
        type="button"
        className="secondary"
        disabled={busy}
        onClick={generate}
      >
        {busy ? "正在生成…" : "生成分享卡片"}
      </button>
      {error && <p role="alert">{error}</p>}
      {preview?.payload === payload && (
        <div style={{ marginTop: 20 }}>
          {/* Object URL is a user-requested generated image, not a remote asset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.url}
            alt="大五五维结果分享卡片预览，分数与上方测评结果一致"
            width={800}
            height={1240}
            style={{
              width: "100%",
              maxWidth: 480,
              height: "auto",
              display: "block",
            }}
          />
          <a
            className="primary"
            href={preview.url}
            download="观己-IPIP50分享卡.png"
            style={{ marginTop: 16 }}
          >
            保存图片
          </a>
          <button
            type="button"
            className="text-button"
            onClick={() => setPreview(null)}
            style={{ marginLeft: 16 }}
          >
            清除预览
          </button>
        </div>
      )}
    </section>
  );
}
