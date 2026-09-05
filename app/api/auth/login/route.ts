import { credentials } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (request: Request) => credentials(request, "login");
