const KEY = "ahsd:mensa:exposicao:v2";
const LIMIT = 2000;
export function readExposure(storage: Pick<Storage, "getItem">): Set<string> | null {
  try {
    const data: unknown = JSON.parse(storage.getItem(KEY) ?? "[]");
    if (!Array.isArray(data) || !data.every(v => typeof v === "string")) return null;
    return new Set(data.slice(-LIMIT));
  } catch { return null; }
}
export function saveExposure(storage: Pick<Storage, "setItem">, seen: Set<string>): boolean {
  try { storage.setItem(KEY, JSON.stringify([...seen].slice(-LIMIT))); return true; }
  catch { return false; }
}
