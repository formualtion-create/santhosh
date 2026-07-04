import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { csvCell } from "@/lib/security";

// Admin-only CSV export of the full activity/data-collection log.
export async function GET() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const events = await prisma.event.findMany({ orderBy: { createdAt: "desc" }, take: 5000 });
  const header = ["Time", "Type", "User", "Meta"];
  const rows = events.map((e) =>
    [e.createdAt.toISOString(), e.type, e.userId || "—", e.meta || ""].map(csvCell).join(",")
  );
  const csv = [header.map(csvCell).join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="pawspair-activity.csv"',
    },
  });
}
