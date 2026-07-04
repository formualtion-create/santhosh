import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE = "pawspair_session";
const PENDING = "pawspair_pending"; // half-authenticated: password OK, awaiting login OTP

// Fail closed: never sign sessions with a guessable default in production.
function resolveSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to a strong value (>=32 chars) in production.");
  }
  return "dev-secret-please-change-me-32-characters"; // dev/test only
}
const secret = new TextEncoder().encode(resolveSecret());

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  (await cookies()).set(COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.uid as string) || null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const uid = await getSessionUserId();
  if (!uid) return null;
  return prisma.user.findUnique({ where: { id: uid }, include: { pets: true } });
}

// --- Login two-factor (email OTP) ---
// A "pending login" proves the password was correct but the emailed code is not
// yet entered. It is NOT a session: it grants no access to protected pages —
// only the right to submit a code at /verify-email. Short-lived (15 min).
export async function createPendingLogin(userId: string) {
  const token = await new SignJWT({ uid: userId, stage: "login-otp" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);

  (await cookies()).set(PENDING, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });
}

export async function destroyPendingLogin() {
  (await cookies()).set(PENDING, "", { path: "/", maxAge: 0 });
}

export async function getPendingLoginUserId(): Promise<string | null> {
  const token = (await cookies()).get(PENDING)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.stage === "login-otp" ? ((payload.uid as string) || null) : null;
  } catch {
    return null;
  }
}
