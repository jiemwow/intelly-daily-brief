import path from "node:path";
import { promises as fs } from "node:fs";

type PushOutboxEntry = {
  id: string;
  channel: "email" | "wechat" | "im";
  createdAt: string;
  target: string;
  payload: Record<string, unknown>;
};

const outboxPath = path.join(process.cwd(), "artifacts", "push-outbox.json");

async function readOutbox(): Promise<PushOutboxEntry[]> {
  try {
    const payload = await fs.readFile(outboxPath, "utf8");
    const parsed = JSON.parse(payload) as PushOutboxEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendPushOutboxEntry(entry: PushOutboxEntry) {
  const current = await readOutbox();
  current.unshift(entry);
  await fs.mkdir(path.dirname(outboxPath), { recursive: true });
  await fs.writeFile(outboxPath, JSON.stringify(current.slice(0, 200), null, 2), "utf8");
}
