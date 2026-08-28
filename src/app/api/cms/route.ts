import { NextResponse } from "next/server";
import { filterPublishedContent } from "@/lib/cms-published";
import { corsHeaders } from "@/lib/cms-api-auth";
import { readCmsContentFromDisk } from "@/lib/cms-server-store";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders("GET, OPTIONS") });
}

/** Public CMS API — published website content for mistnleaf.vercel.app / localhost:3001 */
export async function GET() {
  const content = await readCmsContentFromDisk();
  const published = filterPublishedContent(content);

  return NextResponse.json(published, {
    headers: {
      ...corsHeaders("GET, OPTIONS"),
      "Cache-Control": "no-store",
    },
  });
}
