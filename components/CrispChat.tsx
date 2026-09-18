"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

const SCRIPT_ID = "crisp-chat-loader";
const PRIVATE_PATH_PREFIXES = ["/compare/", "/feedback/"];

export function shouldLoadCrisp(pathname: string) {
  return !PRIVATE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function CrispChat() {
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID?.trim();
    if (!websiteId || !shouldLoadCrisp(window.location.pathname)) return;

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
