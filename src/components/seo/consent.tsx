"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const STORAGE_KEY = "kg-consent";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-N3DQ6G5";

type Choice = "granted" | "denied";

export function ConsentAndGtm() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "granted" || stored === "denied") setChoice(stored);
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function choose(next: Choice) {
    window.localStorage.setItem(STORAGE_KEY, next);
    setChoice(next);
  }

  return (
    <>
      {choice === "granted" ? (
        <>
          <Script id="gtm-loader" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}
      {ready && choice === null ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-kg-navy bg-white p-4 sm:p-5">
          <div className="container-kg flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-2xl text-[15px] leading-[1.5]">
              Statistiek laden we via Google Tag Manager ({GTM_ID}), alleen nadat u toestemt. De site werkt ook zonder.
            </p>
            <div className="flex gap-2">
              <button type="button" className="h-11 border border-kg-navy px-4 text-[14px] font-medium" onClick={() => choose("denied")}>
                Weigeren
              </button>
              <button type="button" className="h-11 bg-kg-navy px-4 text-[14px] font-medium text-white" onClick={() => choose("granted")}>
                Accepteren
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
