import type { Metadata } from "next";
import BatteryQuiz from "@/components/BatteryQuiz";
import { ravenTest } from "@/lib/battery/exames-autorais";

export const metadata: Metadata = {
  title: ravenTest.name,
  description: ravenTest.intro,
};

export default function RavenPage() {
  return <BatteryQuiz id="raven" />;
}
