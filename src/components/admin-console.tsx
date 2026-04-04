"use client";

import { useState, useTransition } from "react";

import type { IntellyIssueArchiveEntry, IntellySourceRegistryEntry } from "@/types/intelly";

type AdminConsoleProps = {
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

export function AdminConsole({ issues, sources, deliveries }: AdminConsoleProps) {
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
        headers: {
          "Content-Type": "application/json",
        },
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
      const response = await fetch(`/api/admin/issues/${issueDate}/rebuild`, {
        method: "POST",
      });
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ issueDate, channel }),
      });
      const payload = await response.json();
      updateMessage(key, response.ok ? `已提交 ${payload.delivery.status}` : payload.error ?? "发送失败");
    });
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[24px] border border-slate-900/10 bg-white/80 px-5 py-5">
        <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">ADMIN / ISSUES</div>
        <div className="mt-4 grid gap-4">
          {issues.map((issue) => (
            <div
              key={issue.issueDate}
              className="rounded-[18px] border border-slate-900/10 bg-white px-4 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[0.82rem] tracking-[0.14em] text-[#2457d6]">{issue.issueDate}</div>
                  <div className="mt-1 text-[1rem] font-medium text-slate-950">{issue.headline}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleIssueRebuild(issue.issueDate)}
                    disabled={isPending}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[0.8rem] text-slate-700"
                  >
                    重建 issue
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePush(issue.issueDate, "wechat")}
                    disabled={isPending}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[0.8rem] text-slate-700"
                  >
                    发微信 / IM
                  </button>
                </div>
              </div>
              {messages[issue.issueDate] ? (
                <div className="mt-2 text-[0.82rem] text-slate-500">{messages[issue.issueDate]}</div>
              ) : null}
              {messages[`${issue.issueDate}:wechat`] ? (
                <div className="mt-2 text-[0.82rem] text-slate-500">
                  {messages[`${issue.issueDate}:wechat`]}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-900/10 bg-white/80 px-5 py-5">
        <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">ADMIN / SOURCES</div>
        <div className="mt-4 grid gap-3">
          {sourceState.slice(0, 14).map((source) => (
            <div
              key={source.sourceId}
              className="rounded-[18px] border border-slate-900/10 bg-white px-4 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[0.95rem] font-medium text-slate-950">{source.name}</div>
                  <div className="mt-1 text-[0.82rem] text-slate-500">
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
                        "rounded-full border px-3 py-1.5 text-[0.78rem]",
                        source.status === status
                          ? "border-[#2457d6] bg-[#eef4ff] text-[#173c9c]"
                          : "border-slate-300 bg-white text-slate-700",
                      ].join(" ")}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              {messages[source.sourceId] ? (
                <div className="mt-2 text-[0.82rem] text-slate-500">{messages[source.sourceId]}</div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-900/10 bg-white/80 px-5 py-5">
        <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">ADMIN / PUSH</div>
        <div className="mt-4 grid gap-3">
          {deliveries.slice(0, 8).map((delivery) => (
            <div
              key={delivery.id}
              className="rounded-[18px] border border-slate-900/10 bg-white px-4 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[0.9rem] font-medium text-slate-950">
                    {delivery.issueDate} / {delivery.channel}
                  </div>
                  <div className="mt-1 text-[0.82rem] text-slate-500">{delivery.createdAt}</div>
                </div>
                <div className="rounded-full border border-slate-300 px-3 py-1 text-[0.76rem] text-slate-600">
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
