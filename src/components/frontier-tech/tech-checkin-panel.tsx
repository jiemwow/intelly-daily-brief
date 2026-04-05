"use client";

import { useState, useTransition } from "react";

import type { IntellyCheckinResponse, IntellyCheckinStatus } from "@/types/intelly";

type TechCheckinPanelProps = {
  issueDate: string;
  initialStatus: IntellyCheckinStatus;
};

export function TechCheckinPanel({ issueDate, initialStatus }: TechCheckinPanelProps) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheckin() {
    if (status.checkedInToday || isPending) {
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        const response = await fetch("/api/checkins/today", { method: "POST" });
        const payload = (await response.json().catch(() => null)) as
          | (IntellyCheckinResponse & { error?: string })
          | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? `Checkin failed with status ${response.status}`);
        }

        setStatus((current) => ({
          ...current,
          currentStreak: payload?.currentStreak ?? current.currentStreak,
          bestStreak: payload?.bestStreak ?? current.bestStreak,
          completedSections: current.totalSections,
          pendingItems: 0,
          checkedInToday: payload?.checkedInToday ?? current.checkedInToday,
          lastCheckinDate: payload?.lastCheckinDate ?? current.lastCheckinDate,
        }));
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "打卡提交失败，请稍后再试。");
      }
    });
  }

  const completedRatio =
    status.totalSections > 0 ? (status.completedSections / status.totalSections) * 100 : 0;

  return (
    <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-4">
      <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#8bb7ff]">阅读打卡</div>
      <div className="mt-3 text-[1.2rem] tracking-[-0.03em] text-white">今日阅读状态</div>
      <div className="mt-3 text-[0.9rem] leading-7 text-[#97a3b6]">
        {status.checkedInToday ? "今天已经完成打卡，阅读节奏已续上。" : `当前期号 ${issueDate}，完成阅读后即可打卡。`}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
          <div className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8bb7ff]">当前连续</div>
          <div className="mt-2 text-[2rem] leading-none tracking-[-0.06em] text-white">{status.currentStreak}</div>
          <div className="mt-2 text-[0.78rem] text-[#7e8ca3]">天</div>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
          <div className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8bb7ff]">完成进度</div>
          <div className="mt-2 text-[2rem] leading-none tracking-[-0.06em] text-white">
            {status.completedSections}/{status.totalSections}
          </div>
          <div className="mt-2 text-[0.78rem] text-[#7e8ca3]">已读板块</div>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#4ea3ff,#8bb7ff)] transition-all duration-300"
          style={{ width: `${completedRatio}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[16px] border border-white/10 bg-black/15 px-3 py-3">
          <div className="text-[0.68rem] uppercase tracking-[0.12em] text-[#7e8ca3]">待处理</div>
          <div className="mt-2 text-[1.1rem] tracking-[-0.03em] text-white">{status.pendingItems}</div>
        </div>
        <div className="rounded-[16px] border border-white/10 bg-black/15 px-3 py-3">
          <div className="text-[0.68rem] uppercase tracking-[0.12em] text-[#7e8ca3]">历史最佳</div>
          <div className="mt-2 text-[1.1rem] tracking-[-0.03em] text-white">{status.bestStreak}</div>
        </div>
        <div className="rounded-[16px] border border-white/10 bg-black/15 px-3 py-3">
          <div className="text-[0.68rem] uppercase tracking-[0.12em] text-[#7e8ca3]">状态</div>
          <div className="mt-2 text-[1.1rem] tracking-[-0.03em] text-white">
            {status.checkedInToday ? "已完成" : "待打卡"}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCheckin}
        disabled={status.checkedInToday || isPending}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-[#8bb7ff]/30 bg-[#8bb7ff]/12 px-4 py-3 text-[0.84rem] uppercase tracking-[0.12em] text-[#dcebff] transition hover:border-[#8bb7ff] hover:bg-[#8bb7ff]/18 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/6 disabled:text-[#677487]"
      >
        {status.checkedInToday ? "今日已打卡" : isPending ? "提交中..." : "完成今日打卡"}
      </button>

      {error ? <p className="mt-3 text-[0.82rem] text-[#ff9f97]">{error}</p> : null}
    </section>
  );
}

