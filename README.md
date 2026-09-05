# 观己 · 个人定位仪

跨专业的学生个人探索工具。免费IPIP-50大五；¥199完整服务包含IPIP-NEO-120、兴趣、价值观、行为经历、PDF及沟通。规则生成结果，无AI接口。已加入Neon邮箱/手机号密码账号系统，账号不自动关联套餐或云端报告。中文适配不是经过验证的标准中文量表。

账号配置、数据库结构与验收：[docs/ACCOUNT-AUTH.md](docs/ACCOUNT-AUTH.md)。注册入口 `/register`，登录入口 `/login`。

当前规格：[docs/V4-SPECIFICATION.md](docs/V4-SPECIFICATION.md)。当前模型与规则：`lib/positioning.ts`；`lib/assessment.ts`保留作旧版回归参考，不用于V4界面和接口。

V4包含原创价值观40题、RIASEC兴趣探索、120题大五、五类行为证据与成长条件、可选原创36题九型动机反思。不合成总分、不设置固定占比，分档只改变报告引导。

无需登录的本机全流程验收：`npm run dev -- --hostname 127.0.0.1 --port 4174`，打开 `http://127.0.0.1:4174/preview`。该入口仅development可用；生产请求返回404。不是收款或套餐授权，不要将开发服务器暴露到公网。

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

生产运行：`npm run build` 后 `npm run start`。使用Vercel Next.js服务端部署，不再使用Cloudflare Pages静态`out`目录；旧静态部署不能支持兑换码鉴权。

## 人工收款套餐

微信/支付宝人工核实到账后发兑换码。参见 [运营操作手册](docs/PAID-OPERATIONS.md)，环境变量见 `.env.example`。未配置服务端签名密钥时兑换关闭；未配置联系渠道时页面明确暂不收款。不要将密钥放入前端或提交仓库。

免费入口 `/big-five`；服务套餐 `/premium`；题库许可 `/sources`。兑换码在有效期内可重复验证，不是一次性码；需要一次性核销或订单数据库时另行实现。PDF使用浏览器打印中的“另存为PDF”，沟通人工预约，没有自动发送报告。

## 数据与边界

免费答案仅在浏览器处理。完整套餐在生成报告时向本站服务端提交答案用于校验和计算，不写入应用数据库；访问凭证使用HttpOnly Cookie。默认答案仅页面内暂存；选择本机保存后存入localStorage，直至用户清除。报告及导出包含自述，用户自行决定是否分享。旧V2记录不会自动转换或删除。

分数是线性0–100描述分，不表示人群百分位、能力或成功概率。50题每维至少8题、120题每维至少20题有效才显示分数，细分维度至少3/4有效。题库来源版本及MIT许可见 `public/licenses/bigfive-sources.txt`。

V2已移除旧前端Webhook调用。历史提交和已部署V1仍可能包含旧Webhook，仓库改动不能撤销其凭据；需要所有者在飞书后台停用旧机器人地址。上线发布另行执行。
