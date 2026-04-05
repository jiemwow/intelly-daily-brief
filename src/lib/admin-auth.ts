import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

const fallbackAdminEmails = ["jiem.yangjie@huawei.com", "jyflybird@gmail.com"];

function parseAdminEmails() {
  const configured = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return new Set(configured.length > 0 ? configured : fallbackAdminEmails);
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return parseAdminEmails().has(email.toLowerCase());
}

export async function requireAdminPageAccess() {
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;

  if (!isAdminEmail(sessionEmail)) {
    redirect("/me");
  }

  return sessionEmail;
}

export async function requireAdminApiAccess() {
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;

  if (!isAdminEmail(sessionEmail)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    sessionEmail,
  };
}
