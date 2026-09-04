import { NextResponse } from "next/server";
import { filterPublishedContent } from "@/lib/cms-published";
import { corsHeaders } from "@/lib/cms-api-auth";
import { readCmsContentFromDisk } from "@/lib/cms-server-store";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders("GET, OPTIONS", request) });
}

/** Public CMS API — published website content for localhost:3000 */
export async function GET(request: Request) {
  const content = await readCmsContentFromDisk();
  const published = filterPublishedContent(content);

  return NextResponse.json(published, {
    headers: {
      ...corsHeaders("GET, OPTIONS", request),
      "Cache-Control": "no-store",
    },
  });
}
