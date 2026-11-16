"use client";

import type { ResultRecord } from "@/lib/history";
import RegistroCentralStatus from "./RegistroCentralStatus";

/**
 * Dispara a gravação silenciosa no banco central sem exibir bloco de envio/compartilhamento na tela.
 */
export default function ShareBlock({ record }: { record: ResultRecord }) {
  return <RegistroCentralStatus record={record} />;
}
