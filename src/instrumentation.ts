export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const { bootCatalog } = await import("@/lib/catalog/boot");
  void bootCatalog({ syncIfEmpty: true }).catch((error) => {
    console.error("[catalog] achtergrondsync mislukt", error);
  });
}
