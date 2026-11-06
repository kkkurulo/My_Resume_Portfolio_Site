import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/db/queries";

export const dynamic = "force-dynamic";

/** A permanent address for the CV: links sent to recruiters keep working after a new upload. */
export async function GET(request: NextRequest) {
  const { resumeUrl } = await getProfile();
  return NextResponse.redirect(new URL(resumeUrl ?? "/", request.url), 307);
}
