import { describe, expect, it } from "vitest";
import { formatFilter, parseQuery, replaceToken, tokenAt, tokenize } from "./query";

describe("tokenize", () => {
  it("splits filters, quoted filters, quoted text and bare words", () => {
    expect(tokenize('title:"dune" scott genre:cyberpunk "space opera"')).toEqual([
      { start: 0, end: 12, field: "title", value: "dune" },
      { start: 13, end: 18, value: "scott" },
      { start: 19, end: 34, field: "genre", value: "cyberpunk" },
      { start: 35, end: 48, value: "space opera" },
    ]);
  });

  it("accepts an unclosed quote while typing", () => {
    expect(tokenize('title:"dun')).toEqual([{ start: 0, end: 10, field: "title", value: "dun" }]);
  });

  it("lowercases field names", () => {
    expect(tokenize("Genre:cyberpunk")[0].field).toBe("genre");
  });
});

describe("tokenAt", () => {
  const q = 'title:"dune" scott';

  it("returns the token under the cursor", () => {
    expect(tokenAt(q, q.length).value).toBe("scott");
    expect(tokenAt(q, 3).field).toBe("title");
  });

  it("returns an empty token in whitespace", () => {
    expect(tokenAt("a  b", 2)).toEqual({ start: 2, end: 2, value: "" });
  });
});

describe("replaceToken", () => {
  it("replaces only the active token and puts the cursor after it", () => {
    const q = 'title:"dune" scott';
    const result = replaceToken(q, tokenAt(q, q.length), 'director:"ridley scott"');
    expect(result).toEqual({ query: 'title:"dune" director:"ridley scott" ', cursor: 37 });
  });

  it("works in the middle of the query", () => {
    const q = "eng scott";
    const result = replaceToken(q, tokenAt(q, 2), "language:english");
    expect(result).toEqual({ query: "language:english scott", cursor: 17 });
  });

  it("can insert a field prefix with the caret after the colon", () => {
    const q = "format:book ";
    const result = replaceToken(q, tokenAt(q, q.length), "genre:", { trailingSpace: false });
    expect(result).toEqual({ query: "format:book genre:", cursor: 18 });
  });

  it("can put the caret inside quotes, and keeps a space before following text", () => {
    const q = "ti scott";
    const result = replaceToken(q, tokenAt(q, 2), 'title:""', { trailingSpace: false, caret: 7 });
    expect(result).toEqual({ query: 'title:"" scott', cursor: 7 });
  });
});

describe("formatFilter", () => {
  it("quotes values with spaces", () => {
    expect(formatFilter("genre", "space opera")).toBe('genre:"space opera"');
    expect(formatFilter("format", "movie")).toBe("format:movie");
  });
});

describe("parseQuery", () => {
  it("separates filters from free text", () => {
    expect(parseQuery('format:book genre:"time travel" robots')).toEqual({
      filters: [
        { field: "format", value: "book" },
        { field: "genre", value: "time travel" },
      ],
      text: ["robots"],
    });
  });
});
