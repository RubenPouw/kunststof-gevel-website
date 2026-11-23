"use client";

import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Zichtbaar zolang het formulier buiten beeld is. Rechts blijft vrij voor de chat. */
export function ProjectQuoteDock({ sent }: { sent: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sent) return;
    const node = document.getElementById("offerte");
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setShow(!entry?.isIntersecting), { threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [sent]);

  if (sent || !show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-kg-lijn bg-white p-3 lg:hidden">
      <a href="#offerte" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full lg:w-auto")}>
        Vraag een offerte aan
      </a>
    </div>
  );
}
