# 观己 · 个人定位仪

跨专业的学生个人探索工具，使用原创中文题目。规则生成结果，无AI接口、账号或第三方数据传输。

产品规格：[docs/SPECIFICATION.md](docs/SPECIFICATION.md)。题库与规则：`lib/assessment.ts`。

## 运行

Node.js 22.18+（测试使用原生TypeScript支持）。

```sh
npm ci
npm run dev
npm run test
npm run typecheck
npm run lint
npm run build
```

Cloudflare Pages：构建 `npm run build`，输出 `out`。静态导出不使用 `next start`；本机生产预览可运行 `npx serve out`。

## 数据与边界

默认仅页面内暂存；选择本机保存后存入localStorage，直至用户清除。数据导出包含用户自述，建议妥善保管。题库未经过标准化验证，分数不表示人群百分位、能力或成功概率。版本号随题库或评分语义改变时更新。

V2已移除旧前端Webhook调用。历史提交和已部署V1仍可能包含旧Webhook，仓库改动不能撤销其凭据；需要所有者在飞书后台停用旧机器人地址。上线发布另行执行。
