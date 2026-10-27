import { getLayoutBySlug } from "@/lib/kozijnen/layouts";
import { panesFor, sizeInRange, type KozijnConfig } from "@/lib/kozijnen/model";
import { calculatePrice, optionIdsFor, priceBook } from "@/lib/kozijnen/prices";

/** Verkoopbedrag excl. btw, alleen als de prijsvlag aan staat en de samenstelling een prijs heeft. */
export function quoteTotalExcl(config: KozijnConfig, env: NodeJS.ProcessEnv = process.env) {
  if (env.KOZIJNEN_PRIJZEN_ACTIEF !== "true") return undefined;
  const layout = getLayoutBySlug(config.layout);
  if (!layout || !sizeInRange(layout, config.width, config.height)) return undefined;
  const hasSash = panesFor(layout, config).some((pane) => pane.kind !== "vast");
  const result = calculatePrice(
    {
      layout: layout.slug,
      widthMm: config.width,
      heightMm: config.height,
      panes: layout.panes,
      optionIds: optionIdsFor({ ...config, hasSash }),
    },
    priceBook,
    true,
  );
  return result.pricesActive ? result.totalExcl : undefined;
}
