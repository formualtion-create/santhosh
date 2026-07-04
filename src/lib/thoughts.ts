// Original PawsPair copy — love & care affirmations. Shared by the popup and the push sender.
export const SLOGAN = "Love has paws. Care has a heartbeat.";

export const THOUGHTS = [
  "A gentle hand and a kind word can change an animal's whole world today.",
  "The love you give your pet returns tenfold — on four soft paws.",
  "Adopt patience, offer kindness, and every creature blooms in safety.",
  "Be the calm in your companion's day, and they'll be the joy in yours.",
  "Small acts of care — fresh water, a warm word, a gentle pat — are love in motion.",
  "Animals never count your flaws; they count the moments you show up.",
  "Kindness to a creature who can't thank you is the purest kind there is.",
  "Let your pet teach you to live fully in this single, ordinary moment.",
  "Every life you treat tenderly makes the whole world a little softer.",
  "Love isn't loud — it's the quiet promise to care, every single day.",
  "Hold space for the voiceless; their trust is a gift, never a given.",
  "A wagging tail is proof that love, freely given, is always returned.",
  "Care for your companion's body and heart — both remember your kindness.",
  "Be someone's safe place today — paw, hoof, fin or friend.",
];

export function dayIndex(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

export function dayThought(d = new Date()) {
  return THOUGHTS[dayIndex(d) % THOUGHTS.length];
}
