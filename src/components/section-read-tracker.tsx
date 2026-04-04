"use client";

import { useState, useTransition } from "react";

type SectionReadTrackerProps = {
  issueDate: string;
  sectionKey: string;
};

export function SectionReadTracker({ issueDate, sectionKey }: SectionReadTrackerProps) {
  const [message, setMessage] = useState("读完这栏后，点一下这里再去完成今日打卡。");
  const [hasMarkedRead, setHasMarkedRead] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleMarkRead() {
    if (hasMarkedRead || isPending) {
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/reading/section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issueDate,
          sectionKey,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setMessage(payload?.error ?? "本板块已读状态提交失败，请稍后再试。");
        return;
      }

      setHasMarkedRead(true);
      setMessage("本板块已记为已读，现在可以回首页完成今日打卡。");
    });
  }

  return (
    <div className="rounded-[20px] border border-slate-900/10 bg-white/80 px-4 py-4">
      <div className="text-[0.72rem] tracking-[0.16em] text-slate-500">READ CHECKPOINT</div>
      <div className="mt-2 text-[0.94rem] leading-7 text-slate-700">{message}</div>
      <button
        type="button"
        onClick={handleMarkRead}
        disabled={hasMarkedRead || isPending}
        className="mt-4 rounded-full border border-slate-300 bg-white px-4 py-2 text-[0.82rem] font-medium text-slate-900 transition hover:border-[#2457d6] hover:text-[#2457d6] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {hasMarkedRead ? "本板块已读" : isPending ? "提交中..." : "标记本板块已读"}
      </button>
    </div>
  );
}
