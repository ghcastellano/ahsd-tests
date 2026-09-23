import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { ICAR_PUBLICO, pontuarIcar } from "./icar-publico";

describe("ICAR público — confronto com fonte e resolução independente", () => {
  // psychTools::iqitems: ordem reason.4,16,17,19; letter.7,33,34,58; matrix.45,46,47,55.
  // https://personality-project.org/r/psych/help/iqitems.html (12/09/2026).
  it("preserva IDs, ordem das opções e chave 1-based publicada", () => {
    expect(ICAR_PUBLICO.map((q) => q.id)).toEqual(["VR.4", "VR.16", "VR.17", "VR.19", "LN.7", "LN.33", "LN.34", "LN.58", "MX.45", "MX.46", "MX.47", "MX.55"]);
    expect(ICAR_PUBLICO.map((q) => q.resposta + 1)).toEqual([4, 4, 4, 6, 6, 3, 4, 4, 5, 2, 2, 4]);
    for (const q of ICAR_PUBLICO) {
      expect(q.opcoes.length).toBe(q.opcoesOriginais.length);
      expect(new Set(q.opcoes).size).toBe(q.opcoes.length);
    }
  });
  it("confere frações, idade, dia da semana e indeterminação por contraexemplos", () => {
    const respostas = ICAR_PUBLICO.map((q) => q.opcoes[q.resposta]);
    expect(respostas[0]).toBe(String(900 / (9 * 4 * 5)));
    expect(respostas[2]).toBe(String(12 * 3 + (23 - 12)));
    const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const solucoes = dias.filter((_, hoje) => (hoje + 2) % 7 === (4 - 2 + 7) % 7);
    expect(solucoes).toEqual([respostas[3]]);
    const relacoes = [160, 170, 180].filter((richard) => richard < 190).map((richard) => Math.sign(richard - 170));
    expect(new Set(relacoes)).toEqual(new Set([-1, 0, 1]));
    expect(respostas[1]).toBe("Não é possível determinar");
  });
  it("reconstrói as séries sob as regras convencionais documentadas", () => {
    const casos = [
      { id: "LN.7", inicio: 11, saltos: [3, 2, 3, 2, 3], prefixo: "KNPSU" },
      { id: "LN.33", inicio: 22, saltos: [-5, -4, -3, -2, -1], prefixo: "VQMJH" },
      { id: "LN.34", inicio: 9, saltos: [1, 2, 3, 4, 5], prefixo: "IJLOS" },
      { id: "LN.58", inicio: 17, saltos: [2, -5, 2, -4, 2], prefixo: "QSNPL" },
    ];
    for (const c of casos) {
      const termos = [c.inicio];
      c.saltos.forEach((d) => termos.push(termos.at(-1)! + d));
      const letras = termos.map((n) => String.fromCharCode(64 + n));
      expect(letras.slice(0, 5).join("")).toBe(c.prefixo);
      const q = ICAR_PUBLICO.find((q) => q.id === c.id)!;
      expect(letras[5]).toBe(q.opcoes[q.resposta]);
    }
  });
  it("preserva as quatro figuras extraídas do suplemento original", () => {
    const hashes: Record<string, string> = {
      "MX.45": "d31727b203f262222f98af2a61bd99b75bd9f45db6e471c46eb22a57b343a6de",
      "MX.46": "5f04a042cd9f1e780881777069e2874c8765333f56466b7475f9dfd49e26be40",
      "MX.47": "e5ec633fe50b62177d73b570e2229905e6fd0448ddd9c1621ce9de5851e19c3e",
      "MX.55": "43375716fb1e396745ffe415aa1e05424b1d140de1ecc0e1ecdd9d50391ea62f",
    };
    for (const q of ICAR_PUBLICO.filter((q) => q.imagem)) {
      const bytes = readFileSync(new URL(`../../public${q.imagem}`, import.meta.url));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(hashes[q.id]);
    }
    expect(ICAR_PUBLICO.filter((q) => q.imagem)).toHaveLength(4);
  });
  it("separa respostas em branco de erros e não inventa percentis", () => {
    expect(pontuarIcar({})).toEqual({ acertos: 0, respondidos: 0, total: 12 });
    expect(pontuarIcar({ "VR.4": 3, "VR.16": 0, "VR.17": 99 })).toEqual({ acertos: 1, respondidos: 2, total: 12 });
    expect(pontuarIcar(Object.fromEntries(ICAR_PUBLICO.map((q) => [q.id, q.resposta])))).toEqual({ acertos: 12, respondidos: 12, total: 12 });
  });
});
