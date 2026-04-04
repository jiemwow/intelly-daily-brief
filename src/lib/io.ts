import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeArtifact(
  directory: string,
  filename: string,
  content: string,
): Promise<string> {
  const fullDirectory = path.resolve(directory);
  await mkdir(fullDirectory, { recursive: true });

  const fullPath = path.join(fullDirectory, filename);
  await writeFile(fullPath, content, "utf8");
  return fullPath;
}
