"use client";

import { useState, useTransition } from "react";

type Props = {
  issueDate: string;
  sectionKey: string;
};

export function TechSectionReadTracker({ issueDate, sectionKey }: Props) {
  const [message, setMessage] = useState("读完这一栏后，先标记已读，再回首页完成今日打卡。");
  const [hasMarkedRead, setHasMarkedRead] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleMarkRead() {
    if (hasMarkedRead || isPending) {
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/reading/section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueDate, sectionKey }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setMessage(payload?.error ?? "本板块已读状态提交失败，请稍后重试。");
        return;
      }

      setHasMarkedRead(true);
      setMessage("本板块已记为已读，返回首页后就可以完成今日打卡。");
    });
  }

  return (
    <section className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-4">
      <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#8bb7ff]">阅读检查点</div>
      <div className="mt-3 text-[0.9rem] leading-7 text-[#98a4b7]">{message}</div>
      <button
        type="button"
        onClick={handleMarkRead}
        disabled={hasMarkedRead || isPending}
        className="mt-4 rounded-full border border-[#8bb7ff]/25 bg-[#8bb7ff]/10 px-4 py-2 text-[0.78rem] uppercase tracking-[0.12em] text-[#dce9ff] transition hover:border-[#8bb7ff] hover:bg-[#8bb7ff]/16 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/6 disabled:text-[#677487]"
      >
        {hasMarkedRead ? "本板块已读" : isPending ? "提交中..." : "标记本板块已读"}
      </button>
    </section>
  );
}

