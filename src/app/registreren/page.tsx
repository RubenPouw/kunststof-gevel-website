import type { Metadata } from "next";

import { RegisterForm } from "@/components/account/register-form";

export const metadata: Metadata = {
  title: "Registreren",
  description: "Maak een account aan in uw browser voor offertes en kleurstalen.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
