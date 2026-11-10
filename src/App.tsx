import { useState } from "react";
import type { Work } from "./data/works";
import { SearchBox } from "./search/SearchBox";
import type { ParsedQuery } from "./search/query";
import { searchWorks } from "./search/worksApi";
import "./App.css";

interface SearchResult {
  raw: string;
  parsed: ParsedQuery;
  works: Work[];
}

export default function App() {
  const [result, setResult] = useState<SearchResult | null>(null);

  const onSearch = async (parsed: ParsedQuery, raw: string) => {
    setResult({ raw, parsed, works: await searchWorks(parsed) });
  };

  return (
    <main className="app">
      <SearchBox onSearch={onSearch} />
      {result && (
        <section>
          <p className="app-summary">
            {result.works.length} result{result.works.length === 1 ? "" : "s"} for <code>{result.raw.trim() || "everything"}</code>
          </p>
          <ul className="app-results">
            {result.works.map((w) => (
              <WorkCard key={w.id} work={w} />
            ))}
          </ul>
          <details className="app-debug">
            <summary>Parsed query</summary>
            <pre>{JSON.stringify(result.parsed, null, 2)}</pre>
          </details>
        </section>
      )}
    </main>
  );
}

function WorkCard({ work }: { work: Work }) {
  const credits = [
    work.directors.length ? `dir. ${work.directors.join(", ")}` : "",
    work.authors.length ? `by ${work.authors.join(", ")}` : "",
  ].filter(Boolean);

  return (
    <li className="card">
      <div className="card-head">
        <span className="sb-badge sb-badge-format">{work.format}</span>
        <strong>{work.title}</strong>
        <span className="card-muted">{work.year}</span>
        <span className="card-rating">★ {work.rating.toFixed(1)}</span>
      </div>
      {credits.length > 0 && <div className="card-muted card-credits">{credits.join(" · ")}</div>}
      <p className="card-plot">{work.plot}</p>
      <div className="card-tags">
        {[work.series, ...work.genres].filter(Boolean).map((t) => (
          <span key={t} className="card-tag">
            {t}
          </span>
        ))}
      </div>
    </li>
  );
}
