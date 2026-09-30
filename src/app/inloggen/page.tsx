import type { Metadata } from "next";

import { LoginForm } from "@/components/account/login-form";

export const metadata: Metadata = {
  title: "Inloggen",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
