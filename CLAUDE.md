# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`s.search`: a React + TypeScript (Vite) demo of a search box with a small query language (`field:value`) and an autocomplete combobox, searching a mock catalog of sci-fi books, TV, movies, and comics. There is no backend; the "APIs" are local functions shaped to be swapped for `fetch` calls.

## Commands

```bash
npm run dev                          # dev server (add -- --host 0.0.0.0 to serve on the LAN)
npm run build                        # tsc -b type check, then vite build
npm run lint                         # oxlint
npx vitest run                       # all tests (no "test" script in package.json)
npx vitest run src/search/query.test.ts      # one file
npx vitest run -t "combines filters"         # tests whose name matches
```

## Architecture

Data flows in one direction: input text → `parseQuery` → `searchWorks` → result cards.

- **The input text is the only source of truth.** `src/search/query.ts` re-tokenizes it on every render. Filters are not stored as separate objects or chips. `tokenAt(query, cursor)` finds the token under the cursor, and suggestions follow it, not the end of the string. `replaceToken` is the only function that edits the text and returns the new cursor position.
- **Token grammar** (`TOKEN_RE`): `field:"quoted"` | `field:value` | `"quoted"` | bare word. Closing quotes are optional, so text that is still being typed parses. A space after the colon (`director: x`) makes an empty filter, which `parseQuery` drops; the value then becomes plain words.
- **`src/data/works.ts` is the only data source.** `tagApi.ts` builds its tag list and counts from `WORKS` through `tagValues(work, type)`, and `worksApi.ts` matches filters with the same `tagValues`. So a suggestion's count always equals the number of results that tag returns. When you add a tag type, update `TAG_TYPES`, `tagValues`, and add a `.sb-badge-<type>` color in `SearchBox.css`. The `FIELDS` list in `SearchBox.tsx` picks up new tag types by itself.
- **Matching rules** (`worksApi.ts`): filters and plain words combine with AND. Tag fields match exactly, ignoring case. `title`/`plot` match a substring. `year`/`rating` take `N`, `>N`, `>=N`, `<N`, `<=N`, or `A..B`. `added` takes `Nd`. Unknown fields and bad values match nothing, on purpose. `filterWorks` is pure and takes `now`, so tests pass a fixed date.
- **`SearchBox.tsx` combobox**, the parts that are easy to break:
  - Option kinds: `search` (submit), `key` (field shortcut such as `genre:`, which leaves the caret after the colon or inside `""`), `tag`, `work` (a matching title; picking it puts in `title:"…" year:N` and submits, because the year makes the match unique), and `field` (the `title:"x"` / `plot:"x"` fallbacks).
  - Tag and title lookups both go through `useLookup(key, fetcher)` (`src/search/useLookup.ts`): debounced, cancelled on change, and results returned only while their key is still current. Keys are JSON strings and fetchers are module-level, so the effect deps stay stable. Do not clear results with `setState` inside the effect; oxlint flags `set-state-in-effect`.
  - The title lookup applies the rest of the query, so `format:book mart` suggests only books.
  - Rows use `onMouseDown={preventDefault}` so the input keeps focus. They highlight on `onMouseMove`, not `onMouseEnter`, so a list that opens under a still pointer does not pre-select a row.
  - After a programmatic edit, the caret is restored in `useLayoutEffect` through `pendingCursor`.

## Conventions

- TypeScript has `verbatimModuleSyntax` and `erasableSyntaxOnly` on: use `import type` for types, and do not use `enum` or parameter properties.
- Data is fictional-catalog only. Keep all examples and test data in the sci-fi domain.
