import { QuoteForm } from "@/components/quote-form";
import { montageQuoteNote, type MontageQuoteDraft } from "@/lib/montage-quote";

export function MontageQuoteCard({
  idPrefix,
  heading = "Ook laten monteren?",
  headingLevel = "h2",
  draft = null,
  ready = true,
}: {
  idPrefix: string;
  heading?: string;
  headingLevel?: "h1" | "h2";
  draft?: MontageQuoteDraft | null;
  ready?: boolean;
}) {
  const Heading = headingLevel;
  return (
    <section aria-labelledby={`${idPrefix}-titel`} className="kg-soft-card overflow-hidden">
      <div className="h-1 bg-kg-signal" aria-hidden />
      <div className="p-6 sm:p-8">
        <Heading
          id={`${idPrefix}-titel`}
          className="text-[22px] leading-snug font-medium tracking-[-0.03em] sm:text-[26px]"
        >
          {heading}
        </Heading>
        <p className="mt-3 max-w-xl text-[16px] leading-normal text-kg-text-2">
          Onze vakmensen (Cavemen) monteren je gevelbekleding vakkundig. Vraag vrijblijvend een offerte aan.
        </p>
        <div className="mt-8">
          {ready ? (
            <QuoteForm
              idPrefix={idPrefix}
              defaultMontage
              plain
              montageExtras
              initialArea={draft?.areaM2 ?? ""}
              initialMessage={draft?.message ?? ""}
              initialParts={draft?.parts ?? []}
              indicativeNote={draft && draft.montageIncl > 0 ? montageQuoteNote(draft) : undefined}
            />
          ) : (
            <p className="text-[14px] text-kg-text-2">Formulier laden.</p>
          )}
        </div>
      </div>
    </section>
  );
}
