import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  canEditCmsContent,
  corsHeaders,
  getCmsAdminOrigin,
  getEditorRoleFromRequest,
} from "@/lib/cms-api-auth";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "cms");

function extensionFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/svg+xml") return "svg";
  return "jpg";
}

function publicUrlFor(filename: string) {
  return `${getCmsAdminOrigin()}/uploads/cms/${filename}`;
}

async function writeUpload(buffer: Buffer, filename: string) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return publicUrlFor(filename);
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders("POST, OPTIONS", request),
  });
}

/** Upload CMS images — Website Content Manager & Super Administrator only. */
export async function POST(request: Request) {
  const roleId = getEditorRoleFromRequest(request);
  if (!roleId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canEditCmsContent(roleId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Missing file" }, { status: 400 });
      }
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
      }

      const ext = extensionFromMime(file.type);
      const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await writeUpload(buffer, filename);

      return NextResponse.json(
        { url },
        { headers: corsHeaders("POST, OPTIONS", request) },
      );
    }

    const body = (await request.json()) as { dataUrl?: string; filename?: string };
    if (!body.dataUrl?.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Expected image dataUrl or multipart file" },
        { status: 400 },
      );
    }

    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(body.dataUrl);
    if (!match) {
      return NextResponse.json({ error: "Invalid dataUrl" }, { status: 400 });
    }

    const mime = match[1];
    const ext = extensionFromMime(mime);
    const filename =
      (body.filename?.replace(/[^\w.-]+/g, "-") || `upload.${ext}`).replace(
        /\.(png|jpe?g|webp|gif|svg)$/i,
        "",
      ) + `.${ext}`;
    const buffer = Buffer.from(match[2], "base64");
    const url = await writeUpload(buffer, `${Date.now()}-${filename}`);

    return NextResponse.json(
      { url },
      { headers: corsHeaders("POST, OPTIONS", request) },
    );
  } catch (error) {
    console.error("CMS media upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500, headers: corsHeaders("POST, OPTIONS", request) },
    );
  }
}
