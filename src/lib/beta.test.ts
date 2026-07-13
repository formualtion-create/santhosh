import { describe, it, expect, afterEach } from "vitest";
import { isBeta, betaInviteRequired, checkBetaCode } from "./beta";

const ORIGINAL = { ...process.env };
afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe("isBeta", () => {
  it("defaults to true when the flag is unset", () => {
    delete process.env.NEXT_PUBLIC_BETA;
    expect(isBeta()).toBe(true);
  });
  it("is false only when explicitly '0'", () => {
    process.env.NEXT_PUBLIC_BETA = "0";
    expect(isBeta()).toBe(false);
    process.env.NEXT_PUBLIC_BETA = "1";
    expect(isBeta()).toBe(true);
  });
});

describe("betaInviteRequired", () => {
  it("is false when no code is configured", () => {
    delete process.env.BETA_INVITE_CODE;
    expect(betaInviteRequired()).toBe(false);
  });
  it("is false for a blank/whitespace code", () => {
    process.env.BETA_INVITE_CODE = "   ";
    expect(betaInviteRequired()).toBe(false);
  });
  it("is true when a real code is set", () => {
    process.env.BETA_INVITE_CODE = "PAWS2026";
    expect(betaInviteRequired()).toBe(true);
  });
});

describe("checkBetaCode", () => {
  it("opens the gate when no code is configured", () => {
    delete process.env.BETA_INVITE_CODE;
    expect(checkBetaCode("anything")).toBe(true);
    expect(checkBetaCode(undefined)).toBe(true);
  });
  it("matches case-insensitively and trims", () => {
    process.env.BETA_INVITE_CODE = "PAWS2026";
    expect(checkBetaCode("paws2026")).toBe(true);
    expect(checkBetaCode("  PAWS2026 ")).toBe(true);
    expect(checkBetaCode("wrong")).toBe(false);
    expect(checkBetaCode(42)).toBe(false);
    expect(checkBetaCode(null)).toBe(false);
  });
});
