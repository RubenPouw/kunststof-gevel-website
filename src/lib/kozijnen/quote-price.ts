import type { Layout } from "./layouts";
import { panesFor, sizeInRange, type KozijnConfig } from "./model";
import { calculatePrice, optionIdsFor, priceBook, type PriceResult } from "./prices";

/** Zelfde invoer als de publieke prijs-API. Checkout en de configurator delen deze aanroep. */
export function priceLayoutConfig(layout: Layout, config: KozijnConfig, active: boolean): PriceResult {
  if (!sizeInRange(layout, config.width, config.height)) return { pricesActive: false };
  const hasSash = panesFor(layout, config).some((pane) => pane.kind !== "vast");
  return calculatePrice(
    {
      layout: layout.slug,
      widthMm: config.width,
      heightMm: config.height,
      panes: layout.panes,
      optionIds: optionIdsFor({ ...config, hasSash }),
    },
    priceBook,
    active,
  );
}
