import type { Metadata } from "next";
import { Suspense } from "react";
import Portao from "@/components/Portao";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <Portao />
    </Suspense>
  );
}
