# Project guidance

V2 replaces the original MBTI / occupation template product. Read `docs/SPECIFICATION.md` and `README.md` first.

Use Next.js static export for Cloudflare Pages. Keep assessment logic in `lib/assessment.ts` and test changes to scoring or storage schemas. Do not add occupation rankings, salary predictions, fabricated percentiles, front-end credentials or third-party transmission. Original exploratory items are not validated scales. Preserve explicit unknown answers and distinguish preferences from self-reported behavioral evidence.

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. User-facing flows require browser checks. Do not publish merely because a local build passes.
