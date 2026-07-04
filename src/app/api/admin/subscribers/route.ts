import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { csvCell } from "@/lib/security";

// Admin-only CSV export of newsletter subscribers.
export async function GET() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  // csvCell neutralises CSV/formula injection (=,+,-,@) and quote-escapes.
  const header = ["Name", "Email", "Mobile", "Pet type", "Pet name", "Pet age", "Joined"];
  const rows = subs.map((s) =>
    [s.name, s.email, s.mobile, s.species, s.petName, s.petAge, s.createdAt.toISOString()].map(csvCell).join(",")
  );
  const csv = [header.map(csvCell).join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="pawspair-subscribers.csv"',
    },
  });
}
