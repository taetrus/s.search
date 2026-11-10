# s.search

A search box that understands a small query language, with autocomplete. It searches a mock catalog of science-fiction books, TV series, movies, and comics.

**Live demo:** https://taetrus.github.io/s.search/

![The search box with the query "format:movie ali". The list shows the series tag "alien", the movies Alien and Aliens, and title and plot search shortcuts.](docs/screenshot.png)

## Features

- **Query language.** Type filters such as `director:"ridley scott"` or `year:>1990` together with plain words.
- **Field shortcuts.** Click the empty box to see all filters. Select a filter to insert it.
- **Tag suggestions.** Type a name to see matching people, series, characters, and genres. Each tag shows the number of works that have it.
- **Title suggestions.** Matching titles appear while you type. The other filters in the query also apply to these titles.
- **Keyboard control.** You can do all steps with the keyboard.

The app has no backend. All data is in `src/data/works.ts`, and all search runs in the browser.

## Query syntax

All filters and words must match. A query with no filters and no words shows all works.

| Filter | Example | Matches |
|---|---|---|
| `format:` | `format:movie` | `book`, `tv`, `movie`, or `comic` |
| `author:` | `author:"isaac asimov"` | The author of the book, or of the source book of a film or series |
| `director:` | `director:"ridley scott"` | The director |
| `series:` | `series:dune` | The series or franchise |
| `character:` | `character:spock` | A character in the work |
| `genre:` | `genre:"time travel"` | A genre |
| `language:` | `language:french` | A language of the original or of a translation |
| `year:` | `year:1979`, `year:>1990`, `year:1960..1969` | The release year. Use `>`, `>=`, `<`, `<=`, or a range `A..B`. |
| `rating:` | `rating:>=8.5` | The rating from 1 to 10. Use the same operators as `year:`. |
| `added:` | `added:30d` | Works added to the catalog in the last N days |
| `title:` | `title:"martian"` | Text in the title |
| `plot:` | `plot:"wormhole"` | Text in the plot summary |
| plain word | `ripley` | Text in the title, the plot, or any tag name |

Rules:

- Use quotes when a value contains a space: `genre:"space opera"`.
- Do not put a space after the colon. In `director: ridley`, the filter has no value, and `ridley` becomes a plain word.
- Tag filters (`format` to `language`) must match the full tag name. Letter case does not matter.
- An unknown filter or a value that is not valid gives zero results. This shows a typing error immediately.

## Keyboard

| Key | Action |
|---|---|
| <kbd>↑</kbd> <kbd>↓</kbd> | Move through the suggestions |
| <kbd>Enter</kbd> | Use the selected suggestion. If you did not select a suggestion, run the search. |
| <kbd>Tab</kbd> | Use the selected suggestion |
| <kbd>Esc</kbd> | Close the suggestions |

## Run locally

You need Node.js 22 or later.

1. Clone the repository:
   ```bash
   git clone https://github.com/taetrus/s.search.git
   cd s.search
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the URL that the server shows, usually http://localhost:5173/.

To open the app from other devices on your network, use `npm run dev -- --host 0.0.0.0`.

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Start the development server with live reload |
| `npm run build` | Check the types, then build the site into `dist/` |
| `npm run preview` | Serve the `dist/` build locally |
| `npm run lint` | Run oxlint |
| `npx vitest run` | Run all tests |
| `npx vitest run src/search/query.test.ts` | Run the tests in one file |

## How it works

The text in the search box is the only state. The app reads it again after each change:

1. `src/search/query.ts` splits the text into tokens and finds the token at the cursor.
2. `src/search/SearchBox.tsx` shows suggestions for that token only.
3. When you select a suggestion, the app replaces that token in the text.
4. When you run the search, `parseQuery` converts the text into filters and words.
5. `src/search/worksApi.ts` checks each work against all filters and words.

The tag suggestions and the search use the same data and the same matching code. Thus the number next to a tag always equals the number of results for that tag.

`src/search/tagApi.ts` and `src/search/worksApi.ts` are local functions. To use a real server, replace the body of `searchTags` and `searchWorks` with `fetch` calls.

## Deployment

Each push to `main` starts the workflow in `.github/workflows/deploy.yml`. The workflow runs the tests, the linter, and the build. If all three pass, it publishes `dist/` to GitHub Pages. If one step fails, the live site does not change.

## Credits

The catalog uses the titles, names, and dates of real works for demonstration only. The plot summaries are short original descriptions.
