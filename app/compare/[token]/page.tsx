import SocialInvite from "@/components/social/SocialInvite";
export const metadata={title:"邀请对比 · 观己",robots:{index:false,follow:false},referrer:"no-referrer" as const};
export default async function Page({params}:{params:Promise<{token:string}>}){return <SocialInvite token={(await params).token}/>;}
