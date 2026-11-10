// Mock of a GET /api/works/search?q=... endpoint. A real server would run the same rules.
import { WORKS } from "../data/works";
import type { Work } from "../data/works";
import type { ParsedQuery } from "./query";
import { TAG_TYPES, tagValues } from "./tagApi";
import type { TagType } from "./tagApi";

const DAY_MS = 24 * 60 * 60 * 1000;

// "1979", ">1990", ">=8", "<2000", "1980..1989". Returns null for anything else.
function numberTest(value: string): ((n: number) => boolean) | null {
  const range = /^(\d+(?:\.\d+)?)\.\.(\d+(?:\.\d+)?)$/.exec(value);
  if (range) {
    const [lo, hi] = [Number(range[1]), Number(range[2])];
    return (n) => n >= lo && n <= hi;
  }
  const cmp = /^(>=|<=|>|<)?(\d+(?:\.\d+)?)$/.exec(value);
  if (!cmp) return null;
  const x = Number(cmp[2]);
  switch (cmp[1]) {
    case ">": return (n) => n > x;
    case ">=": return (n) => n >= x;
    case "<": return (n) => n < x;
    case "<=": return (n) => n <= x;
    default: return (n) => n === x;
  }
}

// One filter against one work. Unknown fields and bad values match nothing,
// so a typo gives zero results instead of being silently ignored.
function matchesFilter(work: Work, field: string, value: string, now: Date): boolean {
  const v = value.toLowerCase();
  if ((TAG_TYPES as readonly string[]).includes(field)) return tagValues(work, field as TagType).includes(v);
  switch (field) {
    case "title": return work.title.toLowerCase().includes(v);
    case "plot": return work.plot.toLowerCase().includes(v);
    case "year": return numberTest(v)?.(work.year) ?? false;
    case "rating": return numberTest(v)?.(work.rating) ?? false;
    case "added": {
      const days = /^(\d+)d$/.exec(v);
      return !!days && now.getTime() - Date.parse(work.addedAt) <= Number(days[1]) * DAY_MS;
    }
    default: return false;
  }
}

// A plain word matches the title, the plot, or any tag name.
function matchesText(work: Work, word: string): boolean {
  const haystack = [work.title, work.plot, ...TAG_TYPES.flatMap((t) => tagValues(work, t))].join(" ").toLowerCase();
  return haystack.includes(word.toLowerCase());
}

// Every filter and every word must match (AND). Best rated first.
export function filterWorks(works: Work[], q: ParsedQuery, now = new Date()): Work[] {
  return works
    .filter(
      (w) => q.filters.every((f) => matchesFilter(w, f.field, f.value, now)) && q.text.every((t) => matchesText(w, t)),
    )
    .sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
}

export async function searchWorks(q: ParsedQuery): Promise<Work[]> {
  return filterWorks(WORKS, q);
}
