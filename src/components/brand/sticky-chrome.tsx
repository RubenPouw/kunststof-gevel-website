"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

export function StickyChrome({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const write = () => {
      document.documentElement.style.setProperty("--kg-chrome", `${Math.ceil(node.getBoundingClientRect().height)}px`);
    };
    write();
    const observer = new ResizeObserver(write);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="sticky top-0 z-50">
      {children}
    </div>
  );
}
