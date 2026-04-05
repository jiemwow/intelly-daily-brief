import path from "node:path";

function getRuntimeRoot() {
  const configured = process.env.INTELLY_RUNTIME_DIR?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.VERCEL) {
    return path.join("/tmp", "intelly-daily-brief");
  }

  return path.join(/* turbopackIgnore: true */ process.cwd(), "artifacts");
}

export function resolveMutableDataPath(fileName: string) {
  return path.join(getRuntimeRoot(), fileName);
}
