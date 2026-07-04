import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";

// SIMULATED verification. In production this is a webhook callback from a
// licensed KYC provider (e.g. DigiLocker / Signzy / Hyperverge) after the
// user completes Aadhaar/DigiLocker verification. We never store full IDs.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);
  await prisma.user.update({
    where: { id: uid },
    data: { kycStatus: "VERIFIED", verifiedAt: new Date(), locationVerified: true },
  });
  // Stay in the Verification Center so members can earn more trust badges.
  return NextResponse.redirect(new URL("/verify?done=Government+ID+verified", req.url), 303);
}
