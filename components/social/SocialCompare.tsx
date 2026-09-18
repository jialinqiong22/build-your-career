"use client";
import { useState } from "react";
import InviteCreator from "./InviteCreator";
import type { SocialScores } from "@/lib/social-validation";
export default function SocialCompare({ scores }: { scores: SocialScores }) {
  const [message, setMessage] = useState("");
  function saveForInvite() {
    try {
      localStorage.setItem("career-social-scores", JSON.stringify(scores));
      setMessage(
        "已将五维分数保存在本机。现在可以返回朋友的邀请页，阅读说明后自行决定是否提交。",
      );
    } catch {
      setMessage("本机保存失败，请允许浏览器存储后重试。");
    }
  }
  return (
    <>
      <InviteCreator kind="compare" payload={{ scores }} />
      <section className="info-box no-print">
        <p>
          如果你是受邀人，可主动将这次五维分数保存到本机，再返回邀请页。此操作不会发送分数给朋友。
        </p>
        <button className="secondary" onClick={saveForInvite}>
          保存五维分数，用于朋友的邀请
        </button>
        <button
          className="text-button"
          onClick={() => {
            try {
              localStorage.removeItem("career-social-scores");
              setMessage("已删除用于邀请的本机分数。");
            } catch {
              setMessage("清除失败，请检查浏览器存储设置。");
            }
          }}
        >
          清除邀请用本机分数
        </button>
        {message && <p role="status">{message}</p>}
      </section>
    </>
  );
}
