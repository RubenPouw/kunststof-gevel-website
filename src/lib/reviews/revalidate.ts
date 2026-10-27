import { revalidatePath } from "next/cache";

export function revalidateReviewPages() {
  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/producten/[slug]", "page");
}