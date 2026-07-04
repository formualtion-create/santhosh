import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  await destroySession();
  return NextResponse.redirect(new URL("/", req.url), 303);
}
