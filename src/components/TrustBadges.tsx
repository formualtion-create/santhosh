import { getBadges, earnedBadges, trustLevel, TRUST_LEVEL_STYLE } from "@/lib/trust";

type U = Parameters<typeof getBadges>[0];
type P = Parameters<typeof getBadges>[1];

// Compact trust-tier chip (New tier renders nothing).
export function TrustLevelChip({ user, pet }: { user: U; pet?: P }) {
  const level = trustLevel(user, pet);
  if (level === "New") return null;
  const s = TRUST_LEVEL_STYLE[level];
  return <span className={"chip " + s.chip} title={s.blurb}>🛡 {level}</span>;
}

// Row of badges. `showAll` includes not-yet-earned ones (greyed) for the owner's view.
export function BadgeRow({ user, pet, showAll = false }: { user: U; pet?: P; showAll?: boolean }) {
  const badges = showAll ? getBadges(user, pet) : earnedBadges(user, pet);
  if (!badges.length) return null;
  return (
    <div className="tbadges">
      {badges.map((b) => (
        <span key={b.key} className={"tbadge" + (b.earned ? " on" : "")} title={b.earned ? b.desc : "Not verified yet"}>
          <span aria-hidden>{b.icon}</span> {b.short}{b.earned ? " ✓" : ""}
        </span>
      ))}
    </div>
  );
}
