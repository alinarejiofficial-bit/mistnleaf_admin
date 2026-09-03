import { NextResponse } from "next/server";
import { canEditCmsContent, corsHeaders, getEditorRoleFromRequest } from "@/lib/cms-api-auth";

export const runtime = "nodejs";

function djangoCmsBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_CMS_API_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:3001"
  );
}

function forwardHeaders(request: Request, withJson = false) {
  const headers: Record<string, string> = {};
  const role = request.headers.get("X-Mistnleaf-Role-Id");
  const userId = request.headers.get("X-Mistnleaf-User-Id");
  const auth = request.headers.get("Authorization");
  if (role) headers["X-Mistnleaf-Role-Id"] = role;
  if (userId) headers["X-Mistnleaf-User-Id"] = userId;
  if (auth) headers.Authorization = auth;
  if (withJson) headers["Content-Type"] = "application/json";
  return headers;
}

async function proxyContent(request: Request, method: "GET" | "PUT") {
  const upstream = await fetch(`${djangoCmsBase()}/api/cms/content/`, {
    method,
    headers: forwardHeaders(request, method === "PUT"),
    body: method === "PUT" ? await request.text() : undefined,
    cache: "no-store",
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      ...corsHeaders("GET, PUT, OPTIONS", request),
      "Content-Type": upstream.headers.get("Content-Type") || "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders("GET, PUT, OPTIONS", request),
  });
}

/** Proxy CMS draft reads/writes to Django so admin + public site share one store. */
export async function GET(request: Request) {
  const roleId = getEditorRoleFromRequest(request);
  if (!roleId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return await proxyContent(request, "GET");
  } catch (error) {
    console.error("CMS content proxy GET failed:", error);
    return NextResponse.json(
      { error: "Could not reach Django CMS API on port 3001. Start: python manage.py runserver 3001" },
      { status: 502, headers: corsHeaders("GET, PUT, OPTIONS", request) },
    );
  }
}

export async function PUT(request: Request) {
  const roleId = getEditorRoleFromRequest(request);
  if (!roleId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canEditCmsContent(roleId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    return await proxyContent(request, "PUT");
  } catch (error) {
    console.error("CMS content proxy PUT failed:", error);
    return NextResponse.json(
      { error: "Could not reach Django CMS API on port 3001. Start: python manage.py runserver 3001" },
      { status: 502, headers: corsHeaders("GET, PUT, OPTIONS", request) },
    );
  }
}
