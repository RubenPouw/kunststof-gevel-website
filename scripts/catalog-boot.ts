import { bootCatalog } from "@/lib/catalog/boot";

const migrateOnly = process.argv.includes("--migrate-only");

bootCatalog({ syncIfEmpty: !migrateOnly })
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("[catalog] boot mislukt, de site valt terug op Shopify of de statische catalogus", error);
    process.exit(0);
  });
