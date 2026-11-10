// Mock of a GET /api/tags/search?q=... endpoint. Swap searchTags for a real fetch.
import { WORKS } from "../data/works";
import type { Work } from "../data/works";

export const TAG_TYPES = ["format", "author", "director", "series", "character", "genre", "language"] as const;
export type TagType = (typeof TAG_TYPES)[number];

export interface Tag {
  type: TagType;
  name: string;
  count: number;
  description?: string;
}

// The tag names a work has for one tag type. Search uses this too, so tags and results agree.
export function tagValues(work: Work, type: TagType): string[] {
  switch (type) {
    case "format": return [work.format];
    case "author": return work.authors;
    case "director": return work.directors;
    case "series": return work.series ? [work.series] : [];
    case "character": return work.characters;
    case "genre": return work.genres;
    case "language": return work.languages;
  }
}

const DESCRIPTIONS: Record<string, string> = {
  "format:book": "A novel, novella, or story collection.",
  "format:tv": "A TV series or miniseries.",
  "format:movie": "A feature film.",
  "format:comic": "A comic or graphic novel.",
};

// Count every tag across the catalog, so each suggestion's count is the number of results it gives.
const TAGS: Tag[] = (() => {
  const counts = new Map<string, Tag>();
  for (const work of WORKS)
    for (const type of TAG_TYPES)
      for (const name of tagValues(work, type)) {
        const key = `${type}:${name}`;
        const tag = counts.get(key) ?? { type, name, count: 0, description: DESCRIPTIONS[key] };
        tag.count++;
        counts.set(key, tag);
      }
  return [...counts.values()];
})();

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(signal.reason);
    });
  });

export async function searchTags(
  q: string,
  opts: { type?: TagType; limit?: number; signal?: AbortSignal } = {},
): Promise<Tag[]> {
  await sleep(120, opts.signal); // simulated network latency
  const needle = q.trim().toLowerCase();
  if (!needle) return [];

  // Prefix matches first, then substring matches; most used first in each group.
  const rank = (t: Tag) => (t.name.startsWith(needle) ? 0 : 1);
  return TAGS.filter((t) => (!opts.type || t.type === opts.type) && t.name.includes(needle))
    .sort((a, b) => rank(a) - rank(b) || b.count - a.count)
    .slice(0, opts.limit ?? 8);
}
