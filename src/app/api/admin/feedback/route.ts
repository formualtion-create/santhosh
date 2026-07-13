import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { csvCell } from "@/lib/security";

// Admin-only CSV export of beta feedback.
export async function GET() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const items = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" }, take: 5000 });
  const header = ["Time", "Category", "Rating", "Status", "Page", "User", "Email", "Message"];
  const rows = items.map((f) =>
    [f.createdAt.toISOString(), f.category, f.rating ?? "", f.status, f.url || "", f.userId || "", f.email || "", f.message].map(csvCell).join(",")
  );
  const csv = [header.map(csvCell).join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="pawspair-feedback.csv"',
    },
  });
}
