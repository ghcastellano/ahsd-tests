import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { g36Test, g38Test, ravenTest } from "./exames-autorais";
import { visualKey } from "./visual-key";

const PUBLIC_DIR = join(process.cwd(), "public");

describe("exames /g38, /g36 e /raven", () => {
  it("g38: usa as questões reais do vídeo com imagens existentes, gabarito oficial e explicação", () => {
    const items = g38Test.items(0);
    expect(items.length).toBe(31);
    expect(g38Test.reference?.purchaseUrl).toContain("vetoreditora.com.br");
    for (const item of items) {
      expect(item.imageMatrix).toBeTruthy();
      expect(existsSync(join(PUBLIC_DIR, item.imageMatrix!))).toBe(true);
      expect(item.imageOptions).toHaveLength(6);
      for (const optPath of item.imageOptions!) {
        expect(existsSync(join(PUBLIC_DIR, optPath))).toBe(true);
      }
      expect(item.answerIndex).toBeGreaterThanOrEqual(0);
      expect(item.answerIndex).toBeLessThan(6);
      expect(item.explanation.trim().length).toBeGreaterThan(20);
    }
  });

  it("g36: usa todas as 36 questões reais do vídeo com imagens existentes, gabarito oficial e explicação", () => {
    const items = g36Test.items(0);
    expect(items.length).toBe(36);
    expect(g36Test.reference?.purchaseUrl).toContain("vetoreditora.com.br");
    for (const item of items) {
      expect(item.imageMatrix).toBeTruthy();
      expect(existsSync(join(PUBLIC_DIR, item.imageMatrix!))).toBe(true);
      expect(item.imageOptions).toHaveLength(6);
      for (const optPath of item.imageOptions!) {
        expect(existsSync(join(PUBLIC_DIR, optPath))).toBe(true);
      }
      expect(item.answerIndex).toBeGreaterThanOrEqual(0);
      expect(item.answerIndex).toBeLessThan(6);
      expect(item.explanation.trim().length).toBeGreaterThan(20);
    }
  });

  it("raven: gera 36 matrizes únicas sem repetir o mesmo tipo em sequência", () => {
    const items = ravenTest.items(7);
    expect(items.length).toBe(36);
    expect(ravenTest.reference?.purchaseUrl).toContain("hogrefe.com.br");
    for (let i = 1; i < items.length; i++) {
      expect(items[i].kind).not.toBe(items[i - 1].kind);
    }
    for (const item of items) {
      expect(item.options).toHaveLength(6);
      const keys = item.options!.map(visualKey);
      expect(new Set(keys).size).toBe(6);
      expect(keys[item.answerIndex]).toBe(visualKey(item.grid![2][2]));
    }
  });
});
