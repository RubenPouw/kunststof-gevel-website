import { bootCatalog } from "@/lib/catalog/boot";
import { endSql } from "@/lib/db/client";

const migrateOnly = process.argv.includes("--migrate-only");

const watchdog = setTimeout(() => {
  console.error("[catalog] boot timeout, de build gaat door");
  process.exit(0);
}, 12 * 60 * 1000);

bootCatalog({ syncIfEmpty: !migrateOnly })
  .catch((error) => {
    console.error("[catalog] boot mislukt, de site valt terug op Shopify of de statische catalogus", error);
  })
  .finally(async () => {
    clearTimeout(watchdog);
    await endSql();
    process.exit(0);
  });
