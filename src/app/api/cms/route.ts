import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cms-api-auth";

export const runtime = "nodejs";

function djangoCmsBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_CMS_API_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:3001"
  );
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders("GET, OPTIONS", request) });
}

/** Proxy published CMS snapshot to Django (same store the public website uses). */
export async function GET(request: Request) {
  try {
    const upstream = await fetch(`${djangoCmsBase()}/api/cms/`, { cache: "no-store" });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        ...corsHeaders("GET, OPTIONS", request),
        "Content-Type": upstream.headers.get("Content-Type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Published CMS proxy failed:", error);
    return NextResponse.json(
      { error: "Could not reach Django CMS API on port 3001." },
      { status: 502, headers: corsHeaders("GET, OPTIONS", request) },
    );
  }
}
