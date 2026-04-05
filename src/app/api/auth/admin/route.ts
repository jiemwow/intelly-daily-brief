import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createAdminSessionToken,
  hasMatchingAdminAccessCode,
  INTELLY_ADMIN_COOKIE,
  isAdminAccessConfigured,
  isAdminEmail,
} from "@/lib/admin-auth";
import { getStoredUser, INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionEmail = cookieStore.get(INTELLY_SESSION_COOKIE)?.value;
  const { user } = await getStoredUser(sessionEmail);

  if (!sessionEmail || !user || user.email !== sessionEmail) {
    return NextResponse.json({ error: "请先完成普通登录。" }, { status: 401 });
  }

  if (!isAdminEmail(sessionEmail)) {
    return NextResponse.json({ error: "当前账号无法开启管理员权限。" }, { status: 403 });
  }

  if (!isAdminAccessConfigured()) {
    return NextResponse.json({ error: "当前环境尚未配置管理员访问码。" }, { status: 503 });
  }

  const payload = (await request.json().catch(() => null)) as { accessCode?: string } | null;
  const accessCode = payload?.accessCode?.trim() ?? "";

  if (!accessCode) {
    return NextResponse.json({ error: "请输入管理员访问码。" }, { status: 400 });
  }

  if (!hasMatchingAdminAccessCode(accessCode)) {
    return NextResponse.json({ error: "管理员访问码不正确。" }, { status: 403 });
  }

  const token = createAdminSessionToken(sessionEmail);
  cookieStore.set(INTELLY_ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ ok: true, isAdmin: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(INTELLY_ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });

  return NextResponse.json({ ok: true, isAdmin: false });
}
