import { issueVerificationCode } from "@/lib/auth-email";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (request: Request) => issueVerificationCode(request);
