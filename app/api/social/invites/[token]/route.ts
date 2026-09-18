import { handleSocial } from "@/lib/social-service";
export const runtime="nodejs";
export const dynamic="force-dynamic";
type Context={params:Promise<{token:string}>};
export const GET=async(request:Request,context:Context)=>handleSocial(request,(await context.params).token);
export const POST=GET;
