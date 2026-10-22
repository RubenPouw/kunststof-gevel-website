import { CheckoutForm } from "@/app/afrekenen/checkout-form";
import { paymentMethodsEnabled } from "@/lib/payments";

export default function CheckoutPage() {
  const methods = paymentMethodsEnabled();
  return <CheckoutForm klarna={methods.klarna} riverty={methods.riverty} />;
}
