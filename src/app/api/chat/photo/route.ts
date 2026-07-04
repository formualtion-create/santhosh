import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { sameOrigin, rateLimit } from "@/lib/security";
import { sendPushToUser } from "@/lib/push";
import { logEvent } from "@/lib/events";

function sniffImage(buf: Buffer): "png" | "jpg" | "webp" | null {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

// Share a photo in a chat. Validates real image bytes (not the spoofable MIME).
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.redirect(new URL("/login", req.url), 303);

  const form = await req.formData();
  const matchId = String(form.get("matchId") || "");
  const m = await prisma.match.findUnique({ where: { id: matchId } });
  if (!m || (m.userAId !== uid && m.userBId !== uid)) return NextResponse.redirect(new URL("/matches", req.url), 303);
  if (!rateLimit("chatphoto:" + uid, 12, 60_000)) return NextResponse.redirect(new URL("/chat/" + matchId + "?error=Too+many+uploads", req.url), 303);

  const file = form.get("photo") as File | null;
  if (!file || file.size === 0) return NextResponse.redirect(new URL("/chat/" + matchId, req.url), 303);
  if (file.size > 5 * 1024 * 1024) return NextResponse.redirect(new URL("/chat/" + matchId + "?error=Max+5MB", req.url), 303);

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(bytes);
  if (!ext) return NextResponse.redirect(new URL("/chat/" + matchId + "?error=JPG%2C+PNG+or+WebP+only", req.url), 303);

  const name = `chat-${matchId}-${uid.slice(-4)}-${bytes.length}.${ext}`;
  await writeFile(path.join(process.cwd(), "public", "uploads", name), bytes);
  await prisma.message.create({ data: { matchId, senderId: uid, body: "📷 Photo", imageUrl: `/uploads/${name}` } });
  logEvent("photo_upload", { userId: uid, meta: { kind: "chat", matchId } });

  const otherId = m.userAId === uid ? m.userBId : m.userAId;
  const other = await prisma.user.findUnique({ where: { id: otherId }, select: { notifyMessages: true } });
  if (other?.notifyMessages) void sendPushToUser(otherId, { title: "📷 New photo", body: "You received a photo", url: `/chat/${matchId}`, tag: `chat-${matchId}` });

  return NextResponse.redirect(new URL("/chat/" + matchId, req.url), 303);
}
