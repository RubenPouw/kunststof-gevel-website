import { ReviewScoreStrip } from "@/components/reviews/score-strip";
import { getWebwinkelkeurScore } from "@/lib/reviews/read";

/** Full-width variant C bar. Google totals come from GOOGLE_REVIEW_STAT. */
export async function ReviewBar() {
  const webwinkelkeur = await getWebwinkelkeurScore();
  return <ReviewScoreStrip webwinkelkeur={webwinkelkeur} />;
}
