import { deleteAccount } from "@/lib/auth-email";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (request: Request) => deleteAccount(request);
