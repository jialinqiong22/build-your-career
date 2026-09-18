import { handleSocial } from "@/lib/social-service";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const GET=(request:Request)=>handleSocial(request);
export const POST=(request:Request)=>handleSocial(request);
