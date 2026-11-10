import { describe, expect, it } from "vitest";
import { WORKS } from "../data/works";
import { parseQuery } from "./query";
import { filterWorks } from "./worksApi";

const NOW = new Date("2026-11-10");
const titles = (query: string) => filterWorks(WORKS, parseQuery(query), NOW).map((w) => `${w.title} (${w.year})`);

describe("filterWorks", () => {
  it("finds every work by a director", () => {
    expect(titles('director:"ridley scott"')).toEqual(["Alien (1979)", "Blade Runner (1982)", "The Martian (2015)"]);
  });

  it("combines filters with AND", () => {
    expect(titles('director:"ridley scott" genre:cyberpunk')).toEqual(["Blade Runner (1982)"]);
    expect(titles('author:"andy weir" format:book')).toEqual(["The Martian (2011)"]);
  });

  it("matches tag names case-insensitively", () => {
    expect(titles("Series:ALIEN")).toEqual(["Alien (1979)", "Aliens (1986)"]);
  });

  it("supports number comparisons and ranges", () => {
    expect(titles("director:\"james cameron\" year:>1985")).toEqual([
      "Terminator 2: Judgment Day (1991)",
      "Aliens (1986)",
    ]);
    expect(titles("format:book year:1960..1969 rating:>=8.4")).toEqual([
      "Dune (1965)",
      "The Left Hand of Darkness (1969)",
    ]);
  });

  it("filters by days since added", () => {
    expect(titles("added:7d")).toEqual(["The Expanse (2015)", "Leviathan Wakes (2011)"]);
    // Blade Runner was added 8 days before NOW: the boundary day counts.
    expect(titles("added:8d")).toContain("Blade Runner (1982)");
  });

  it("searches title and plot text", () => {
    expect(titles('title:"martian"')).toEqual(["The Martian (2011)", "The Martian (2015)"]);
    expect(titles('plot:"wormhole"')).toEqual(["Interstellar (2014)"]);
  });

  it("matches plain words against title, plot and tags", () => {
    expect(titles("ripley")).toEqual(["Alien (1979)", "Aliens (1986)"]);
  });

  it("returns nothing for unknown fields or bad values", () => {
    expect(titles("studio:pixar")).toEqual([]);
    expect(titles("year:soon")).toEqual([]);
  });
});
