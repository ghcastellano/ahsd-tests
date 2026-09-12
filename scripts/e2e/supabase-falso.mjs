// Supabase de mentira para testar o registro de acessos sem rede: guarda os
// POSTs em /rest/v1/visitas e responde a RPC admin_listar_visitas com eles.
// A senha aceita é "senha-teste". Uso: node scripts/e2e/supabase-falso.mjs [porta]
import { createServer } from "node:http";
const porta = Number(process.argv[2] ?? 3222);
const visitas = [];
createServer((req, res) => {
  // CORS como o Supabase real: o painel chama a RPC direto do navegador.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  let corpo = "";
  req.on("data", (c) => (corpo += c));
  req.on("end", () => {
    const url = req.url ?? "";
    const senhaOk = () => { try { return JSON.parse(corpo).p_senha === "senha-teste"; } catch { return false; } };
    if (req.method === "POST" && url.startsWith("/rest/v1/visitas")) {
      const v = JSON.parse(corpo);
      visitas.unshift({ id: String(visitas.length + 1), created_at: new Date().toISOString(), ...v });
      res.writeHead(201); return res.end();
    }
    if (req.method === "POST" && url.startsWith("/rest/v1/rpc/admin_listar_visitas")) {
      if (!senhaOk()) { res.writeHead(400, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ message: "senha incorreta" })); }
      res.writeHead(200, { "Content-Type": "application/json" }); return res.end(JSON.stringify(visitas));
    }
    if (req.method === "POST" && url.startsWith("/rest/v1/rpc/admin_listar_resultados")) {
      if (!senhaOk()) { res.writeHead(400, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ message: "senha incorreta" })); }
      res.writeHead(200, { "Content-Type": "application/json" }); return res.end("[]");
    }
    if (req.method === "DELETE" && url === "/__visitas") { visitas.length = 0; res.writeHead(204); return res.end(); }
    if (req.method === "GET" && url === "/__visitas") {
      res.writeHead(200, { "Content-Type": "application/json" }); return res.end(JSON.stringify(visitas));
    }
    if (req.method === "POST" && url.startsWith("/rest/v1/resultados")) { res.writeHead(201); return res.end(); }
    res.writeHead(404); res.end();
  });
}).listen(porta, "127.0.0.1", () => console.log(`supabase falso em http://127.0.0.1:${porta}`));
