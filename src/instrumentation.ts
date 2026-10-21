export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { bootCatalog } = await import("@/lib/catalog/boot");
  void bootCatalog({ syncIfEmpty: true }).catch((error) => {
    console.error("[catalog] achtergrondsync mislukt", error);
  });
}
