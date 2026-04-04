type RequiredEnvKey =
  | "OPENAI_API_KEY"
  | "RESEND_API_KEY"
  | "BRIEF_RECIPIENT_EMAIL"
  | "BRIEF_TIMEZONE";

export function getEnv(key: RequiredEnvKey): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function readOptionalEnv(key: string): string | undefined {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
}
