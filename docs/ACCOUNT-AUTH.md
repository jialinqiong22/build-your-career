# 观己账号系统

## 已实现范围

注册：用户名 + 邮箱 + 邮箱验证码 + 密码，并明确同意隐私政策与用户协议。注册分两步：先提交邮箱并通过 Turnstile 人机验证获取 6 位验证码，再连同用户名与密码一并提交；验证码在服务端确认后才创建账号，因此所有账号的邮箱所有权在注册时即已验证。注册成功自动登录，注册和登录成功均返回首页。用户名用于展示；登录只使用注册邮箱。首页展示用户名并提供退出登录。微信、手机号和短信登录均不开放。

忘记密码：登录页「忘记密码」进入 `/forgot-password`，同一套邮箱验证码（用途 `password_reset`）+ 新密码两步完成；重置成功后该账号的全部会话立即失效，所有设备需用新密码重新登录。

自助注销：`/my-assessments` 的「账号与数据」区块，输入登录密码二次确认后硬删除账号。删除即级联清除全部会话、云端测评记录（`assessment_progress`）和社交邀请（`social_invites`），Cookie 同步清除且不可恢复；本机 localStorage 保存的答案不受影响。不再需要通过 Crisp 人工处理注销请求。

这是按产品指定表结构新增的账号系统，不是 Neon Managed Auth / Better Auth，也不与其他项目共享用户表。现有套餐兑换系统保持独立，登录不等于付费，测评数据仍按原有本机保存机制处理，不自动上传到账号。

## 数据库

Neon 项目：**观己 build your career**，ID `blue-fog-26908608`，AWS 新加坡区。

- `production`：`br-hidden-bonus-b3xqhxcu`，已迁移并接入 Vercel Production。
- `dev-auth`：`br-misty-lab-b37hlis8`，本机开发连接的分支，已应用 Drizzle 迁移。
- 数据库 `career`，账号表为 `users`、`user_sessions`、`auth_rate_limits`、`email_verification_codes`；另有云端进度 `assessment_progress` 与暂未启用的邀请数据表 `social_invites`。

`users` 包括自增整型主键 `id`、大小写不敏感唯一 `username`、仅 bcrypt 哈希的 `password`、`created_at` 和唯一的 `email`。历史数据库结构仍保留不可通过当前接口使用的 `phone` 列，以避免破坏性迁移；新注册只写入规范化小写邮箱，服务端拒绝任何手机号形式的注册或登录。

`email_verification_codes` 以 `(email, purpose)` 为主键，`purpose` 限定 `register` 与 `password_reset`；验证码只以带服务端密钥的 HMAC 摘要（`code:<purpose>:<email>:<code>`）存储，明码不落库。每码 10 分钟有效，验证错误 5 次即作废，同邮箱同用途 60 秒内不可重发；注册在事务内以 `DELETE ... RETURNING` 原子消费验证码，防止并发重用。

## 安全边界

- bcrypt 成本 12、每次随机盐；密码至少 12 字符，最大 72 UTF-8 字节，不截断、不去空格、不做 Unicode 归一化。
- 32 字节随机会话令牌；数据库只存带服务端密钥的 HMAC 摘要。七天有效，注册/登录时轮换当前令牌，退出立即撤销当前会话。
- Cookie 为 HttpOnly、SameSite=Lax、Path=/；生产增加 Secure 与 `__Host-` 前缀。API 不缓存，不向前端返回密码哈希或联系方式。
- 注册与创建会话在同一数据库事务中；并发重复由唯一索引保证。参数化查询、4KB 请求上限、同源 POST 检查。
- 邮箱验证码：发码需通过 Turnstile（action `code`）与同源检查；按来源 20 次/15 分钟、按邮箱 3 次/15 分钟限流。`password_reset` 发码对不存在的邮箱返回相同响应，不泄露注册状态。重置密码与注销均按来源与身份双重限流。
- 注册人机验证前移到发码步骤；注册接口本身凭已验证的邮箱验证码确权，不再重复校验 Turnstile。
- 数据库限流跨实例共享：每邮箱注册 5 次/15 分钟，登录 10 次/15 分钟；每来源注册 20 次、登录 60 次/15 分钟；重置密码每来源 10 次、每邮箱 5 次/15 分钟；注销每来源 5 次、每账号 3 次/15 分钟。超过限制返回 429 和 Retry-After。
- 仅 Vercel 环境信任平台的 `x-vercel-forwarded-for`；非 Vercel 使用保守的共享来源桶，部署到其他平台前须针对可信代理适配，不能直接相信用户可伪造的 X-Forwarded-For。
- 不记录请求密码、账号原值、连接串、会话令牌或详细数据库错误。

**当前没有验证码登录（验证码仅用于注册与重置密码）、没有邮箱更换。** 隐私政策与用户协议已上线，注册前必须明确同意。自助注销覆盖账号及其级联数据；已发放的套餐兑换码不随注销自动核销，其订单状态仍在人工收款记录中，注销前已购权益无法转移。未验证邮箱的历史账号（验证码上线前注册）与新生效的安全机制之间的关系：登录不受影响，忘记密码依赖邮箱可达性。

## 配置与运维

本机凭据仅位于已被 Git 忽略的 `.env.development.local`。为避免误用其他应用的全局 `DATABASE_URL`，本项目使用专用名称：

```env
CAREER_DATABASE_URL=<Neon pooled URL>
CAREER_DATABASE_URL_UNPOOLED=<Neon direct URL>
AUTH_SECRET=<至少32字节的随机服务端密钥>
AUTH_ENABLED=true
```

不要将这些值放入 NEXT_PUBLIC_、Git、聊天、截图或命令日志。Vercel Preview连接 `dev-auth`；Production连接独立的 `production` 分支，并已在完成迁移后设置 `AUTH_ENABLED=true`。两套环境不共享会话密钥。

Drizzle 默认读取 `.env.development.local`，并保留显式进程变量的优先级。切换目标必须显式设置 `AUTH_ENV_FILE`；上线前确认目标分支和非 pooled 的迁移连接。不要直接在未核实的生产库执行迁移。

```sh
npm run db:generate
npm run db:migrate
npm run auth:cleanup
```

清理脚本每次最多移除 1000 条已过期会话和 1000 条已过期限流条目，不删除账号或有效会话。上线后需由运维每日运行（本次未创建定时任务）；如果积压可重复执行。轮换 AUTH_SECRET 会撤销全部现有账号会话，不影响套餐兑换密钥。

## 验收（2026-09-06）

- 43 项单元测试通过，其中新增 7 项覆盖身份规范化、密码长度、bcrypt、会话与请求体边界。
- 真实 Neon 开发库集成测试通过：25 个 HTTP 状态断言，另验证自动登录、哈希存储、唯一约束、会话轮换/退出/过期、限流及过期重置、付费权限分离。
- 浏览器实测邮箱注册、自动返回首页、错误密码、登录返回首页、退出登录；390px 手机端和桌面注册页面检查。
- TypeScript、ESLint、生产构建和迁移再生成检查通过；生产运行模式也通过同一套真实 Neon 集成测试。本机浏览器验收账号与集成测试生成的账号已删除。
- `npm audit --omit=dev` 无漏洞。完整审计仍有 4 个 moderate 条目，来自 Drizzle Kit 的旧 esbuild 开发工具依赖链；不使用其开发服务器，不为消除提示强制降级 Drizzle。公开部署前继续跟进上游修复。

## 验收（2026-09-18，邮箱验证码 / 重置密码 / 自助注销）

- 63 项单元测试通过（新增验证码生成、格式、用途、命名空间 HMAC 与时限常量 5 项）。
- 真实 Neon 开发库集成测试（`AUTH_SMOKE_ALLOW=true node scripts/smoke-auth.mjs`）通过：28 个 HTTP 状态断言，覆盖同源拒绝、验证码格式/错误尝试计数、注册原子消费码（含重用拒绝）、重复邮箱与用户名 409、重置密码后全会话失效与新旧密码校验、注销的密码确认/错误密码 403/重复注销 401 及用户行级联清除；验证码由脚本直接种入开发库（人机验证无法在无头环境通过）。
- 浏览器实测：注册两步表单渲染与返回改邮箱往返、忘记密码两步表单、登录页忘记密码入口；以真实会话完成自助注销 E2E（账号删除、跳转首页、导航恢复登录态）；390px 无横向溢出。
- 发码真实投递依赖 Resend 与 Turnstile 域名白名单，需在配置完成的环境（Vercel 或本地白名单含 127.0.0.1）人工验收一次收码。
- TypeScript、ESLint、生产构建通过。验收所用合成账号与验证码行已删除；`assessment_progress` 迁移已补齐到 dev-auth 分支。

资料：[Neon + Drizzle](https://neon.com/docs/guides/drizzle)、[连接方式](https://neon.com/docs/connect/choose-connection)、[bcrypt 官方说明](https://github.com/kelektiv/node.bcrypt.js)。

## 上线配置清单（验证码 / 重置密码 / 注销功能启用）

代码合入后，需按顺序在目标环境完成以下配置：

1. **数据库迁移**：对 Neon `production` 分支执行新迁移 `drizzle/0001_familiar_rhino.sql`（仅新建 `email_verification_codes` 表，不改现有表）。可用 `AUTH_ENV_FILE=<指向生产迁移连接的 env 文件> npm run db:migrate`，或在 Neon SQL Editor 中执行该文件内容。
2. **Resend 发信域名**：在 Resend 后台完成发信域名的 DNS 验证（SPF/DKIM），确认 `RESEND_FROM_EMAIL` 使用该域名下的地址。验证完成后，从 Vercel 环境变量中**删除 `RESEND_TEST_TO_EMAIL`**（该变量会把所有验证码和欢迎邮件改投到测试邮箱），确认 `SUPPORT_EMAIL` 与 `NEXT_PUBLIC_APP_URL` 正确。
3. **Turnstile 域名白名单**：确认 Cloudflare Turnstile 小组件的域名白名单包含最终访问域名（自定义域名上线时同步更新）。本地联调需在白名单中加入 `127.0.0.1`。
4. **Vercel 重新部署**：环境变量变更后重新部署 Production 使其生效。
5. **人工验收**：在生产环境真实走一次注册收码、忘记密码收码、注销；确认欢迎邮件与验证码邮件均投递到真实用户邮箱而非测试邮箱。
6. **定时清理**：`auth:cleanup` 已同时清理过期会话、限流条目与过期验证码，按原计划每日运行即可。
