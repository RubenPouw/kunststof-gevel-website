import { GlobalWindow } from "happy-dom";

const dom = new GlobalWindow({ url: "http://localhost/" });

function setGlobal(name: string, value: unknown) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}

const names = [
  "HTMLElement",
  "Element",
  "Node",
  "DocumentFragment",
  "SVGElement",
  "MutationObserver",
  "ResizeObserver",
  "IntersectionObserver",
  "KeyboardEvent",
  "MouseEvent",
  "PointerEvent",
  "FocusEvent",
  "Event",
  "CustomEvent",
  "DOMRect",
  "Range",
  "NodeFilter",
  "HTMLButtonElement",
  "HTMLAnchorElement",
  "HTMLDivElement",
];

setGlobal("window", dom);
setGlobal("document", dom.document);
setGlobal("navigator", dom.navigator);
setGlobal("self", dom);
setGlobal("IS_REACT_ACT_ENVIRONMENT", true);
setGlobal("getComputedStyle", dom.getComputedStyle.bind(dom));
setGlobal("requestAnimationFrame", dom.requestAnimationFrame.bind(dom));
setGlobal("cancelAnimationFrame", dom.cancelAnimationFrame.bind(dom));

for (const name of names) {
  const value = (dom as unknown as Record<string, unknown>)[name];
  if (value) setGlobal(name, value);
}
