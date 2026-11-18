import type { Metadata } from "next";
import BatteryQuiz from "@/components/BatteryQuiz";
import { g38Test } from "@/lib/battery/exames-autorais";

export const metadata: Metadata = {
  title: g38Test.name,
  description: g38Test.intro,
};

export default function G38Page() {
  return <BatteryQuiz id="g38" />;
}
