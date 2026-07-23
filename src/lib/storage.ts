import { randomUUID } from "node:crypto";
import path from "node:path";
import { supabaseAdmin, STORAGE_BUCKET } from "./supabaseAdmin";

// Files are only ever served through the authenticated /api/files/[id]
// route — never a public bucket URL. Callers only deal with an opaque
// `storagePath` (the object key within STORAGE_BUCKET).

export async function saveFile(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string = "application/octet-stream",
): Promise<string> {
  const ext = path.extname(originalFilename);
  const storagePath = `${randomUUID()}${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });
  if (error) {
    throw new Error(`Failed to upload file to storage: ${error.message}`);
  }

  return storagePath;
}

export async function readStoredFile(storagePath: string): Promise<Buffer> {
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .download(storagePath);
  if (error || !data) {
    throw new Error(`Failed to read file from storage: ${error?.message ?? "not found"}`);
  }
  return Buffer.from(await data.arrayBuffer());
}
