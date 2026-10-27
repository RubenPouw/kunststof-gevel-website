import { statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function withExtension(path) {
  const candidates = [path, `${path}.ts`, `${path}.tsx`, `${path}.js`, `${path}.mjs`, `${path}/index.ts`, `${path}/index.tsx`];
  return candidates.find((candidate) => isFile(candidate)) ?? null;
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    return nextLoad(url, {
      ...context,
      importAttributes: { ...context.importAttributes, type: "json" },
    });
  }
  return nextLoad(url, context);
}

export async function resolve(specifier, context, nextResolve) {
  let absolute = null;
  if (specifier.startsWith("@/")) {
    absolute = fileURLToPath(new URL(`../src/${specifier.slice(2)}`, import.meta.url));
  } else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL) {
    absolute = fileURLToPath(new URL(specifier, context.parentURL));
  }
  if (absolute) {
    const file = withExtension(absolute);
    if (file) return nextResolve(pathToFileURL(file).href, context);
  }
  return nextResolve(specifier, context);
}
