import { useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Work } from "../data/works";
import { formatFilter, parseQuery, replaceToken, tokenAt } from "./query";
import type { ParsedQuery } from "./query";
import { searchTags, TAG_TYPES } from "./tagApi";
import type { Tag, TagType } from "./tagApi";
import { useLookup } from "./useLookup";
import { searchWorks } from "./worksApi";
import "./SearchBox.css";

// The filter fields offered as quick shortcuts. `insert` goes into the input;
// a quoted field puts the caret between its quotes.
interface FieldDef {
  name: string;
  label: string;
  insert: string;
  hint: string;
}

const FIELDS: FieldDef[] = [
  ...TAG_TYPES.map((t) => ({ name: t, label: `${t}:…`, insert: `${t}:`, hint: `Filter by ${t}` })),
  { name: "year", label: "year:N", insert: "year:", hint: "Filter by release year" },
  { name: "rating", label: "rating:N", insert: "rating:", hint: "Filter by rating (1–10)" },
  { name: "added", label: "added:Nd", insert: "added:", hint: "Filter by date added" },
  { name: "title", label: 'title:"…"', insert: 'title:""', hint: "Search title text" },
  { name: "plot", label: 'plot:"…"', insert: 'plot:""', hint: "Search plot summaries" },
];

type Option =
  | { kind: "search" }
  | { kind: "key"; def: FieldDef } // a field shortcut, e.g. genre:…
  | { kind: "tag"; tag: Tag }
  | { kind: "work"; work: Work } // a matching title: picking it searches for that work
  | { kind: "field"; field: "title" | "plot"; hint: string };

const MAX_WORKS = 5;

// Lookup keys are JSON so the fetchers can live outside the component and stay stable.
const fetchTags = (key: string, signal: AbortSignal) => {
  const [lookup, type] = JSON.parse(key) as [string, TagType | null];
  return searchTags(lookup, { type: type ?? undefined, signal });
};
const fetchWorks = async (key: string) => (await searchWorks(JSON.parse(key) as ParsedQuery)).slice(0, MAX_WORKS);

export function SearchBox({ onSearch }: { onSearch: (q: ParsedQuery, raw: string) => void }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // -1 = no row highlighted
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCursor = useRef<number | null>(null);
  const listId = useId();

  // Suggestions depend only on the token under the cursor.
  const token = tokenAt(query, cursor);
  const typeFilter = TAG_TYPES.includes(token.field as TagType) ? (token.field as TagType) : undefined;
  const lookup = token.field && !typeFilter ? "" : token.value; // title:"x" needs no tag lookup
  const tags = useLookup(lookup ? JSON.stringify([lookup, typeFilter ?? null]) : null, fetchTags);

  // Titles for a plain word: the rest of the query still applies, so "format:book mart" shows only books.
  let worksKey: string | null = null;
  if (token.value && !token.field) {
    const rest = parseQuery(query.slice(0, token.start) + query.slice(token.end));
    rest.filters.push({ field: "title", value: token.value });
    worksKey = JSON.stringify(rest);
  }
  const works = useLookup(worksKey, fetchWorks);

  // Put the cursor back after React re-renders the new value.
  useLayoutEffect(() => {
    if (pendingCursor.current === null) return;
    inputRef.current?.setSelectionRange(pendingCursor.current, pendingCursor.current);
    pendingCursor.current = null;
  });

  const options: Option[] = query.trim() ? [{ kind: "search" }] : [];
  // Empty spot: offer every field. Partial word: offer fields it starts, e.g. "dir" → director:…
  const word = token.field ? null : token.value.toLowerCase();
  if (word !== null) {
    const keys = FIELDS.filter((f) => f.name.startsWith(word) && f.name !== word);
    options.push(...keys.map((def): Option => ({ kind: "key", def })));
  }
  options.push(...tags.map((tag): Option => ({ kind: "tag", tag })));
  options.push(...works.map((work): Option => ({ kind: "work", work })));
  if (token.value && !token.field) {
    options.push({ kind: "field", field: "title", hint: "Search title text" });
    options.push({ kind: "field", field: "plot", hint: "Search plot summaries" });
  }
  const showList = open && options.length > 0;

  const syncCursor = () => setCursor(inputRef.current?.selectionStart ?? 0);

  const submit = (q = query) => {
    setOpen(false);
    onSearch(parseQuery(q), q);
  };

  const choose = (opt: Option) => {
    if (opt.kind === "search") return submit();
    let next;
    if (opt.kind === "work") {
      // The year makes it one work: title:"Alien" alone also matches "Aliens".
      const { title, year } = opt.work;
      next = replaceToken(query, token, `title:"${title.replaceAll('"', "")}" year:${year}`);
      submit(next.query);
    } else if (opt.kind === "key") {
      // Keep the caret in the field so the user types its value next.
      const { insert } = opt.def;
      const caret = insert.endsWith('""') ? insert.length - 1 : insert.length;
      next = replaceToken(query, token, insert, { trailingSpace: false, caret });
    } else {
      // Text fallbacks are always quoted, like title:"dune".
      const text = opt.kind === "tag" ? formatFilter(opt.tag.type, opt.tag.name) : `${opt.field}:"${token.value}"`;
      next = replaceToken(query, token, text);
    }
    setQuery(next.query);
    setCursor(next.cursor);
    pendingCursor.current = next.cursor;
    setActive(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (options.length ? (i + step + options.length) % options.length : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showList && active >= 0) choose(options[active]);
      else submit();
    } else if (e.key === "Tab" && showList && active >= 0 && options[active].kind !== "search") {
      e.preventDefault(); // Tab completes the highlighted row, like the → button
      choose(options[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  const optionId = (i: number) => `${listId}-opt-${i}`;

  return (
    <form
      className="sb"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="sb-field">
        <input
          ref={inputRef}
          className="sb-input"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
          placeholder='Search, e.g. format:movie genre:"time travel"'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(e.target.selectionStart ?? 0);
            setOpen(true);
            setActive(-1);
          }}
          onSelect={syncCursor} // fires on click and arrow keys too
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="sb-clear"
            aria-label="Clear"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery("");
              setCursor(0);
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        )}
        <button type="submit" className="sb-go" aria-label="Search">
          ⌕
        </button>
      </div>

      {showList && (
        <ul id={listId} role="listbox" className="sb-list">
          {options.map((opt, i) => (
            <li
              key={i}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              className={`sb-opt ${i === active ? "is-active" : ""}`}
              // mousedown + preventDefault keeps focus in the input (no blur → close)
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(opt)}
              onMouseMove={() => setActive(i)} // not mouseenter: a list opening under a still pointer must not pick a row
            >
              <OptionRow opt={opt} query={query} tokenValue={token.value} />
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

function OptionRow({ opt, query, tokenValue }: { opt: Option; query: string; tokenValue: string }) {
  if (opt.kind === "search")
    return (
      <>
        <span className="sb-muted">Search for</span> <span className="sb-q">{query}</span>
      </>
    );
  if (opt.kind === "key")
    return (
      <>
        <span className="sb-mono">{opt.def.label}</span>
        <span className="sb-muted sb-right">{opt.def.hint}</span>
      </>
    );
  if (opt.kind === "field")
    return (
      <>
        <span>
          {opt.field}:"{tokenValue}"
        </span>
        <span className="sb-muted sb-right">{opt.hint}</span>
      </>
    );
  if (opt.kind === "work") {
    const { work } = opt;
    return (
      <>
        <span className="sb-badge sb-badge-format">{work.format}</span>
        <span className="sb-title">{work.title}</span>
        <span className="sb-muted">{work.year}</span>
        <span className="sb-muted sb-right">★ {work.rating.toFixed(1)}</span>
      </>
    );
  }
  const { tag } = opt;
  return (
    <>
      <span className={`sb-badge sb-badge-${tag.type}`}>{tag.type}</span>
      <span>{tag.name}</span>
      {tag.description && <span className="sb-muted sb-desc">{tag.description}</span>}
      <span className="sb-muted sb-right">{formatCount(tag.count)}</span>
      <span className="sb-muted">→</span>
    </>
  );
}

const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));
