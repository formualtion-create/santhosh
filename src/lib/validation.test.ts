import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema } from "./validation";

const valid = {
  email: "test@example.com",
  password: "supersecret",
  ownerName: "Ananya Rao",
  phone: "+919876543210",
  city: "Bengaluru",
  lat: "12.9716",
  lng: "77.5946",
  kycDocType: "AADHAAR",
  kycDocLast4: "1234",
  petName: "Simba",
  species: "DOG",
  ageBand: "YOUNG",
  gender: "MALE",
  energy: "HIGH",
  intent: "PLAYDATE",
  consentDPDP: "on",
  acceptTerms: "on",
  acceptDeclaration: "on",
};

describe("signupSchema", () => {
  it("accepts a well-formed payload and coerces lat/lng to numbers", () => {
    const r = signupSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.lat).toBeCloseTo(12.9716);
      expect(r.data.lng).toBeCloseTo(77.5946);
    }
  });

  it("rejects an invalid email", () => {
    expect(signupSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("rejects a short password", () => {
    expect(signupSchema.safeParse({ ...valid, password: "short" }).success).toBe(false);
  });

  it("trims and requires a real owner name", () => {
    expect(signupSchema.safeParse({ ...valid, ownerName: " A " }).success).toBe(false);
  });

  it("rejects an out-of-range latitude", () => {
    expect(signupSchema.safeParse({ ...valid, lat: "200" }).success).toBe(false);
  });

  it("requires consent, terms and declaration", () => {
    expect(signupSchema.safeParse({ ...valid, consentDPDP: "" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...valid, acceptTerms: undefined }).success).toBe(false);
    expect(signupSchema.safeParse({ ...valid, acceptDeclaration: "no" }).success).toBe(false);
  });

  it("normalises a phone number and rejects a too-short one", () => {
    const ok = signupSchema.safeParse({ ...valid, phone: "98765 43210" });
    expect(ok.success).toBe(true);
    expect(signupSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
  });

  it("requires a non-empty pet name", () => {
    expect(signupSchema.safeParse({ ...valid, petName: "   " }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts an email + non-empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });
  it("rejects a bad email or empty password", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});
