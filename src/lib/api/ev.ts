import { evArticles } from "@/data/mock/ev";
import type { ArticleBlock, EvArticle, EvArticleWithMeta, LocalizedText } from "@/types";
import { simulateLatency } from "./client";

const WORDS_PER_MINUTE = 200;

/** Reading time from the English text (diagrams and the explainer count as a minute). */
function readingMinutes(a: EvArticle): number {
  const texts: LocalizedText[] = [a.title, a.summary, ...a.faqs.flatMap((f) => [f.q, f.a])];
  let extra = 0;
  const addBlock = (b: ArticleBlock) => {
    if (b.type === "p" || b.type === "callout") texts.push(b.text);
    else if (b.type === "list") texts.push(...b.items);
    else if (b.type === "table") texts.push(...b.rows.flatMap((r) => [r.label, ...r.cells]));
    else extra += 0.5;
  };
  a.sections.forEach((s) => {
    texts.push(s.title);
    s.blocks.forEach(addBlock);
  });
  const words = texts.reduce((n, t) => n + t.en.split(/\s+/).filter(Boolean).length, 0);
  return Math.max(2, Math.round(words / WORDS_PER_MINUTE + extra));
}

const withMeta = (a: EvArticle): EvArticleWithMeta => ({ ...a, readingMinutes: readingMinutes(a) });

/** All EV guides, in suggested reading order. */
export async function getEvArticles(): Promise<EvArticleWithMeta[]> {
  // TODO(api): GET /content/ev-articles → EvArticle[] (CMS)
  await simulateLatency();
  return evArticles.map(withMeta);
}

export async function getEvArticle(slug: string): Promise<EvArticleWithMeta | null> {
  // TODO(api): GET /content/ev-articles/:slug → EvArticle | 404 (CMS)
  await simulateLatency();
  const a = evArticles.find((x) => x.slug === slug);
  return a ? withMeta(a) : null;
}
