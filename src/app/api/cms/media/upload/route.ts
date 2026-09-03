import { NextResponse } from "next/server";
import {
  canEditCmsContent,
  corsHeaders,
  getEditorRoleFromRequest,
} from "@/lib/cms-api-auth";

export const runtime = "nodejs";

function djangoCmsBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_CMS_API_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:3001"
  );
}

function authHeaders(request: Request) {
  const headers: Record<string, string> = {};
  const role = request.headers.get("X-Mistnleaf-Role-Id");
  const userId = request.headers.get("X-Mistnleaf-User-Id");
  const auth = request.headers.get("Authorization");
  if (role) headers["X-Mistnleaf-Role-Id"] = role;
  if (userId) headers["X-Mistnleaf-User-Id"] = userId;
  if (auth) headers.Authorization = auth;
  return headers;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders("POST, OPTIONS", request),
  });
}

/** Proxy CMS media uploads to Django media storage (served on port 3001). */
export async function POST(request: Request) {
  const roleId = getEditorRoleFromRequest(request);
  if (!roleId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canEditCmsContent(roleId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    const headers = authHeaders(request);
    let body: BodyInit;

    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      headers["Content-Type"] = "application/json";
      body = await request.text();
    }

    const upstream = await fetch(`${djangoCmsBase()}/api/cms/media/upload/`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        ...corsHeaders("POST, OPTIONS", request),
        "Content-Type": upstream.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("CMS media upload proxy failed:", error);
    return NextResponse.json(
      {
        error:
          "Could not reach Django media upload on port 3001. Start: python manage.py runserver 3001",
      },
      { status: 502, headers: corsHeaders("POST, OPTIONS", request) },
    );
  }
}
