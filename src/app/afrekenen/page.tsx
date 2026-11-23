import { CheckoutForm } from "@/app/afrekenen/checkout-form";
import { ReviewBar } from "@/components/reviews/review-bar";
import { paymentMethodsEnabled } from "@/lib/payments";

export default function CheckoutPage() {
  const methods = paymentMethodsEnabled();
  return (
    <>
      <ReviewBar />
      <CheckoutForm klarna={methods.klarna} riverty={methods.riverty} />
    </>
  );
}
