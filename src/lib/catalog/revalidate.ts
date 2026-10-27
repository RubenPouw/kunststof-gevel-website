import { revalidatePath, revalidateTag } from "next/cache";

import { clearCatalogCache } from "@/lib/catalog";
import type { CatalogTouch } from "@/lib/catalog/sync";

export function revalidateAfterCatalogChange(touch: CatalogTouch) {
  clearCatalogCache();
  revalidateTag("shopify-catalog", { expire: 0 });
  if (touch.all) {
    revalidatePath("/", "layout");
    return;
  }
  revalidatePath("/");
  revalidatePath("/merken");
  revalidatePath("/sitemap.xml");
  revalidatePath("/weergave", "layout");
  for (const category of touch.categories) revalidatePath(`/${category}`);
  for (const brand of touch.brands) revalidatePath(`/merken/${brand}`);
  for (const slug of touch.slugs) {
    revalidatePath(`/producten/${slug}`);
  }
}
