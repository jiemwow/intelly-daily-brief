import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { INTELLY_SESSION_COOKIE, readSessionEmail } from "@/lib/intelly-user";

export const INTELLY_ADMIN_COOKIE = "intelly_admin_session";
const adminSessionTtlMs = 1000 * 60 * 60 * 8;

function parseAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
  );
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
}

function getAdminAccessCode() {
  return process.env.ADMIN_ACCESS_CODE?.trim() ?? "";
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return parseAdminEmails().has(email.toLowerCase());
}

export function isAdminAccessConfigured() {
  return Boolean(getAdminSessionSecret() && getAdminAccessCode() && parseAdminEmails().size > 0);
}

function signPayload(payload: string) {
  const secret = getAdminSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }

  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function hasMatchingAdminAccessCode(accessCode?: string | null) {
  const expected = getAdminAccessCode();
  const provided = accessCode?.trim() ?? "";

  if (!expected || !provided) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

export function createAdminSessionToken(email: string, now = Date.now()) {
  const expiresAt = now + adminSessionTtlMs;
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString("base64url");
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function hasValidAdminSession(email?: string | null, token?: string | null, now = Date.now()) {
  if (!email || !token || !isAdminAccessConfigured()) {
    return false;
  }

  const [payload, providedSignature] = token.split(".");
  if (!payload || !providedSignature) {
    return false;
  }

  const expectedSignature = signPayload(payload);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: string;
      expiresAt?: number;
    };

    return (
      decoded.email?.toLowerCase() === email.toLowerCase() &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > now
    );
  } catch {
    return false;
  }
}

export function getAdminAccessState(email?: string | null, token?: string | null) {
  return {
    adminAccessConfigured: isAdminAccessConfigured(),
    adminEligible: isAdminEmail(email),
    isAdmin: hasValidAdminSession(email, token),
  };
}

export async function requireAdminPageAccess() {
  const cookieStore = await cookies();
  const sessionEmail = readSessionEmail(cookieStore.get(INTELLY_SESSION_COOKIE)?.value);
  const adminToken = cookieStore.get(INTELLY_ADMIN_COOKIE)?.value;

  if (!hasValidAdminSession(sessionEmail, adminToken)) {
    redirect("/me");
  }

  return sessionEmail;
}

export async function requireAdminApiAccess() {
  const cookieStore = await cookies();
  const sessionEmail = readSessionEmail(cookieStore.get(INTELLY_SESSION_COOKIE)?.value);
  const adminToken = cookieStore.get(INTELLY_ADMIN_COOKIE)?.value;

  if (!hasValidAdminSession(sessionEmail, adminToken)) {
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
