import type { Metadata } from "next";
import BatteryQuiz from "@/components/BatteryQuiz";
import { g36Test } from "@/lib/battery/exames-autorais";

export const metadata: Metadata = {
  title: g36Test.name,
  description: g36Test.intro,
};

export default function G36Page() {
  return <BatteryQuiz id="g36" />;
}
