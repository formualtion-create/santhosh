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

// A shareable public-beta code, baked into the invite link so a broadcast (e.g.
// WhatsApp) lets people join in one click. Kept alongside the private
// BETA_INVITE_CODE so the gate still deters bots and stays a kill-switch:
// remove this constant (or the env var) to close public signups instantly.
export const PUBLIC_BETA_CODE = "PAWSBETA";

// Validate a submitted invite code (case-insensitive, trimmed).
// Passes if it matches the public code OR the configured private code.
// If no private code is configured, the gate is open and any value passes.
export function checkBetaCode(code: unknown): boolean {
  const submitted = typeof code === "string" ? code.trim().toLowerCase() : "";
  if (submitted && submitted === PUBLIC_BETA_CODE.toLowerCase()) return true;
  const required = process.env.BETA_INVITE_CODE?.trim();
  if (!required) return true;
  return submitted !== "" && submitted === required.toLowerCase();
}
