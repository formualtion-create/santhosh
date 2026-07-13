import { describe, it, expect } from "vitest";
import { compatibility, neutralScore, type PetAttrs } from "./match";

const base: PetAttrs = {
  species: "DOG", energy: "MEDIUM", size: "MEDIUM", ageBand: "YOUNG",
  intent: "PLAYDATE", gender: "MALE", vaccinated: true, neutered: false,
  interests: "fetch, walks", healthVerified: true,
};

describe("compatibility", () => {
  it("clamps the score to the 40–99 range", () => {
    const worst = compatibility(
      { ...base, species: "CAT", energy: "LOW", size: "SMALL", ageBand: "SENIOR", intent: "PLAYDATE", interests: "" },
      { ...base, species: "DOG", energy: "HIGH", size: "LARGE", ageBand: "PUPPY", intent: "FRIENDSHIP", vaccinated: false, interests: "" },
      500
    );
    expect(worst.score).toBeGreaterThanOrEqual(40);
    expect(worst.score).toBeLessThanOrEqual(99);
  });

  it("scores an identical, nearby pet very highly", () => {
    const { score, reasons } = compatibility(base, { ...base }, 2);
    expect(score).toBeGreaterThanOrEqual(90);
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons.length).toBeLessThanOrEqual(4);
  });

  it("surfaces shared-energy and proximity reasons", () => {
    const { reasons } = compatibility(base, { ...base }, 3);
    expect(reasons.join(" ")).toMatch(/balanced/i);
    expect(reasons.join(" ")).toMatch(/km away/i);
  });

  it("penalises same-sex pairs when family planning is the intent", () => {
    const breeding = { ...base, intent: "BREEDING" };
    const oppositeSex = compatibility(breeding, { ...base, intent: "BREEDING", gender: "FEMALE" }, 5).score;
    const sameSex = compatibility(breeding, { ...base, intent: "BREEDING", gender: "MALE" }, 5).score;
    expect(sameSex).toBeLessThan(oppositeSex);
  });

  it("flags a vet check when a breeding candidate is not health-verified", () => {
    const { reasons } = compatibility(
      { ...base, intent: "BREEDING" },
      { ...base, intent: "BREEDING", gender: "FEMALE", healthVerified: false },
      4
    );
    expect(reasons.join(" ")).toMatch(/vet health check/i);
  });

  it("is deterministic (no randomness)", () => {
    const a = compatibility(base, { ...base }, 7);
    const b = compatibility(base, { ...base }, 7);
    expect(a).toEqual(b);
  });
});

describe("neutralScore", () => {
  it("is deterministic and within 70–89", () => {
    for (const seed of ["abc", "pet-123", "", "🐾"]) {
      const n = neutralScore(seed);
      expect(n).toBe(neutralScore(seed));
      expect(n).toBeGreaterThanOrEqual(70);
      expect(n).toBeLessThanOrEqual(89);
    }
  });
});
