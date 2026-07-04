// In-chat scam & abuse scanner. Catches the patterns behind India's most common
// pet/"puppy" scams: moving off-platform, sharing contact info, and asking for
// money up front (advance/deposit/courier fees). Heuristic, intentionally gentle —
// it nudges and flags, it does not block legitimate conversation.

const PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /(?:\+?91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/, reason: "shares a phone number" },
  { re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, reason: "shares an email address" },
  { re: /\b(?:whats\s?app|whatsapp|telegram|signal|snapchat|insta(?:gram)?)\b/i, reason: "moves the chat off PawsPair" },
  { re: /\b(?:upi|g[\-\s]?pay|google\s?pay|phonepe|paytm|ifsc|a\/c|account\s?(?:no|number))\b/i, reason: "mentions a payment channel" },
  { re: /\b(?:advance|deposit|booking\s?(?:amount|fee)|token\s?(?:amount|money)|transfer|send\s?money|pay\s?(?:me|now|first)|courier|shipping\s?(?:fee|charges?)|registration\s?fee)\b/i, reason: "asks for money up front" },
  { re: /https?:\/\/|www\.[a-z0-9-]+\.|[a-z0-9-]+\.(?:com|in|net|xyz|link|shop)\b/i, reason: "shares an external link" },
];

export function scanMessage(text: string): { flagged: boolean; reasons: string[] } {
  const reasons: string[] = [];
  for (const { re, reason } of PATTERNS) {
    if (re.test(text) && !reasons.includes(reason)) reasons.push(reason);
  }
  return { flagged: reasons.length > 0, reasons };
}

// A single short, friendly caution to surface when a message trips the scanner.
export const SCAM_NOTE =
  "Keep chats & any payments on PawsPair. Never pay an advance, deposit or courier fee for a pet you haven't met in person.";
