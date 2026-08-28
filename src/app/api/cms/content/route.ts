import { NextResponse } from "next/server";
import { canEditCmsContent, corsHeaders, getEditorRoleFromRequest } from "@/lib/cms-api-auth";
import { normalizeCmsContent } from "@/lib/cms-normalize";
import type { CmsContent } from "@/lib/cms-data";
import { readCmsContentFromDisk, writeCmsContentToDisk } from "@/lib/cms-server-store";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders("GET, PUT, OPTIONS"),
  });
}

/** Full CMS draft — Website Content Manager & Super Administrator only */
export async function GET(request: Request) {
  const roleId = getEditorRoleFromRequest(request);
  if (!roleId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await readCmsContentFromDisk();
  return NextResponse.json(
    { content },
    {
      headers: {
        ...corsHeaders("GET, PUT, OPTIONS"),
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function PUT(request: Request) {
  const roleId = getEditorRoleFromRequest(request);
  if (!roleId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canEditCmsContent(roleId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { content?: Partial<CmsContent> };
  try {
    body = (await request.json()) as { content?: Partial<CmsContent> };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.content) {
    return NextResponse.json({ error: "Missing content field" }, { status: 400 });
  }

  const content = normalizeCmsContent(body.content);
  await writeCmsContentToDisk(content);

  return NextResponse.json(
    { ok: true, content },
    {
      headers: corsHeaders("GET, PUT, OPTIONS"),
    },
  );
}
