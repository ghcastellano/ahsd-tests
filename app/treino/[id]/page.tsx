import { notFound } from "next/navigation";
import { getTest, tests } from "@/lib/battery";
import BatteryQuiz from "@/components/BatteryQuiz";

export function generateStaticParams() {
  return tests.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = getTest(id);
  return { title: test ? `Treino — ${test.name}` : "Treino" };
}

export default async function TreinoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getTest(id)) notFound();
  return <BatteryQuiz id={id} />;
}
