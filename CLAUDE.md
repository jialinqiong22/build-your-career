# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**职场导航仪 (Career GPS AI)** - An AI-powered career positioning system that uses a three-dimensional cross-analysis of MBTI, Holland Code (RIASEC), and Enneagram to provide precise career guidance and risk warnings.

**Target Audience:** College students, master's students, and newcomers within 2 years of graduation.

**Core Value:** Reject vague personality descriptions; provide sharp, actionable career insights through AI analysis.

## Development Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Tech Stack
- **Framework:** Next.js 15 with App Router (TypeScript)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (recommended)
- **AI Provider:** DeepSeek-V3 or Zhipu GLM-4 (TBD)

### Directory Structure

```
app/
├── layout.tsx           # Root layout with metadata
├── page.tsx             # Landing/input page
├── report/page.tsx      # Report display page
├── api/
│   └── generate/route.ts # AI generation endpoint
components/
├── InputForm.tsx        # MBTI/Holland/Enneagram input form
├── Loading.tsx          # Loading animation with dynamic messages
└── ReportCard.tsx       # Report display components
lib/
├── ai.ts               # AI prompt templates and API client
└── types.ts            # TypeScript type definitions
```

## User Flow

1. **Landing Page** (`app/page.tsx`)
   - Show official links to MBTI, Holland, and Enneagram tests
   - "Skip to input" option for users who already know their results

2. **Input Form** (`components/InputForm.tsx`)
   - MBTI: Dropdown (16 types)
   - Holland Code: 3-letter input (e.g., "RIA")
   - Enneagram: Main type + wing (e.g., "7w8")
   - Target Industry: Text/tags (e.g., "互联网", "金融")
   - Blacklist: Text constraints (e.g., "不接受加班")

3. **AI Generation** (`app/api/generate/route.ts`)
   - Receives form data via POST
   - Calls AI API with structured prompt (see `lib/ai.ts`)
   - Returns parsed Markdown response

4. **Report Page** (`app/report/page.tsx`)
   - Displays AI-generated analysis
   - Sections: 人设标签, 天赋显影, 职场雷达, 避坑指南, 岗位匹配, 专家寄语
   - Export-to-image functionality (html2canvas)

## Dynamic Theming

The app changes theme based on MBTI type:

- **NT/ST (Rational types):** Deep tech blue, geek black
- **NF/SF (Idealist/Feeling types):** Warm off-white, forest green, soft pink

Implement this with a theme context that reads the MBTI selection and updates Tailwind classes dynamically.

## AI Prompt Template

Located in `lib/ai.ts` - the prompt follows the structure specified in `requirement.md` and expects:
- Input: MBTI, Holland Code, Enneagram, Industry, Blacklist
- Output: Structured Markdown with 6 sections (人设标签, 天赋显影, 职场雷达, 避坑指南, 岗位匹配, 专家寄语)

## Future Roadmap

Planned features requiring architectural considerations:
- User authentication (likely Supabase Auth or Clerk)
- Payment/subscription system
- Data persistence (PostgreSQL + Prisma)
- Rate limiting (prevent API abuse)

The current Next.js setup supports easy integration of these features via API Routes and middleware.

## Important Notes

- **API Security:** Never expose API keys on the client. Use environment variables (`process.env.DEEPSEEK_API_KEY`) and Route Handlers.
- **Rate Limiting:** Implement per-IP limits in the API route (suggested: 3 requests/day) to control costs.
- **SEO:** Report pages should be shareable. Consider using dynamic routes with sharing tokens.
