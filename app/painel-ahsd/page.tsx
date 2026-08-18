import type { Metadata } from "next";
import AdminPanel from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "Painel de acompanhamento",
  robots: { index: false, follow: false },
};

export default function PainelPage() {
  return <AdminPanel />;
}
