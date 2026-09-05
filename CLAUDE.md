# Project guidance

Current V4 instructions supersede older V2/V3 references: read `docs/V4-SPECIFICATION.md`. `lib/positioning.ts` is the active suite model; `lib/assessment.ts` is legacy only. Core modules remain separate; optional original Enneagram never enters the core report or evidence tier. Never create a weighted aggregate score. Preview route `/preview` must return 404 unless NODE_ENV is development; bind development server to 127.0.0.1. Preserve separate v4 storage and require an explicit option before storing answers. New asynchronous report requests must be invalidated on answer edits/navigation/clear. Deployments must keep secrets server-side and use an isolated Neon branch for preview environments.

V2 replaces the original MBTI / occupation template product. Read `docs/SPECIFICATION.md` and `README.md` first.

V3 uses Next.js server deployment on Vercel, not static export. See `docs/V3-BIGFIVE.md` and `docs/PAID-OPERATIONS.md`. Keep premium bank/report behind server-verified cookies; never trust localStorage payment flags. IPIP-50 is free; the full suite, PDF and human communication package costs CNY199, paid manually through WeChat/Alipay with signed redemption codes. Keep assessment logic in `lib/assessment.ts` and test changes to scoring or storage schemas. Do not add occupation rankings, salary predictions, fabricated percentiles, front-end credentials or third-party transmission. Original exploratory items and adapted Chinese translations are not validated scales. Preserve explicit unknown answers and distinguish preferences from self-reported behavioral evidence.

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. User-facing flows require browser checks. Do not publish merely because a local build passes.
