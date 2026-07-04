import { NextRequest, NextResponse } from "next/server";

// --- In-memory rate limiter (per-instance; use Redis for multi-instance prod) ---
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 8, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

// --- CSRF defence-in-depth: same-origin check on state-changing requests ---
// (sameSite=lax cookies already block cross-site POSTs; this is belt-and-braces.)
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin form posts may omit Origin in some browsers
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export function tooMany(req: NextRequest, redirectTo: string, msg = "Too many attempts. Please wait a minute.") {
  return NextResponse.redirect(new URL(redirectTo + "?error=" + encodeURIComponent(msg), req.url), 303);
}

// --- Open-redirect guard ---
// Only allow same-site, single-leading-slash paths. Rejects absolute URLs,
// protocol-relative ("//evil.com"), backslash tricks ("/\evil.com") and
// control characters, falling back to a safe default.
export function safePath(input: unknown, fallback = "/dashboard"): string {
  const v = typeof input === "string" ? input.trim() : "";
  if (!v) return fallback;
  if (!v.startsWith("/")) return fallback; // must be a root-relative path
  if (v.startsWith("//") || v.startsWith("/\\")) return fallback; // protocol-relative / UNC
  if (/[\x00-\x1f\\]/.test(v)) return fallback; // control chars or backslashes
  return v;
}

// --- CSV-injection neutralisation ---
// Excel/Sheets execute cells beginning with = + - @ (or tab/CR). Prefix a quote
// so the value is treated as text, then quote-escape for the CSV field.
export function csvCell(value: unknown): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

// --- HTML escaping for values interpolated into email templates ---
export function escapeHtml(value: unknown): string {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
