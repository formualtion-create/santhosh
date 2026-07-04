// Trust-badge model — PawsPair's answer to BharatMatrimony's 6-point Trust Badges.
// Each badge proves one thing; documents stay private, only the badge is shown.

export type BadgeKey =
  | "email" | "phone" | "id" | "selfie" | "location" | "social" | "health" | "microchip";

export type Badge = {
  key: BadgeKey;
  label: string;   // full label
  short: string;   // chip text
  icon: string;    // emoji
  group: "owner" | "pet";
  earned: boolean;
  desc: string;    // what it proves (shown to others)
  how: string;     // how to earn it (Verification Center)
};

type UserLike = {
  emailVerified?: boolean; phoneVerified?: boolean; kycStatus?: string;
  selfieVerified?: boolean; locationVerified?: boolean; socialVerified?: boolean;
};
type PetLike = { healthVerified?: boolean; microchipVerified?: boolean } | null;

export function getBadges(user: UserLike, pet?: PetLike): Badge[] {
  return [
    { key: "email", group: "owner", icon: "✉️", short: "Email", label: "Email verified",
      desc: "Email address confirmed", how: "Confirm the 6-digit code we email you.",
      earned: !!user.emailVerified },
    { key: "phone", group: "owner", icon: "📱", short: "Phone", label: "Phone verified",
      desc: "Active, owned mobile number", how: "Enter the code sent to your mobile.",
      earned: !!user.phoneVerified },
    { key: "id", group: "owner", icon: "🪪", short: "ID", label: "Government ID verified",
      desc: "Identity confirmed against a government ID", how: "Verify your Aadhaar / Passport / DL.",
      earned: user.kycStatus === "VERIFIED" },
    { key: "selfie", group: "owner", icon: "🤳", short: "Selfie", label: "Photo verified",
      desc: "A live selfie matched the account owner", how: "Take a quick live selfie to prove it's you.",
      earned: !!user.selfieVerified },
    { key: "location", group: "owner", icon: "📍", short: "Location", label: "Location verified",
      desc: "Home city confirmed", how: "Confirm your current location.",
      earned: !!user.locationVerified },
    { key: "social", group: "owner", icon: "🔗", short: "Social", label: "Social linked",
      desc: "A public social profile is linked", how: "Link your pet's Instagram / Facebook page.",
      earned: !!user.socialVerified },
    { key: "health", group: "pet", icon: "🩺", short: "Health", label: "Health verified",
      desc: "Vaccination / vet record verified", how: "Upload your pet's vet or vaccination certificate.",
      earned: !!pet?.healthVerified },
    { key: "microchip", group: "pet", icon: "🆔", short: "Microchip", label: "Microchip verified",
      desc: "Ownership confirmed via microchip", how: "Add your pet's microchip number.",
      earned: !!pet?.microchipVerified },
  ];
}

export function earnedBadges(user: UserLike, pet?: PetLike): Badge[] {
  return getBadges(user, pet).filter((b) => b.earned);
}

export function trustScore(user: UserLike, pet?: PetLike): number {
  const all = getBadges(user, pet);
  return Math.round((all.filter((b) => b.earned).length / all.length) * 100);
}

export type TrustLevel = "New" | "Verified" | "Trusted" | "Prime";

// Mirrors BharatMatrimony's tiers: ID alone = Verified; ID + breadth = Trusted;
// ID + selfie + phone + a pet badge = Prime (their top "prime" tier).
export function trustLevel(user: UserLike, pet?: PetLike): TrustLevel {
  const earned = earnedBadges(user, pet).map((b) => b.key);
  const has = (k: BadgeKey) => earned.includes(k);
  if (has("id") && has("selfie") && has("phone") && (has("health") || has("microchip"))) return "Prime";
  if (has("id") && earned.length >= 4) return "Trusted";
  if (has("id")) return "Verified";
  return "New";
}

export const TRUST_LEVEL_STYLE: Record<TrustLevel, { chip: string; blurb: string }> = {
  New:      { chip: "honey", blurb: "Getting started" },
  Verified: { chip: "acc",   blurb: "ID-verified member" },
  Trusted:  { chip: "acc",   blurb: "Multiple checks passed" },
  Prime:    { chip: "green", blurb: "Our highest trust tier" },
};
