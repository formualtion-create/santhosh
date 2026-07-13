import { describe, it, expect } from "vitest";
import type { NextRequest } from "next/server";
import { safePath, csvCell, escapeHtml, rateLimit, sameOrigin } from "./security";

// Minimal fake request exposing the headers.get() shape sameOrigin relies on.
function fakeReq(headers: Record<string, string | null>): NextRequest {
  return { headers: { get: (k: string) => headers[k.toLowerCase()] ?? null } } as unknown as NextRequest;
}

describe("safePath (open-redirect guard)", () => {
  it("allows plain root-relative paths", () => {
    expect(safePath("/dashboard")).toBe("/dashboard");
    expect(safePath("/chat/abc?x=1")).toBe("/chat/abc?x=1");
  });
  it("falls back for empty / non-string input", () => {
    expect(safePath("")).toBe("/dashboard");
    expect(safePath(undefined)).toBe("/dashboard");
    expect(safePath(123)).toBe("/dashboard");
    expect(safePath("relative")).toBe("/dashboard");
  });
  it("blocks absolute and protocol-relative URLs", () => {
    expect(safePath("https://evil.com")).toBe("/dashboard");
    expect(safePath("//evil.com")).toBe("/dashboard");
    expect(safePath("/\\evil.com")).toBe("/dashboard");
  });
  it("blocks control characters and backslashes", () => {
    expect(safePath("/foo\\bar")).toBe("/dashboard");
    expect(safePath("/foo\x00bar")).toBe("/dashboard");
  });
  it("honours a custom fallback", () => {
    expect(safePath("nope", "/home")).toBe("/home");
  });
});

describe("csvCell (CSV-injection neutralisation)", () => {
  it("quotes normal values", () => {
    expect(csvCell("hello")).toBe('"hello"');
    expect(csvCell(null)).toBe('""');
    expect(csvCell(42)).toBe('"42"');
  });
  it("prefixes formula-triggering values with a quote", () => {
    expect(csvCell("=SUM(A1)")).toBe(`"'=SUM(A1)"`);
    expect(csvCell("+1")).toBe(`"'+1"`);
    expect(csvCell("-1")).toBe(`"'-1"`);
    expect(csvCell("@cmd")).toBe(`"'@cmd"`);
  });
  it("escapes embedded double quotes", () => {
    expect(csvCell('a "b" c')).toBe('"a ""b"" c"');
  });
});

describe("escapeHtml", () => {
  it("escapes all five entities", () => {
    expect(escapeHtml(`<b>"x" & 'y'</b>`)).toBe("&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;");
  });
  it("stringifies null/undefined to empty", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });
});

describe("rateLimit", () => {
  it("allows up to the limit then blocks within the window", () => {
    const key = "test:" + Math.random();
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(false);
  });
  it("resets after the window elapses", () => {
    const key = "test:" + Math.random();
    expect(rateLimit(key, 1, 1)).toBe(true);
    expect(rateLimit(key, 1, 1)).toBe(false);
    // window of 1ms has elapsed by the next tick
    return new Promise<void>((resolve) => setTimeout(() => {
      expect(rateLimit(key, 1, 1)).toBe(true);
      resolve();
    }, 5));
  });
});

describe("sameOrigin (CSRF defence)", () => {
  it("passes when Origin is absent", () => {
    expect(sameOrigin(fakeReq({ host: "pawspair.vercel.app" }))).toBe(true);
  });
  it("passes when Origin host matches Host", () => {
    expect(sameOrigin(fakeReq({ origin: "https://pawspair.vercel.app", host: "pawspair.vercel.app" }))).toBe(true);
  });
  it("fails on a cross-origin request", () => {
    expect(sameOrigin(fakeReq({ origin: "https://evil.com", host: "pawspair.vercel.app" }))).toBe(false);
  });
  it("fails on a malformed Origin", () => {
    expect(sameOrigin(fakeReq({ origin: "not a url", host: "pawspair.vercel.app" }))).toBe(false);
  });
});
