import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { INTELLY_SESSION_COOKIE, signInLocalUser } from "@/lib/intelly-user";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = payload?.email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "请输入有效邮箱地址。" }, { status: 400 });
  }

  const state = await signInLocalUser(email);
  const cookieStore = await cookies();
  cookieStore.set(INTELLY_SESSION_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({
    ok: true,
    user: state.user,
    settings: state.settings,
  });
}
