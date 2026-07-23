import { mkdir, writeFile, readFile as fsReadFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Files live outside `public/` and are only ever served through the
// authenticated /api/files/[id] route — never a static, guessable URL.
// Swapping to Supabase Storage/S3 later means replacing the two functions
// below; callers only deal with an opaque `storagePath`.
const STORAGE_ROOT = path.join(process.cwd(), "storage");

export async function saveFile(
  buffer: Buffer,
  originalFilename: string,
): Promise<string> {
  await mkdir(STORAGE_ROOT, { recursive: true });
  const ext = path.extname(originalFilename);
  const storagePath = `${randomUUID()}${ext}`;
  await writeFile(path.join(STORAGE_ROOT, storagePath), buffer);
  return storagePath;
}

export async function readStoredFile(storagePath: string): Promise<Buffer> {
  const resolved = path.join(STORAGE_ROOT, storagePath);
  if (!resolved.startsWith(STORAGE_ROOT)) {
    throw new Error("Invalid storage path");
  }
  return fsReadFile(resolved);
}
