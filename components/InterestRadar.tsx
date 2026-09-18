"use client";
import { useEffect, useRef } from "react";
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
);

export default function InterestRadar({
  scores,
}: {
  scores: { dimension: string; score: number | null }[];
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvas.current) return;
    const chart = new Chart(canvas.current, {
      type: "radar",
      data: {
        labels: ["R 实践", "I 研究", "A 创意", "S 支持", "E 推动", "C 组织"],
        datasets: [
          {
            data: ["R", "I", "A", "S", "E", "C"].map(
              (id) => scores.find((s) => s.dimension === id)?.score ?? null,
            ),
            borderColor: "#286253",
            backgroundColor: "rgba(40,98,83,0.12)",
            pointBackgroundColor: "#286253",
            borderWidth: 2,
            spanGaps: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: 25 },
            pointLabels: { font: { size: 12 } },
          },
        },
      },
    });
    const beforePrint = () => chart.resize(360, 360);
    const afterPrint = () => chart.resize();
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      chart.destroy();
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, [scores]);
  return (
    <figure style={{ width: "100%", maxWidth: 420, margin: "20px auto" }}>
      <canvas
        ref={canvas}
        role="img"
        aria-label="霍兰德六维兴趣雷达图；完整数值见下方文字分数表。"
      />
      <figcaption className="small">
        0–100为题目得分换算；信息不足的维度留空。
      </figcaption>
    </figure>
  );
}
