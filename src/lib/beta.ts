// Beta-phase controls. All env-driven so you can flip the app in/out of beta
// (and open/close the invite gate) from Vercel without a code change.

// Whether the app is in beta mode (badge, banner, notices, welcome). ON by
// default; set NEXT_PUBLIC_BETA="0" to turn everything off at full launch.
export function isBeta(): boolean {
  return process.env.NEXT_PUBLIC_BETA !== "0";
}

// Whether signup requires an invite code. True only when BETA_INVITE_CODE is set.
export function betaInviteRequired(): boolean {
  return !!(process.env.BETA_INVITE_CODE && process.env.BETA_INVITE_CODE.trim());
}

// Validate a submitted invite code (case-insensitive, trimmed).
// If no code is configured, the gate is open and any value passes.
export function checkBetaCode(code: unknown): boolean {
  const required = process.env.BETA_INVITE_CODE?.trim();
  if (!required) return true;
  return typeof code === "string" && code.trim().toLowerCase() === required.toLowerCase();
}
