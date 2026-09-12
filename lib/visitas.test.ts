import { describe, it, expect } from "vitest";
import {
  buildVisitsCsv,
  ipDosCabecalhos,
  limparCaminho,
  limparReferer,
  localDaVisita,
  normalizarIp,
  resumirNavegador,
  resumoVisitas,
  visitaDaRequisicao,
  type VisitaRegistro,
} from "./visitas";

describe("normalizarIp", () => {
  it("aceita IPv4 e IPv6, tira porta e colchetes, rejeita lixo", () => {
    expect(normalizarIp("187.10.20.30")).toBe("187.10.20.30");
    expect(normalizarIp(" 187.10.20.30:51234 ")).toBe("187.10.20.30");
    expect(normalizarIp("[2804:14d:1::a]:443")).toBe("2804:14d:1::a");
    expect(normalizarIp("2804:14D:1::A")).toBe("2804:14d:1::a");
    expect(normalizarIp("::ffff:10.0.0.7")).toBe("10.0.0.7");
    expect(normalizarIp("999.1.1.1")).toBeNull();
    expect(normalizarIp("unknown")).toBeNull();
    expect(normalizarIp("<script>")).toBeNull();
    expect(normalizarIp("")).toBeNull();
    expect(normalizarIp(null)).toBeNull();
  });
});

describe("ipDosCabecalhos", () => {
  it("prefere os cabeçalhos carimbados pela plataforma e cai para o primeiro de x-forwarded-for", () => {
    expect(ipDosCabecalhos({ "x-real-ip": "1.2.3.4", "x-forwarded-for": "9.9.9.9, 1.2.3.4" })).toBe("1.2.3.4");
    expect(ipDosCabecalhos({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" })).toBe("9.9.9.9");
    expect(ipDosCabecalhos({ "x-forwarded-for": "lixo, 9.9.9.9" })).toBe("9.9.9.9");
    expect(ipDosCabecalhos({})).toBeNull();
  });
  it("funciona com Headers do fetch", () => {
    const h = new Headers({ "X-Vercel-Forwarded-For": "200.1.2.3" });
    expect(ipDosCabecalhos(h)).toBe("200.1.2.3");
  });
});

describe("visitaDaRequisicao", () => {
  it("monta a visita com geolocalização decodificada, caminho sem query e referer sem query", () => {
    const h = new Headers({
      "x-real-ip": "177.8.9.10",
      "x-vercel-ip-country": "BR",
      "x-vercel-ip-country-region": "SP",
      "x-vercel-ip-city": "S%C3%A3o%20Paulo",
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
      "accept-language": "pt-BR,pt;q=0.9",
    });
    const v = visitaDaRequisicao(h, { caminho: "/teste-qi?seed=5#x", referer: "https://google.com/search?q=segredo" });
    expect(v).toEqual({
      ip: "177.8.9.10",
      pais: "BR",
      regiao: "SP",
      cidade: "São Paulo",
      caminho: "/teste-qi",
      referer: "https://google.com/search",
      userAgent: expect.stringContaining("iPhone"),
      idioma: "pt-BR,pt;q=0.9",
    });
    expect(resumirNavegador(v.userAgent)).toBe("Safari · iPhone");
    expect(localDaVisita(v)).toBe("São Paulo, SP, BR");
  });
  it("ignora corpo malformado e IP enviado no corpo", () => {
    const v = visitaDaRequisicao({}, { ip: "6.6.6.6", caminho: "javascript:alert(1)", referer: "ftp://x" });
    expect(v.ip).toBeNull();
    expect(v.caminho).toBeNull();
    expect(v.referer).toBeNull();
    expect(visitaDaRequisicao({}, "string").caminho).toBeNull();
    expect(visitaDaRequisicao({}, null).caminho).toBeNull();
  });
  it("trunca campos longos", () => {
    const h = { "user-agent": "x".repeat(1000), "accept-language": "y".repeat(100) };
    const v = visitaDaRequisicao(h, { caminho: "/" + "a".repeat(500), referer: "https://ex.com/" + "b".repeat(500) });
    expect(v.userAgent?.length).toBe(300);
    expect(v.idioma?.length).toBe(40);
    expect(v.caminho?.length).toBe(200);
    expect(v.referer?.length).toBe(300);
  });
});

describe("limparCaminho / limparReferer", () => {
  it("só aceita caminhos absolutos e URLs http(s)", () => {
    expect(limparCaminho("/treino/simulador?seed=1")).toBe("/treino/simulador");
    expect(limparCaminho("treino")).toBeNull();
    expect(limparCaminho(42)).toBeNull();
    expect(limparReferer("https://site.com/p?x=1")).toBe("https://site.com/p");
    expect(limparReferer("")).toBeNull();
    expect(limparReferer("não é url")).toBeNull();
  });
});

describe("resumirNavegador", () => {
  it("identifica navegador e sistema", () => {
    expect(resumirNavegador("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36")).toBe("Chrome · Windows");
    expect(resumirNavegador("Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/128.0 Mobile Safari/537.36 EdgA/128.0")).toBe("Chrome · Android");
    expect(resumirNavegador("Mozilla/5.0 (Windows NT 10.0) Chrome/128.0 Safari/537.36 Edg/128.0")).toBe("Edge · Windows");
    expect(resumirNavegador("Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0")).toBe("Firefox · Linux");
    expect(resumirNavegador("curl/8.4.0")).toBe("robô");
    expect(resumirNavegador(null)).toBe("—");
  });
});

describe("resumoVisitas / buildVisitsCsv", () => {
  const agora = Date.parse("2026-09-12T12:00:00Z");
  const vs: VisitaRegistro[] = [
    { id: "1", createdAt: "2026-09-12T11:00:00Z", ip: "1.1.1.1", pais: "BR", regiao: "RJ", cidade: "Rio", caminho: "/", referer: null, userAgent: "curl/8", idioma: "pt" },
    { id: "2", createdAt: "2026-09-12T10:00:00Z", ip: "1.1.1.1", pais: "BR", regiao: null, cidade: null, caminho: "/teste-qi", referer: "https://g.com/", userAgent: null, idioma: null },
    { id: "3", createdAt: "2026-09-01T10:00:00Z", ip: "2.2.2.2", pais: null, regiao: null, cidade: null, caminho: "=cmd", referer: null, userAgent: null, idioma: null },
    { id: "4", createdAt: "2026-08-01T10:00:00Z", ip: null, pais: null, regiao: null, cidade: null, caminho: null, referer: null, userAgent: null, idioma: null },
  ];
  it("conta total, IPs distintos e últimas 24 h", () => {
    expect(resumoVisitas(vs, agora)).toEqual({ total: 4, ipsDistintos: 2, ultimas24h: 2 });
  });
  it("gera CSV com cabeçalho, separador ';' e neutraliza fórmulas", () => {
    const csv = buildVisitsCsv(vs);
    const linhas = csv.split("\r\n");
    expect(linhas).toHaveLength(5);
    expect(linhas[0]).toBe("data_hora;ip;pais;regiao;cidade;caminho;origem;navegador;user_agent;idioma");
    expect(linhas[1]).toContain(";1.1.1.1;BR;RJ;Rio;/;;robô;curl/8;pt");
    expect(linhas[3]).toContain("'=cmd");
  });
});
