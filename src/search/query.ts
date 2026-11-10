// A tiny search language:  field:value  field:"quoted value"  "quoted text"  bare
// The text in the input is the single source of truth; we only parse it.

export interface Token {
  start: number; // index of first char in the query
  end: number; // index after last char
  field?: string; // "language" in language:english
  value: string; // unquoted value
}

// field:"..." | field:value | "..." | bare word. Closing quotes are optional,
// so a half-typed  title:"eng  still tokenizes while the user types.
const TOKEN_RE = /(\w+):"([^"]*)"?|(\w+):(\S*)|"([^"]*)"?|(\S+)/g;

export function tokenize(query: string): Token[] {
  const tokens: Token[] = [];
  for (const m of query.matchAll(TOKEN_RE)) {
    const start = m.index;
    const end = start + m[0].length;
    if (m[1] !== undefined) tokens.push({ start, end, field: m[1].toLowerCase(), value: m[2] });
    else if (m[3] !== undefined) tokens.push({ start, end, field: m[3].toLowerCase(), value: m[4] });
    else if (m[5] !== undefined) tokens.push({ start, end, value: m[5] });
    else tokens.push({ start, end, value: m[6] });
  }
  return tokens;
}

// The token the cursor is touching. In whitespace, return an empty token there,
// so suggestions follow the cursor rather than the end of the string.
export function tokenAt(query: string, cursor: number): Token {
  const hit = tokenize(query).find((t) => t.start <= cursor && cursor <= t.end);
  return hit ?? { start: cursor, end: cursor, value: "" };
}

export function formatFilter(field: string, value: string): string {
  return /\s|"/.test(value) ? `${field}:"${value.replaceAll('"', "")}"` : `${field}:${value}`;
}

// Replace a token with new text and return the new query and cursor.
// Default: add one space and put the cursor after it, ready for the next token.
// For a field prefix like  genre:  pass trailingSpace: false and the caret inside the text.
export function replaceToken(
  query: string,
  token: Token,
  text: string,
  { trailingSpace = true, caret }: { trailingSpace?: boolean; caret?: number } = {},
) {
  const before = query.slice(0, token.start);
  const after = query.slice(token.end).replace(/^\s*/, "");
  const sep = trailingSpace || after ? " " : "";
  const offset = caret ?? text.length + sep.length;
  return { query: before + text + sep + after, cursor: before.length + offset };
}

export interface ParsedQuery {
  filters: { field: string; value: string }[];
  text: string[];
}

// What the server would receive. Filters are combined with AND.
export function parseQuery(query: string): ParsedQuery {
  const parsed: ParsedQuery = { filters: [], text: [] };
  for (const t of tokenize(query)) {
    if (!t.value) continue;
    if (t.field) parsed.filters.push({ field: t.field, value: t.value });
    else parsed.text.push(t.value);
  }
  return parsed;
}
