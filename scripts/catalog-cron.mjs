const url = process.env.CATALOG_SYNC_URL;
const secret = process.env.SYNC_SECRET;

if (!url || !secret) {
  console.error("CATALOG_SYNC_URL en SYNC_SECRET zijn allebei nodig");
  process.exit(1);
}

const response = await fetch(url, {
  method: "POST",
  headers: { authorization: `Bearer ${secret}` },
});
const text = await response.text();
console.log(response.status, text);
if (!response.ok) process.exit(1);
