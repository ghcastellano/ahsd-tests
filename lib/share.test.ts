import { describe, it, expect } from "vitest";
import { checksum, codeFromHash, decodeRecord, encodeRecord, extractCode, shareLink } from "./share";
import type { ResultRecord } from "./history";
import { getInstrument } from "./instruments";

const full: ResultRecord = {
  id: "abc-123",
  createdAt: "2026-08-19T12:00:00.000Z",
  instrumentId: "gad-7",
  acronym: "GAD-7",
  instrumentName: "Transtorno de Ansiedade Generalizada — 7 itens",
  respondent: "Maria José",
  totalScore: 14,
  maxScore: 21,
  bandLabel: "Moderado",
  severity: "moderate",
  positive: true,
  metricIsMean: false,
  subscales: [{ name: "Parte A", raw: 4, max: 6 }, { name: "Média", raw: 10, max: 21, mean: 3.5 }],
};

const minimal: ResultRecord = {
  id: "x",
  createdAt: "2026-08-19T12:00:00.000Z",
  instrumentId: "ace",
  acronym: "ACE",
  instrumentName: "Experiências Adversas na Infância",
  totalScore: 3,
  maxScore: 10,
  bandLabel: "Exposição intermediária",
  severity: "moderate",
};

/** Codifica um objeto arbitrário no formato v1 (JSON em base64url). */
function v1(obj: unknown): string {
  const json = JSON.stringify(obj);
  const bin = String.fromCharCode(...new TextEncoder().encode(json));
  return "v1." + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

describe("share codec (v2)", () => {
  it("round-trips a full record", () => {
    expect(decodeRecord(encodeRecord(full))).toEqual(full);
  });

  it("round-trips a minimal record (no optional fields)", () => {
    expect(decodeRecord(encodeRecord(minimal))).toEqual(minimal);
  });

  it("distinguishes ausência de média de média igual ao bruto", () => {
    const rec: ResultRecord = {
      ...minimal,
      subscales: [
        { name: "Sem média", raw: 4, max: 6 },
        { name: "Média igual", raw: 4, max: 6, mean: 4 },
        { name: "Média própria", raw: 12, max: 20, mean: 2.4 },
      ],
    };
    const d = decodeRecord(encodeRecord(rec))!;
    expect(d.subscales![0].mean).toBeUndefined();
    expect(d.subscales![1].mean).toBe(4);
    expect(d.subscales![2].mean).toBe(2.4);
  });

  it("preserva positive/metricIsMean falsos (diferente de ausentes)", () => {
    const falso: ResultRecord = { ...minimal, positive: false, metricIsMean: false };
    expect(decodeRecord(encodeRecord(falso))).toEqual(falso);
    expect(decodeRecord(encodeRecord(minimal))).not.toHaveProperty("positive");
    expect(decodeRecord(encodeRecord(minimal))).not.toHaveProperty("metricIsMean");
  });

  it("recupera nomes de subescala pelo índice do instrumento", () => {
    // Os nomes reais do instrumento não trafegam no código: viram índices.
    const rec: ResultRecord = {
      ...minimal,
      instrumentId: "ahsd-indicadores",
      acronym: "AH/SD",
      instrumentName: "x",
      subscales: [{ name: "Criatividade / pensamento produtivo", raw: 4.5, max: 5, mean: 4.5 }],
    };
    const code = encodeRecord(rec);
    expect(atob(code.slice(3).replace(/-/g, "+").replace(/_/g, "/"))).not.toContain("Criatividade");
    expect(decodeRecord(code)!.subscales![0].name).toBe("Criatividade / pensamento produtivo");
  });

  it("gera links curtos (bem menores que o formato v1)", () => {
    const origin = "https://ahsdtests.vercel.app";
    const linkV2 = shareLink(origin, full);
    // O formato antigo (JSON em base64) passava de 450 caracteres.
    expect(linkV2.length).toBeLessThan(220);
    expect(shareLink(origin, minimal).length).toBeLessThan(130);
    expect(linkV2.length).toBeLessThan(v1(full).length);
  });

  it("produces URL-safe codes and working links/hashes", () => {
    const code = encodeRecord(full);
    expect(code).toMatch(/^v2\.[A-Za-z0-9_-]+$/);
    const link = shareLink("https://ahsdtests.vercel.app", full);
    expect(new URL(link).pathname).toBe("/resultado");
    expect(decodeRecord(codeFromHash(new URL(link).hash)!)).toEqual(full);
  });

  it("preserva os separadores quando eles aparecem no texto", () => {
    const rec: ResultRecord = {
      ...minimal,
      instrumentId: "desconhecido|estranho",
      acronym: "A|B",
      instrumentName: "Nome com | ; , e \\ contrabarra",
      respondent: "Ana | Paula; Costa, Jr.",
      bandLabel: "Faixa | dupla; com, vírgula",
      subscales: [{ name: "Sub | escala; com, vírgula", raw: 1, max: 2 }],
    };
    expect(decodeRecord(encodeRecord(rec))).toEqual(rec);
  });

  it("preserva contrabarra seguida de letra de escape (\\p, \\s, \\c)", () => {
    // "Ana \\pedro" escapa para "Ana \\\\pedro"; desfazer o escape com dois
    // replace encadeados devolveria "Ana \\|edro".
    for (const texto of ["Ana \\pedro", "x\\s y", "a\\cb", "\\\\", "\\"]) {
      const rec: ResultRecord = { ...minimal, respondent: texto };
      expect(decodeRecord(encodeRecord(rec))?.respondent).toBe(texto);
    }
  });

  it("rejeita link cortado em vez de mostrar dados incompletos", () => {
    // Sem checksum, cortar o fim removeria só campos opcionais e o resultado
    // abriria com o nome do respondente truncado, parecendo completo.
    const code = encodeRecord(full);
    for (let corte = 1; corte <= 30; corte++) {
      expect(decodeRecord(code.slice(0, code.length - corte))).toBeNull();
    }
  });

  it("detecta corrupção do conteúdo pelo checksum", () => {
    // Detecta corrupção, não falsificação: quem quiser forjar um resultado
    // recalcula o checksum. A defesa contra código forjado é a validação
    // campo a campo na decodificação, testada abaixo.
    const code = encodeRecord(full);
    const bruto = atob(code.slice(3).replace(/-/g, "+").replace(/_/g, "/"));
    const trocado = bruto.replace("|14|21|", "|21|21|"); // inflar a pontuação
    expect(trocado).not.toBe(bruto);
    expect(decodeRecord("v2." + btoa(trocado).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""))).toBeNull();
  });

  it("rejects garbage, wrong prefix and oversized codes", () => {
    expect(decodeRecord("lixo")).toBeNull();
    expect(decodeRecord("v3." + "a".repeat(50))).toBeNull();
    expect(decodeRecord("v2.")).toBeNull();
    expect(decodeRecord("v2." + "A".repeat(30_000))).toBeNull();
    expect(decodeRecord("v2.!!!!não-base64!!!")).toBeNull();
    expect(decodeRecord("v1." + "A".repeat(30_000))).toBeNull();
    expect(decodeRecord("v1.!!!!não-base64!!!")).toBeNull();
  });

  it("rejeita campos v2 corrompidos", () => {
    const enc = (campos: string[]) => {
      const corpo = campos.join("|");
      const bin = String.fromCharCode(...new TextEncoder().encode(`${checksum(corpo)}|${corpo}`));
      return "v2." + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    };
    const base = ["gad-7", "abc", "id1", "14", "21", "Moderado", "3"];
    expect(decodeRecord(enc(base))).not.toBeNull();
    expect(decodeRecord(enc(["gad-7", "abc", "id1"]))).toBeNull(); // campos de menos
    expect(decodeRecord(enc([...base.slice(0, 1), "", ...base.slice(2)]))).toBeNull(); // data inválida
    expect(decodeRecord(enc([...base.slice(0, 3), "99999", ...base.slice(4)]))).toBeNull(); // fora da faixa
    expect(decodeRecord(enc([...base.slice(0, 5), "", "3"]))).toBeNull(); // faixa sem rótulo
    expect(decodeRecord(enc([...base, "0", "0", "", "0,1"]))).toBeNull(); // subescala incompleta
    expect(decodeRecord(enc([...base, "0", "0", "", Array(25).fill("0,1,2").join(";")]))).toBeNull();
    // Instrumento desconhecido sem sigla/nome não pode ser reconstruído.
    expect(decodeRecord(enc(["nao-existe", "abc", "id1", "1", "2", "Faixa", "0"]))).toBeNull();
  });
});

describe("acoplamento com o catálogo de instrumentos", () => {
  // Como os links v2 mandam o ÍNDICE da subescala, reordenar ou renomear a
  // lista de um instrumento relabela silenciosamente links já enviados —
  // "Liderança" viraria "Talento artístico" na tela de quem recebeu. Estes
  // testes travam a ordem: se ela mudar de propósito, é preciso bumpar o
  // formato (v3) em vez de só atualizar o teste.
  it("mantém a ordem das subescalas do AH/SD", () => {
    expect(getInstrument("ahsd-indicadores")?.subscales?.map((s) => s.name)).toEqual([
      "Capacidade intelectual geral",
      "Aptidão acadêmica específica",
      "Criatividade / pensamento produtivo",
      "Envolvimento com a tarefa",
      "Liderança",
      "Talento artístico",
      "Capacidade psicomotora",
      "Intensidade emocional e sensibilidade",
    ]);
  });

  it("mantém os ids dos instrumentos usados em links já enviados", () => {
    for (const id of ["ahsd-indicadores", "sobre-excitabilidades", "gad-7", "phq-9", "ace"]) {
      expect(getInstrument(id), `instrumento ${id} sumiu do catálogo`).toBeTruthy();
    }
  });
});

describe("share codec (v1 legado)", () => {
  it("ainda decodifica links antigos", () => {
    expect(decodeRecord(v1(full))).toEqual(full);
  });

  it("rejects records with missing or invalid required fields", () => {
    const bad = (mut: (r: Record<string, unknown>) => void) => {
      const r: Record<string, unknown> = JSON.parse(JSON.stringify(full));
      mut(r);
      return decodeRecord(v1(r));
    };
    expect(bad((r) => delete r.id)).toBeNull();
    expect(bad((r) => (r.totalScore = "14"))).toBeNull();
    expect(bad((r) => (r.totalScore = 99_999))).toBeNull();
    expect(bad((r) => (r.severity = "apocalyptic"))).toBeNull();
    expect(bad((r) => (r.createdAt = "ontem à noite"))).toBeNull();
    expect(bad((r) => (r.respondent = "x".repeat(500)))).toBeNull();
    expect(bad((r) => (r.instrumentName = "x".repeat(500)))).toBeNull();
    expect(bad((r) => (r.subscales = Array(30).fill({ name: "s", raw: 1, max: 2 })))).toBeNull();
    expect(bad((r) => (r.subscales = [{ name: "s", raw: "1", max: 2 }]))).toBeNull();
  });

  it("strips unknown fields (whitelist reconstruction)", () => {
    const decoded = decodeRecord(v1({ ...full, script: "<img onerror=1>", role: "admin" }));
    expect(decoded).toEqual(full);
    expect(Object.keys(decoded!)).not.toContain("script");
    expect(Object.keys(decoded!)).not.toContain("role");
  });
});

describe("leitura de links", () => {
  it("codeFromHash aceita o formato novo e o antigo (#add=)", () => {
    expect(codeFromHash("#v2.abc")).toBe("v2.abc");
    expect(codeFromHash("#add=v1.abc")).toBe("v1.abc");
    expect(codeFromHash("#")).toBeNull();
    expect(codeFromHash("")).toBeNull();
  });

  it("ignora fragmentos que não são código de resultado", () => {
    // Âncora comum e o fragmento que o Chrome anexa ao copiar um trecho: não
    // podem fazer o painel acusar "link inválido" do nada.
    expect(codeFromHash("#secao-2")).toBeNull();
    expect(codeFromHash("#:~:text=resultado")).toBeNull();
    expect(extractCode("https://exemplo.com/pagina#secao-2")).toBeNull();
  });

  it("codeFromHash never throws on malformed percent-escapes (truncated links)", () => {
    // decodeURIComponent("%E0%A4") lançaria URIError; aqui degrada para o texto cru.
    expect(() => codeFromHash("#v2.abc%E0%A4")).not.toThrow();
    expect(codeFromHash("#v2.abc%E0%A4")).toBe("v2.abc%E0%A4");
  });

  it("extractCode accepts raw codes and full links, ignores prose", () => {
    const code = encodeRecord(full);
    expect(extractCode(code)).toBe(code);
    expect(extractCode(`https://ahsdtests.vercel.app/resultado#${code}`)).toBe(code);
    // Links antigos continuam sendo aceitos no campo de colar.
    expect(extractCode(`https://ahsdtests.vercel.app/painel-ahsd#add=v1.eyJ`)).toBe("v1.eyJ");
    // Palavras de uma mensagem colada junto não viram "códigos inválidos".
    expect(extractCode("Resultado")).toBeNull();
    expect(extractCode("do")).toBeNull();
    expect(extractCode("painel:")).toBeNull();
  });
});
