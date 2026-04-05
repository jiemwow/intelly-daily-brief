import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  clearAdminAccessFailures,
  getAdminRateLimitState,
  readRequestIp,
  registerAdminAccessFailure,
} from "@/lib/admin-rate-limit";
import {
  createAdminSessionToken,
  hasMatchingAdminAccessCode,
  INTELLY_ADMIN_COOKIE,
  isAdminAccessConfigured,
  isAdminEmail,
} from "@/lib/admin-auth";
import { getStoredUser, INTELLY_SESSION_COOKIE, readSessionEmail } from "@/lib/intelly-user";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionEmail = readSessionEmail(cookieStore.get(INTELLY_SESSION_COOKIE)?.value);
  const { user } = await getStoredUser(sessionEmail);
  const requestIp = readRequestIp(request);

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
  const rateLimit = await getAdminRateLimitState(sessionEmail, requestIp);

  if (rateLimit.blocked) {
    return NextResponse.json(
      {
        error: `访问码尝试次数过多，请在 ${rateLimit.retryAfterSeconds} 秒后再试。`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  if (!accessCode) {
    return NextResponse.json({ error: "请输入管理员访问码。" }, { status: 400 });
  }

  if (!hasMatchingAdminAccessCode(accessCode)) {
    await registerAdminAccessFailure(sessionEmail, requestIp);
    return NextResponse.json({ error: "管理员访问码不正确。" }, { status: 403 });
  }

  await clearAdminAccessFailures(sessionEmail, requestIp);

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
