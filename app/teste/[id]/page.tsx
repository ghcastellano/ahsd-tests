import { notFound } from "next/navigation";
import { getInstrument, instruments } from "@/lib/instruments";
import QuizRunner from "@/components/QuizRunner";

export function generateStaticParams() {
  return instruments.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inst = getInstrument(id);
  return {
    title: inst ? `${inst.acronym} — ${inst.name}` : "Teste",
  };
}

export default async function TestePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inst = getInstrument(id);
  if (!inst) notFound();
  return <QuizRunner id={id} />;
}
