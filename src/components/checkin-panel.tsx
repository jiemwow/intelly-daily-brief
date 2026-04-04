"use client";

import { useState, useTransition } from "react";

import type { IntellyCheckinResponse, IntellyCheckinStatus } from "@/types/intelly";

type CheckinPanelProps = {
  issueDate: string;
  initialStatus: IntellyCheckinStatus;
  className?: string;
};

export function CheckinPanel({ issueDate, initialStatus, className }: CheckinPanelProps) {
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
        const response = await fetch("/api/checkins/today", {
          method: "POST",
        });

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
        setError(caughtError instanceof Error ? caughtError.message : "打卡没有成功提交，请稍后再试。");
      }
    });
  }

  const completedRatio =
    status.totalSections > 0 ? (status.completedSections / status.totalSections) * 100 : 0;

  return (
    <div
      className={[
        "overflow-hidden rounded-[22px] border border-[#dbe6ff] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8ff_100%)]",
        className ?? "",
      ].join(" ")}
    >
      <div className="border-b border-[#dbe6ff] px-5 py-4">
        <div className="text-[0.72rem] tracking-[0.24em] text-[#2457d6]">CHECK IN</div>
        <div className="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-950">
          阅读打卡
        </div>
        <div className="mt-2 max-w-[15rem] text-[0.88rem] leading-6 text-slate-600">
          {status.checkedInToday ? "今日已打卡，阅读节奏已经续上。" : `今天还没打卡，本期日期 ${issueDate}。`}
        </div>

        <div className="mt-4 rounded-[18px] border border-[#dbe6ff] bg-white px-4 py-4 shadow-[0_12px_26px_rgba(36,87,214,0.08)]">
          <div className="text-[0.74rem] tracking-[0.16em] text-slate-500">连续天数</div>
          <div className="mt-2 flex items-end gap-2">
            <div className="text-[2.3rem] font-semibold leading-none tracking-[-0.08em] text-slate-950">
              {status.currentStreak}
            </div>
            <div className="pb-1 text-[0.88rem] text-slate-500">天</div>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#dfe9fb]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#2457d6_0%,#6b9cff_100%)] transition-all duration-300"
            style={{ width: `${completedRatio}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 py-4">
        <div className="rounded-[16px] border border-slate-900/8 bg-white px-3 py-3">
          <div className="text-[0.74rem] tracking-[0.16em] text-slate-500">已完成</div>
          <div className="mt-1 text-[1rem] font-semibold leading-6 tracking-[-0.03em] text-slate-950">
            {status.completedSections} / {status.totalSections} 板块
          </div>
        </div>
        <div className="rounded-[16px] border border-slate-900/8 bg-white px-3 py-3">
          <div className="text-[0.74rem] tracking-[0.16em] text-slate-500">待处理</div>
          <div className="mt-1 text-[1rem] font-semibold leading-6 tracking-[-0.03em] text-slate-950">
            {status.pendingItems} 条
          </div>
        </div>
        <div className="rounded-[16px] border border-slate-900/8 bg-white px-3 py-3">
          <div className="text-[0.74rem] tracking-[0.16em] text-slate-500">历史最佳</div>
          <div className="mt-1 text-[1rem] font-semibold leading-6 tracking-[-0.03em] text-slate-950">
            {status.bestStreak} 天
          </div>
        </div>
        <div className="rounded-[16px] border border-slate-900/8 bg-white px-3 py-3">
          <div className="text-[0.74rem] tracking-[0.16em] text-slate-500">状态</div>
          <div className="mt-1 text-[1rem] font-semibold leading-6 tracking-[-0.03em] text-slate-950">
            {status.checkedInToday ? "已完成" : "待打卡"}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={handleCheckin}
          disabled={status.checkedInToday || isPending}
          className="inline-flex w-full items-center justify-center rounded-[14px] border border-[#2457d6] bg-[#2457d6] px-4 py-3 text-[0.9rem] font-medium text-white shadow-[0_16px_34px_rgba(36,87,214,0.2)] transition hover:bg-[#1c47b4] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
        >
          {status.checkedInToday ? "今日已打卡" : isPending ? "提交中..." : "完成今日打卡"}
        </button>
      </div>

      {error ? <p className="px-5 pb-5 text-[0.82rem] text-[#b42318]">{error}</p> : null}
    </div>
  );
}
