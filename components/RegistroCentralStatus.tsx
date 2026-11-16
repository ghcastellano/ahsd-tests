"use client";

import { useEffect, useRef } from "react";
import { insertRemoteRecordDetalhado, type ResultRecord } from "@/lib/history";
import { remoteEnabled } from "@/lib/remote-config";

/**
 * Envia o resultado ao registro central de forma silenciosa (sem exibir status na tela).
 */
export default function RegistroCentralStatus({ record }: { record: ResultRecord }) {
  const enviado = useRef<string | null>(null);

  useEffect(() => {
    if (!remoteEnabled()) return;
    // Um envio por registro (o StrictMode monta duas vezes em desenvolvimento).
    if (enviado.current === record.id) return;
    enviado.current = record.id;
    void insertRemoteRecordDetalhado(record);
  }, [record]);

  return null;
}
