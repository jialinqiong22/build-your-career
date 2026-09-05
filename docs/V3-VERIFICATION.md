# V3 验收记录

## 2026-09-06 预览部署

现有V3部署至Vercel项目build-your-career-v2，部署ID `dpl_3EPWJgxcuCKduUYyMzWGGmsty9Mx`，CLI inspect确认Ready、target=preview。未更新正式域名，未推送GitHub。链接：https://build-your-career-v2-ep1omwjmg-cedars-projects-cede68d1.vercel.app 。重新运行20项测试和构建通过。预览环境变量列表为空，付费兑换保持关闭；未以HTTP抓取或浏览器功能测试验证远端页面。

这不是最新讨论的五模块完成版：仍为兴趣18题和价值观8选3，九型、职业锚40题、霍兰德90题及证据信息分档未接入。施恩40题出版方原始材料明确标注版权（https://catalogimages.wiley.com/images/db/pdf/9781118455760.excerpt.pdf）；未复制，改用原创题需用户确认。仅将当前已完成版本发布为验收预览，不视作上述新需求交付完成。

日期：2026-09-05，本地Next.js生产构建，测试订单仅使用本机临时测试签名配置。

- `npm test`：20/20通过，包含题库来源逐项核对、缺失阈值、正反向计分、签名/到期/撤销及Origin检查。
- `npm run typecheck`、`npm run lint`、`npm run build`、`git diff --check`通过。
- `scripts/smoke-premium.mjs`：未授权访问、跨来源、篡改码、兑换Cookie、120题库、错误档案、完整报告和退出通过。仅允许本地主机，需本地服务器与脚本使用相同测试密钥。
- Playwright浏览器：50题完整作答显示五维中立50分；兑换后完成18+120题、价值排序及无经历流程，生成五维和30项细分报告；PDF按钮通过访问检查后调用打印。
- 修改兴趣后从首页重新查看报告，分数从50变67，摘要同步更新；退出套餐后仍显示本机记录删除入口。
- 390px手机布局检查；示例PDF共7页，逐页渲染检查中文、分页与内容。样例为测试答案，不是真实用户画像。
- 最终预览已重新以未配置生产密钥状态启动，确认configured=false、active=false。尚未启用真实收款；此版未推送或部署。

遗留非阻断提示：Next 15提示未来迁移next lint、Browserslist数据更新；Node原生TS测试提示package module类型推断。上线还需联系方式、生产签名密钥、安全的人工订单台账和中文可理解性试测。
