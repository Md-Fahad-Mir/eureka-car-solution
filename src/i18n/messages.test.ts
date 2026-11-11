import { describe, expect, it } from "vitest";
import bn from "../../messages/bn.json";
import en from "../../messages/en.json";

type Tree = { [key: string]: string | Tree };

function leafKeys(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([k, v]) =>
    typeof v === "string" ? [`${prefix}${k}`] : leafKeys(v, `${prefix}${k}.`),
  );
}

function placeholders(text: string): string[] {
  // ICU arguments only: `{name}` or `{name, plural, …}`, not text inside plural branches.
  return [...new Set([...text.matchAll(/\{(\w+)\s*[,}]/g)].map((m) => m[1]))].sort();
}

describe("message catalogues", () => {
  const enKeys = leafKeys(en as Tree);
  const bnKeys = leafKeys(bn as Tree);

  it("Bangla has exactly the same keys as English", () => {
    expect(bnKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
    expect(enKeys.filter((k) => !bnKeys.includes(k))).toEqual([]);
  });

  it("every translation uses the same ICU placeholders", () => {
    const get = (tree: Tree, key: string) =>
      key.split(".").reduce<string | Tree>((node, part) => (node as Tree)[part], tree) as string;
    for (const key of enKeys) {
      expect(placeholders(get(bn as Tree, key)), key).toEqual(placeholders(get(en as Tree, key)));
    }
  });

  it("has no empty strings", () => {
    const get = (tree: Tree, key: string) =>
      key.split(".").reduce<string | Tree>((node, part) => (node as Tree)[part], tree) as string;
    for (const key of enKeys) {
      expect(get(en as Tree, key).trim(), `en:${key}`).not.toBe("");
      expect(get(bn as Tree, key).trim(), `bn:${key}`).not.toBe("");
    }
  });
});
