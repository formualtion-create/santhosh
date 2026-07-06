import { writeFile } from "fs/promises";
import path from "path";

// Persist an uploaded image and return its public URL.
// - Production (Vercel): uses Vercel Blob object storage (BLOB_READ_WRITE_TOKEN set
//   automatically when a Blob store is connected). The serverless filesystem is
//   read-only/ephemeral, so local writes don't work there.
// - Local dev: writes to /public/uploads so no cloud setup is needed.
export async function saveImage(name: string, bytes: Buffer, ext: "png" | "jpg" | "webp"): Promise<string> {
  const contentType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${name}`, bytes, { access: "public", contentType });
    return blob.url;
  }

  await writeFile(path.join(process.cwd(), "public", "uploads", name), bytes);
  return `/uploads/${name}`;
}
