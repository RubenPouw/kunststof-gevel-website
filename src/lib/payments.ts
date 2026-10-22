/**
 * Klarna and Riverty stay off until Ruben confirms the Shopify setup.
 * This shop does not call Stripe. Payment runs through the Shopify checkout URL.
 *
 * Klarna: Shopify Payments (NL) can offer Klarna on that checkout after it is
 * enabled in the Shopify admin. There is no separate Klarna call in this repo.
 * Shopify's help does not publish one fixed NL min/max for every shop. The
 * limit follows the Klarna product on the merchant account. Do not show a
 * number here until that account states it.
 *
 * Riverty (achteraf betalen): not a Shopify Payments toggle and not a Stripe
 * payment method in this integration. The working route is Riverty's own
 * Shopify app, or a later invoice. The Storefront cart in this repo cannot
 * start a Riverty payment. Riverty publishes limits per contract, not one
 * public NL ceiling we can copy. Leave the option hidden.
 */
export function paymentMethodsEnabled(env: NodeJS.ProcessEnv = process.env) {
  return {
    klarna: env.BETALEN_KLARNA_ACTIEF === "true",
    riverty: env.BETALEN_RIVERTY_ACTIEF === "true",
  };
}
