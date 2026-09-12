"use client";

import { useEffect, useRef, useState } from "react";
import { insertRemoteRecordDetalhado, type EnvioRemoto, type ResultRecord } from "@/lib/history";
import { remoteEnabled } from "@/lib/remote-config";

type Estado = { fase: "enviando" } | { fase: "ok"; status?: number } | { fase: "falhou"; motivo: string };

/**
 * Envia o resultado ao registro central e MOSTRA o que aconteceu. Antes a
 * gravação era silenciosa: quando o banco recusava, ninguém ficava sabendo e o
 * resultado simplesmente não aparecia no painel. Com "Tentar de novo".
 */
export default function RegistroCentralStatus({ record }: { record: ResultRecord }) {
  const [estado, setEstado] = useState<Estado>({ fase: "enviando" });
  const enviado = useRef<string | null>(null);

  async function enviar() {
    setEstado({ fase: "enviando" });
    const r: EnvioRemoto = await insertRemoteRecordDetalhado(record);
    setEstado(r.ok ? { fase: "ok", status: r.status } : { fase: "falhou", motivo: r.motivo ?? "falha desconhecida" });
  }

  useEffect(() => {
    if (!remoteEnabled()) return;
    // Um envio por registro (o StrictMode monta duas vezes em desenvolvimento).
    if (enviado.current === record.id) return;
    enviado.current = record.id;
    void enviar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.id]);

  if (!remoteEnabled()) return null;

  if (estado.fase === "enviando") {
    return <p className="text-sm text-slate-500" data-registro="enviando">Gravando no registro central…</p>;
  }
  if (estado.fase === "ok") {
    return (
      <p className="text-sm font-medium text-emerald-700" data-registro="ok">
        ✓ Gravado no registro central{estado.status === 409 ? " (já estava lá)" : ""}. Já aparece no painel de acompanhamento.
      </p>
    );
  }
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900" data-registro="falhou">
      <p>
        <strong>Não foi gravado no registro central:</strong> {estado.motivo}. O resultado está salvo neste
        aparelho; se a gravação continuar falhando, envie o link abaixo ao avaliador.
      </p>
      <button
        type="button"
        onClick={() => void enviar()}
        className="mt-2 rounded-lg border border-rose-600 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
      >
        Tentar de novo
      </button>
    </div>
  );
}
