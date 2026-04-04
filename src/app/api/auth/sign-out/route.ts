import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(INTELLY_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return NextResponse.json({ ok: true });
}
