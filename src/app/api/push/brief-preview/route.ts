import { NextResponse } from "next/server";

import { buildPushPreviewPayload } from "@/renderers/push";
import { readLatestBrief } from "@/lib/latest-brief";

export async function GET() {
  const brief = await readLatestBrief();

  if (!brief) {
    return NextResponse.json(
      {
        error: "Brief not found",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    issueDate: brief.date,
    payload: buildPushPreviewPayload(brief),
  });
}
