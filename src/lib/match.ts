// Compatibility engine — PawsPair's answer to BharatMatrimony's AstroMatch.
// Deterministic 0–100 score between the viewer's pet and a candidate, with a
// short, human "why you match" breakdown. No randomness.

export type PetAttrs = {
  species: string;
  energy: string;
  size?: string | null;
  ageBand: string;
  intent: string;
  gender: string;
  vaccinated?: boolean;
  neutered?: boolean;
  interests?: string | null;
  healthVerified?: boolean;
};

const ENERGY_ORD: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };
const SIZE_ORD: Record<string, number> = { SMALL: 0, MEDIUM: 1, LARGE: 2 };
const AGE_ORD: Record<string, number> = { PUPPY: 0, YOUNG: 1, ADULT: 2, SENIOR: 3 };

function sharedInterests(a?: string | null, b?: string | null): string[] {
  if (!a || !b) return [];
  const norm = (s: string) => s.toLowerCase().trim();
  const setA = new Set(a.split(",").map(norm).filter(Boolean));
  return b.split(",").map((s) => s.trim()).filter((x) => x && setA.has(norm(x)));
}

export function compatibility(me: PetAttrs, them: PetAttrs, distanceKm: number): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Intent alignment (25)
  const familyPlanning = me.intent === "BREEDING" || them.intent === "BREEDING";
  score += me.intent === them.intent || me.intent === "ALL" || them.intent === "ALL" ? 25 : 12;

  // Species (15)
  score += me.species === them.species ? 15 : 4;

  // Energy (15)
  const ed = Math.abs((ENERGY_ORD[me.energy] ?? 1) - (ENERGY_ORD[them.energy] ?? 1));
  score += ed === 0 ? 15 : ed === 1 ? 9 : 3;
  if (ed === 0) reasons.push(`Both ${me.energy === "HIGH" ? "high-energy" : me.energy === "LOW" ? "calm" : "balanced"}`);

  // Size (10)
  const sd = me.size && them.size ? Math.abs((SIZE_ORD[me.size] ?? 1) - (SIZE_ORD[them.size] ?? 1)) : 1;
  score += sd === 0 ? 10 : sd === 1 ? 6 : 2;

  // Proximity (15) — linear decay to 0 by ~50 km
  score += Math.max(0, Math.round(15 - Math.min(15, (distanceKm / 50) * 15)));
  if (distanceKm <= 10) reasons.push(`Just ${Math.max(1, Math.round(distanceKm))} km away`);

  // Health (10)
  if (me.vaccinated && them.vaccinated) { score += 10; reasons.push("Both vaccinated"); }
  else if (them.vaccinated) score += 5;

  // Age band (5)
  const ad = Math.abs((AGE_ORD[me.ageBand] ?? 1) - (AGE_ORD[them.ageBand] ?? 1));
  score += ad === 0 ? 5 : ad === 1 ? 3 : 1;

  // Shared interests (5)
  const shared = sharedInterests(me.interests, them.interests);
  if (shared.length) { score += Math.min(5, shared.length * 2); reasons.push(`Loves ${shared.slice(0, 2).join(" & ")}`); }

  // Family-planning rules: opposite sex, same species; nudge a vet health check.
  if (familyPlanning) {
    const ok = me.gender && them.gender && me.gender !== them.gender && me.species === them.species;
    if (ok) reasons.unshift("Family-planning compatible");
    else { score = Math.round(score * 0.6); reasons.unshift("Not ideal for family planning"); }
    // Keep the vet-check advisory right behind the headline so the 4-reason cap
    // can't silently drop this safety note on an otherwise strong match.
    if (!them.healthVerified) reasons.splice(1, 0, "Confirm a vet health check first");
  }

  return { score: Math.max(40, Math.min(99, Math.round(score))), reasons: reasons.slice(0, 4) };
}

// Fallback when the viewer has no pet on file yet — keeps the feed usable.
export function neutralScore(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return 70 + (h % 20);
}
