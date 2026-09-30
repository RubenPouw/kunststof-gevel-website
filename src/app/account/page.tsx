import type { Metadata } from "next";

import { AccountPanel } from "@/components/account/account-panel";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountPanel />;
}
