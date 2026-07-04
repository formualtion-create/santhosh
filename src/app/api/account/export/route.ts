import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

// DPDP Act 2023 — right to access / data portability.
export async function GET() {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: uid }, include: { pets: true } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { passwordHash, ...safe } = user as any;
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), data: safe }, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": 'attachment; filename="pawspair-my-data.json"',
    },
  });
}
