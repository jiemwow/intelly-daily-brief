"use client";

import { useState, useTransition } from "react";

import type { IntellyIssueArchiveEntry, IntellySourceRegistryEntry } from "@/types/intelly";

type Props = {
  issues: IntellyIssueArchiveEntry[];
  sources: IntellySourceRegistryEntry[];
  deliveries: Array<{
    id: string;
    issueDate: string;
    channel: string;
    status: string;
    createdAt: string;
  }>;
};

export function TechAdminConsole({ issues, sources, deliveries }: Props) {
  const [sourceState, setSourceState] = useState(sources);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function updateMessage(key: string, value: string) {
    setMessages((current) => ({ ...current, [key]: value }));
  }

  function handleSourceStatus(sourceId: string, status: IntellySourceRegistryEntry["status"]) {
    startTransition(async () => {
      updateMessage(sourceId, "保存中...");
      const response = await fetch(`/api/admin/sources/${sourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json();

      if (!response.ok) {
        updateMessage(sourceId, payload.error ?? "保存失败");
        return;
      }

      setSourceState((current) =>
        current.map((source) => (source.sourceId === sourceId ? payload.item : source)),
      );
      updateMessage(sourceId, `已更新为 ${status}`);
    });
  }

  function handleIssueRebuild(issueDate: string) {
    startTransition(async () => {
      updateMessage(issueDate, "重建中...");
      const response = await fetch(`/api/admin/issues/${issueDate}/rebuild`, { method: "POST" });
      const payload = await response.json();
      updateMessage(issueDate, response.ok ? `已重建 ${payload.issueDate}` : payload.error ?? "重建失败");
    });
  }

  function handlePush(issueDate: string, channel: "email" | "wechat" | "im") {
    startTransition(async () => {
      const key = `${issueDate}:${channel}`;
      updateMessage(key, "发送中...");
      const response = await fetch("/api/internal/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueDate, channel }),
      });
      const payload = await response.json();
      updateMessage(key, response.ok ? `已提交 ${payload.delivery.status}` : payload.error ?? "发送失败");
    });
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#8bb7ff]">Issue 控制</div>
        <div className="mt-4 grid gap-4">
          {issues.map((issue) => (
            <div key={issue.issueDate} className="rounded-[18px] border border-white/10 bg-black/15 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[0.78rem] uppercase tracking-[0.12em] text-[#8bb7ff]">{issue.issueDate}</div>
                  <div className="mt-2 text-[1rem] text-white">{issue.headline}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleIssueRebuild(issue.issueDate)}
                    disabled={isPending}
                    className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.12em] text-[#dce9ff]"
                  >
                    重建
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePush(issue.issueDate, "wechat")}
                    disabled={isPending}
                    className="rounded-full border border-[#8bb7ff]/25 bg-[#8bb7ff]/10 px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.12em] text-[#dce9ff]"
                  >
                    发微信
                  </button>
                </div>
              </div>
              {messages[issue.issueDate] ? <div className="mt-2 text-[0.82rem] text-[#95a3b8]">{messages[issue.issueDate]}</div> : null}
              {messages[`${issue.issueDate}:wechat`] ? (
                <div className="mt-2 text-[0.82rem] text-[#95a3b8]">{messages[`${issue.issueDate}:wechat`]}</div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#8bb7ff]">信源注册表</div>
        <div className="mt-4 grid gap-3">
          {sourceState.slice(0, 14).map((source) => (
            <div key={source.sourceId} className="rounded-[18px] border border-white/10 bg-black/15 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[0.96rem] text-white">{source.name}</div>
                  <div className="mt-1 text-[0.82rem] text-[#95a3b8]">
                    {source.sourceId} / {source.channelType} / {source.priority}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["active", "paused", "backlog"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleSourceStatus(source.sourceId, status)}
                      disabled={isPending}
                      className={[
                        "rounded-full border px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.12em]",
                        source.status === status
                          ? "border-[#8bb7ff]/30 bg-[#8bb7ff]/12 text-[#dce9ff]"
                          : "border-white/12 bg-white/5 text-[#95a3b8]",
                      ].join(" ")}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              {messages[source.sourceId] ? <div className="mt-2 text-[0.82rem] text-[#95a3b8]">{messages[source.sourceId]}</div> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#8bb7ff]">Push Log</div>
        <div className="mt-4 grid gap-3">
          {deliveries.slice(0, 8).map((delivery) => (
            <div key={delivery.id} className="rounded-[18px] border border-white/10 bg-black/15 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[0.92rem] text-white">
                    {delivery.issueDate} / {delivery.channel}
                  </div>
                  <div className="mt-1 text-[0.82rem] text-[#95a3b8]">{delivery.createdAt}</div>
                </div>
                <div className="rounded-full border border-white/12 px-3 py-1 text-[0.72rem] uppercase tracking-[0.12em] text-[#dce9ff]">
                  {delivery.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
