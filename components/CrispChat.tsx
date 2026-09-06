"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

const SCRIPT_ID = "crisp-chat-loader";

export default function CrispChat() {
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID?.trim();
    if (!websiteId) return;

    window.$crisp ??= [];
    window.CRISP_WEBSITE_ID = websiteId;

    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
