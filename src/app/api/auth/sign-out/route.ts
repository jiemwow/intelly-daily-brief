import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { INTELLY_ADMIN_COOKIE } from "@/lib/admin-auth";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(INTELLY_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
  cookieStore.set(INTELLY_ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });

  return NextResponse.json({ ok: true });
}
