import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sameOrigin, rateLimit } from "@/lib/security";
import { logEvent } from "@/lib/events";

// Detects the true image type from the file's magic bytes, so a spoofed
// Content-Type (e.g. an HTML/SVG payload labelled image/png) can't slip through.
function sniffImage(buf: Buffer): "png" | "jpg" | "webp" | null {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

// Saves to /public/uploads in dev. In production, upload to object storage (S3/GCS) instead.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);
  if (!rateLimit("upload:" + user.id, 10, 60_000)) return NextResponse.redirect(new URL("/account?error=Too+many+uploads", req.url), 303);
  const pet = user.pets[0];
  if (!pet) return NextResponse.redirect(new URL("/account?error=No+pet", req.url), 303);

  const form = await req.formData();
  const file = form.get("photo") as File | null;
  if (!file || file.size === 0) return NextResponse.redirect(new URL("/account?error=Choose+an+image", req.url), 303);
  if (file.size > 5 * 1024 * 1024) return NextResponse.redirect(new URL("/account?error=Max+5MB", req.url), 303);

  // Validate the real bytes, not the client-supplied MIME type.
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(bytes);
  if (!ext) return NextResponse.redirect(new URL("/account?error=JPG%2C+PNG+or+WebP+only", req.url), 303);

  const name = `${pet.id}-${Date.now()}.${ext}`;
  await writeFile(path.join(process.cwd(), "public", "uploads", name), bytes);

  await prisma.pet.update({ where: { id: pet.id }, data: { photoUrl: `/uploads/${name}` } });
  logEvent("photo_upload", { userId: user.id, meta: { kind: "pet" } });
  return NextResponse.redirect(new URL("/account?photo=1", req.url), 303);
}
