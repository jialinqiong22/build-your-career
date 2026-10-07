"use client";

import { useEffect, useState } from "react";
import WeChatContact from "./WeChatContact";

import type { ResultCard } from "@/lib/module-results";

/** Render locally: creating a result image never uploads answers or scores. */
export default function ResultImages({ cards }: { cards: ResultCard[] }) {
  const signature = JSON.stringify(cards);
  const [images, setImages] = useState<{ title: string; url: string }[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { setImages([]); setError(""); }, [signature]);

  function generate() {
    setError("");
    try {
      const canvases: HTMLCanvasElement[] = [];
      const generated = cards.map(card => {
        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        const lines: string[] = [];
        const context = canvas.getContext("2d");
        if (!context) throw new Error("当前浏览器无法生成图片，请截图保存结果。");
        context.font = '28px system-ui, "Microsoft YaHei", sans-serif';
        for (const note of [...(card.notes ?? []), "分数为量表内描述，不是能力、排名或职业结论。", "保存后可发给咨询老师，沟通时间请添加微信确认。"]) {
          let line = "";
          for (const char of note) {
            if (context.measureText(line + char).width > 872) { lines.push(line); line = char; }
            else line += char;
          }
          if (line) lines.push(line);
          lines.push("");
        }
        const headlineHeight = card.headline ? 70 : 0;
        canvas.height = 330 + headlineHeight + card.rows.length * 100 + lines.length * 42;
        context.fillStyle = "#fafaf7";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#254d43";
        context.font = 'bold 28px system-ui, "Microsoft YaHei", sans-serif';
        context.fillText("观己 / Anchor Point Career", 64, 72);
        context.fillStyle = "#242424";
        context.font = 'bold 44px system-ui, "Microsoft YaHei", sans-serif';
        context.fillText(card.title, 64, 146);
        context.font = '26px system-ui, "Microsoft YaHei", sans-serif';
        context.fillText(`生成日期：${new Date().toLocaleDateString("zh-CN")}`, 64, 198);
        if (card.headline) {
          context.fillStyle = "#254d43";
          context.font = 'bold 36px system-ui, "Microsoft YaHei", sans-serif';
          context.fillText(card.headline, 64, 258);
        }
        card.rows.forEach((row, index) => {
          const y = 266 + headlineHeight + index * 100;
          context.fillStyle = "#242424";
          context.font = '30px system-ui, "Microsoft YaHei", sans-serif';
          context.textAlign = "left";
          context.fillText(row.label, 64, y);
          context.textAlign = "right";
          context.fillText(row.score === null ? "信息不足" : `${row.score} / 100`, 936, y);
          context.textAlign = "left";
          context.fillStyle = "#e3e8e5";
          context.fillRect(64, y + 20, 872, 16);
          if (row.score !== null) {
            context.fillStyle = "#254d43";
            context.fillRect(64, y + 20, 872 * row.score / 100, 16);
          }
        });
        context.fillStyle = "#595959";
        context.font = '28px system-ui, "Microsoft YaHei", sans-serif';
        lines.forEach((line, index) => context.fillText(line, 64, 310 + headlineHeight + card.rows.length * 100 + index * 42));
        canvases.push(canvas);
        return { title: card.title, url: canvas.toDataURL("image/png") };
      });
      if (generated.length > 1) {
        const all = document.createElement("canvas");
        all.width = 1000;
        all.height = canvases.reduce((sum,c)=>sum+c.height,0);
        const ctx = all.getContext("2d");
        if (!ctx) throw new Error("无法合并图片，请分别保存模块结果。");
        let offset=0;
        for(const canvas of canvases){ctx.drawImage(canvas,0,offset);offset+=canvas.height;}
        generated.unshift({title:"四个模块统一结果",url:all.toDataURL("image/png")});
      }
      setImages(generated);
      const link = document.createElement("a");
      link.href=generated[0].url;
      link.download="观己-"+generated[0].title+".png";
      link.click();
    } catch (e) { setError(e instanceof Error ? e.message : "生成失败，可先截图保存结果。"); }
  }

  return <section className="report-card no-print" aria-label="保存结果与咨询">
    <h2>保存结果，预约求职定位咨询</h2>
    <p>{cards.length > 1 ? "一键生成并下载统一长图，同时保留四张模块单图。" : "生成并下载本模块结果图；完成四个模块后，还可以保存统一长图。"}图片在当前浏览器生成，不上传答案或分数。你决定是否发送。</p>
    <button type="button" className="secondary" onClick={generate}>{cards.length>1?"保存全部结果图片":"保存本模块结果图片"}</button>
    {error && <p role="alert">{error}</p>}
    {images.map(image => <div key={image.title} style={{marginTop: 24}}>
      <h3>{image.title}</h3>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.url} alt={`${image.title}结果图片`} style={{width:"100%",maxWidth:480,height:"auto",display:"block"}} />
      <a className="primary" href={image.url} download={`观己-${image.title}.png`} style={{marginTop:16}}>保存{image.title}图片</a>
    </div>)}
    {images.length > 0 && <p>手机上可长按图片保存；若微信没有显示保存选项，请用系统浏览器打开，或截图留存。下载是否成功以相册或文件中能找到图片为准。</p>}
    <ol><li>完成四个必做模块，保存统一长图或各模块结果图。</li><li>添加下方微信，备注“观己”，主动发送你愿意分享的结果。</li><li>说明想讨论的问题，再确认沟通时间和服务安排。</li></ol>
    <WeChatContact plan="guided" />
  </section>;
}
