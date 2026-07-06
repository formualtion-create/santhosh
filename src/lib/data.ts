import { prisma } from "./db";
import { distanceKm } from "./geo";
import { compatibility, neutralScore, type PetAttrs } from "./match";

export type Filters = {
  species?: string;
  intent?: string;
  energy?: string;
  maxKm?: number;
  q?: string;
  sort?: string; // score | distance | newest
};

// Owner verification fields needed to render trust badges on cards/profiles.
const OWNER_VERIFY_SELECT = {
  id: true, ownerName: true, city: true,
  emailVerified: true, phoneVerified: true, kycStatus: true,
  selfieVerified: true, locationVerified: true, socialVerified: true,
  photoPrivacy: true, hideExactLocation: true,
} as const;

// Deterministic ~1.5 km jitter so a privacy-protected pin never reveals an exact home.
function fuzzCoord(v: number, seed: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return v + (((h % 300) - 150) / 10000); // ±0.015°
}

async function excludedUserIds(viewerId: string): Promise<Set<string>> {
  const [blocksMade, blocksGot] = await Promise.all([
    prisma.block.findMany({ where: { blockerId: viewerId }, select: { blockedId: true } }),
    prisma.block.findMany({ where: { blockedId: viewerId }, select: { blockerId: true } }),
  ]);
  return new Set([...blocksMade.map((b) => b.blockedId), ...blocksGot.map((b) => b.blockerId)]);
}

export async function getDiscoverPets(
  viewer: { id: string; lat: number | null; lng: number | null },
  f: Filters,
  opts: { excludeActed?: boolean } = { excludeActed: true }
) {
  const [acted, blocked] = await Promise.all([
    opts.excludeActed
      ? prisma.like.findMany({ where: { fromUserId: viewer.id }, select: { toPetId: true } })
      : Promise.resolve([] as { toPetId: string }[]),
    excludedUserIds(viewer.id),
  ]);
  const actedPetIds = new Set(acted.map((a) => a.toPetId));

  // The viewer's own pet drives the compatibility score.
  const myPet = await prisma.pet.findFirst({
    where: { userId: viewer.id },
    select: { species: true, energy: true, size: true, ageBand: true, intent: true, gender: true, vaccinated: true, neutered: true, interests: true, healthVerified: true },
  });

  const pets = await prisma.pet.findMany({
    where: {
      user: { kycStatus: "VERIFIED", bannedAt: null },
      userId: { not: viewer.id },
      ...(f.species ? { species: f.species } : {}),
      ...(f.intent ? { OR: [{ intent: f.intent }, { intent: "ALL" }] } : {}),
      ...(f.energy ? { energy: f.energy } : {}),
    },
    include: { user: { select: OWNER_VERIFY_SELECT } },
    orderBy: { createdAt: "desc" },
  });

  const vLat = viewer.lat ?? 12.9716;
  const vLng = viewer.lng ?? 77.5946;

  let rows = pets
    .filter((p) => !actedPetIds.has(p.id) && !blocked.has(p.userId))
    .map((p) => {
      const realDist = distanceKm(vLat, vLng, p.lat, p.lng);
      const approx = !!p.user.hideExactLocation;
      const them: PetAttrs = { species: p.species, energy: p.energy, size: p.size, ageBand: p.ageBand, intent: p.intent, gender: p.gender, vaccinated: p.vaccinated, neutered: p.neutered, interests: p.interests, healthVerified: p.healthVerified };
      const comp = myPet ? compatibility(myPet as PetAttrs, them, realDist) : { score: neutralScore(viewer.id + p.id), reasons: [] };
      return {
        id: p.id,
        name: p.name,
        species: p.species,
        breed: p.breed,
        ageBand: p.ageBand,
        energy: p.energy,
        intent: p.intent,
        bio: p.bio,
        interests: p.interests,
        favActivity: p.favActivity,
        photoUrl: p.photoUrl,
        vaccinated: p.vaccinated,
        healthVerified: p.healthVerified,
        microchipVerified: p.microchipVerified,
        city: p.city,
        // Privacy: jitter the pin and band the distance when the owner hides exact location.
        lat: approx ? fuzzCoord(p.lat, p.id, 1) : p.lat,
        lng: approx ? fuzzCoord(p.lng, p.id, 7) : p.lng,
        approxLocation: approx,
        photoBlurred: p.user.photoPrivacy === "MATCHED",
        ownerId: p.user.id,
        owner: p.user.ownerName,
        ownerVerify: p.user,
        createdAt: p.createdAt,
        distanceKm: approx ? Math.max(5, Math.round(realDist / 5) * 5) : Math.round(realDist),
        score: comp.score,
        reasons: comp.reasons,
      };
    });

  if (f.q) {
    const q = f.q.toLowerCase();
    rows = rows.filter(
      (r) => r.name.toLowerCase().includes(q) || (r.breed || "").toLowerCase().includes(q) || r.city.toLowerCase().includes(q)
    );
  }
  if (f.maxKm) rows = rows.filter((r) => r.distanceKm <= f.maxKm!);

  if (f.sort === "distance") rows.sort((a, b) => a.distanceKm - b.distanceKm);
  else if (f.sort === "newest") rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  else rows.sort((a, b) => b.score - a.score);

  return rows;
}

export async function pawOfTheDay(viewer: { id: string; lat: number | null; lng: number | null }) {
  const rows = await getDiscoverPets(viewer, { sort: "score" });
  return rows[0] || null;
}

export async function getPet(id: string) {
  return prisma.pet.findUnique({
    where: { id },
    include: { user: { select: OWNER_VERIFY_SELECT } },
  });
}

// Are these two users a mutual match? (used to lift photo privacy)
export async function areMatched(userA: string, userB: string): Promise<boolean> {
  const [a, b] = [userA, userB].sort();
  const m = await prisma.match.findUnique({ where: { userAId_userBId: { userAId: a, userBId: b } } });
  return !!m;
}

// The match id between two users (for linking straight to their chat), or null.
export async function getMatchId(userA: string, userB: string): Promise<string | null> {
  const [a, b] = [userA, userB].sort();
  const m = await prisma.match.findUnique({ where: { userAId_userBId: { userAId: a, userBId: b } }, select: { id: true } });
  return m?.id ?? null;
}

// Reputation: average rating + count for a member.
export async function getReputation(userId: string): Promise<{ avg: number; count: number }> {
  const agg = await prisma.review.aggregate({ where: { subjectId: userId }, _avg: { rating: true }, _count: true });
  return { avg: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0, count: agg._count };
}

// Recent reviews written about a member, with the author's name + pet.
export async function getReviews(userId: string, take = 10) {
  return prisma.review.findMany({
    where: { subjectId: userId },
    orderBy: { createdAt: "desc" },
    take,
    include: { author: { select: { ownerName: true, pets: { take: 1, select: { name: true } } } } },
  });
}

// Record a swipe; returns whether it created a mutual match.
export async function recordSwipe(fromUserId: string, toPetId: string, action: "LIKE" | "PASS") {
  const pet = await prisma.pet.findUnique({ where: { id: toPetId }, select: { userId: true } });
  if (!pet) return { ok: false as const };
  const toUserId = pet.userId;
  if (toUserId === fromUserId) return { ok: false as const };

  await prisma.like.upsert({
    where: { fromUserId_toPetId: { fromUserId, toPetId } },
    create: { fromUserId, toPetId, toUserId, action },
    update: { action },
  });

  if (action !== "LIKE") return { ok: true as const, matched: false };

  // mutual? did the target ever LIKE one of my pets?
  const reciprocal = await prisma.like.findFirst({
    where: { fromUserId: toUserId, toUserId: fromUserId, action: "LIKE" },
  });
  if (!reciprocal) return { ok: true as const, matched: false };

  const [a, b] = [fromUserId, toUserId].sort();
  const match = await prisma.match.upsert({
    where: { userAId_userBId: { userAId: a, userBId: b } },
    create: { userAId: a, userBId: b },
    update: {},
  });
  return { ok: true as const, matched: true, matchId: match.id };
}

export async function getMatches(userId: string) {
  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: { createdAt: "desc" },
  });
  const results = [];
  for (const m of matches) {
    const otherId = m.userAId === userId ? m.userBId : m.userAId;
    const other = await prisma.user.findUnique({
      where: { id: otherId },
      select: { id: true, ownerName: true, bannedAt: true, pets: { take: 1, select: { name: true, photoUrl: true, species: true } } },
    });
    if (!other || other.bannedAt) continue;
    const last = await prisma.message.findFirst({ where: { matchId: m.id }, orderBy: { createdAt: "desc" } });
    results.push({ matchId: m.id, other, lastMessage: last });
  }
  return results;
}

export async function getMatchThread(matchId: string, userId: string) {
  const m = await prisma.match.findUnique({ where: { id: matchId } });
  if (!m || (m.userAId !== userId && m.userBId !== userId)) return null;
  const otherId = m.userAId === userId ? m.userBId : m.userAId;
  const [other, messages] = await Promise.all([
    prisma.user.findUnique({ where: { id: otherId }, select: { id: true, ownerName: true, pets: { take: 1, select: { name: true, photoUrl: true } } } }),
    prisma.message.findMany({ where: { matchId }, orderBy: { createdAt: "asc" } }),
  ]);
  return { match: m, other, messages };
}
