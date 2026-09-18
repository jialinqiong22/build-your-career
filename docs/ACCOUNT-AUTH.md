# 观己账号系统

## 已实现范围

注册：用户名 + 邮箱 + 密码，并明确同意隐私政策与用户协议。注册成功自动登录，注册和登录成功均返回首页。用户名用于展示；登录只使用注册邮箱。首页展示用户名并提供退出登录。微信、手机号和短信登录均不开放。

这是按产品指定表结构新增的账号系统，不是 Neon Managed Auth / Better Auth，也不与其他项目共享用户表。现有套餐兑换系统保持独立，登录不等于付费，测评数据仍按原有本机保存机制处理，不自动上传到账号。

## 数据库

Neon 项目：**观己 build your career**，ID `blue-fog-26908608`，AWS 新加坡区。

- `production`：`br-hidden-bonus-b3xqhxcu`，已迁移并接入 Vercel Production。
- `dev-auth`：`br-misty-lab-b37hlis8`，本机开发连接的分支，已应用 Drizzle 迁移。
- 数据库 `career`，账号表为 `users`、`user_sessions`、`auth_rate_limits`；另有云端进度 `assessment_progress` 与暂未启用的邀请数据表 `social_invites`。

`users` 包括自增整型主键 `id`、大小写不敏感唯一 `username`、仅 bcrypt 哈希的 `password`、`created_at` 和唯一的 `email`。历史数据库结构仍保留不可通过当前接口使用的 `phone` 列，以避免破坏性迁移；新注册只写入规范化小写邮箱，服务端拒绝任何手机号形式的注册或登录。

## 安全边界

- bcrypt 成本 12、每次随机盐；密码至少 12 字符，最大 72 UTF-8 字节，不截断、不去空格、不做 Unicode 归一化。
- 32 字节随机会话令牌；数据库只存带服务端密钥的 HMAC 摘要。七天有效，注册/登录时轮换当前令牌，退出立即撤销当前会话。
- Cookie 为 HttpOnly、SameSite=Lax、Path=/；生产增加 Secure 与 `__Host-` 前缀。API 不缓存，不向前端返回密码哈希或联系方式。
- 注册与创建会话在同一数据库事务中；并发重复由唯一索引保证。参数化查询、4KB 请求上限、同源 POST 检查。
- 数据库限流跨实例共享：每邮箱注册 5 次/15 分钟，登录 10 次/15 分钟；每来源注册 20 次、登录 60 次/15 分钟。超过限制返回 429 和 Retry-After。
- 仅 Vercel 环境信任平台的 `x-vercel-forwarded-for`；非 Vercel 使用保守的共享来源桶，部署到其他平台前须针对可信代理适配，不能直接相信用户可伪造的 X-Forwarded-For。
- 不记录请求密码、账号原值、连接串、会话令牌或详细数据库错误。

**当前没有邮箱验证、验证码登录、找回密码、邮箱更换或自助账号注销。** 不对邮箱所有权作保证。隐私政策与用户协议已上线，注册前必须明确同意；数据与账号删除请求目前通过 Crisp 客服人工处理。未验证账号不可用于后续自动认领他人的订单或报告。

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

资料：[Neon + Drizzle](https://neon.com/docs/guides/drizzle)、[连接方式](https://neon.com/docs/connect/choose-connection)、[bcrypt 官方说明](https://github.com/kelektiv/node.bcrypt.js)。
