"use client";

import { useState, useTransition } from "react";

import type { IntellyMeResponse, IntellyPreferredSection, IntellyUserSettings } from "@/types/intelly";

type MePanelProps = {
  initialState: IntellyMeResponse;
};

const sectionOptions: Array<{ key: IntellyPreferredSection; label: string }> = [
  { key: "ai", label: "AI" },
  { key: "autonomous-driving", label: "智能驾驶" },
  { key: "embodied-intelligence", label: "具身智能" },
  { key: "world", label: "全球要闻" },
  { key: "business", label: "商业趋势" },
];

function cloneSettings(settings: IntellyUserSettings | null): IntellyUserSettings {
  return (
    settings ?? {
      preferredSections: ["ai", "autonomous-driving", "embodied-intelligence", "world", "business"],
      pushEmailEnabled: true,
      pushWechatEnabled: false,
      dailyPushTime: "08:00",
    }
  );
}

export function MePanel({ initialState }: MePanelProps) {
  const [state, setState] = useState(initialState);
  const [email, setEmail] = useState(initialState.user?.email ?? "");
  const [settingsDraft, setSettingsDraft] = useState(() => cloneSettings(initialState.settings));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function togglePreferredSection(section: IntellyPreferredSection) {
    setSettingsDraft((current) => {
      const exists = current.preferredSections.includes(section);
      return {
        ...current,
        preferredSections: exists
          ? current.preferredSections.filter((item) => item !== section)
          : [...current.preferredSections, section],
      };
    });
  }

  function handleSignIn() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.error ?? "登录失败，请重试。");
        return;
      }

      setState((current) => ({
        ...current,
        user: payload.user,
        settings: payload.settings,
      }));
      setSettingsDraft(cloneSettings(payload.settings));
      setMessage("已完成本地登录。");
    });
  }

  function handleSignOut() {
    startTransition(async () => {
      await fetch("/api/auth/sign-out", { method: "POST" });
      setState({
        user: null,
        settings: null,
        currentStreak: 0,
        todayCheckinStatus: null,
      });
      setSettingsDraft(cloneSettings(null));
      setMessage("已退出登录。");
    });
  }

  function handleSaveSettings() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/me/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsDraft),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.error ?? "保存失败，请稍后再试。");
        return;
      }

      setState((current) => ({
        ...current,
        settings: payload.settings,
      }));
      setMessage("偏好已保存。");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <section className="rounded-[24px] border border-slate-900/10 bg-white/80 px-5 py-5">
        <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">ACCOUNT</div>
        {state.user ? (
          <div className="mt-4">
            <div className="text-[1.2rem] font-semibold tracking-[-0.03em] text-slate-950">
              {state.user.displayName}
            </div>
            <div className="mt-1 text-[0.9rem] text-slate-500">{state.user.email}</div>
            <div className="mt-4 text-[0.9rem] leading-7 text-slate-600">
              当前连续 {state.currentStreak} 天
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isPending}
              className="mt-5 rounded-full border border-slate-300 bg-white px-4 py-2 text-[0.84rem] font-medium text-slate-900 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              退出登录
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <label className="text-[0.82rem] text-slate-600">邮箱登录</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-[0.92rem] text-slate-900 outline-none transition focus:border-[#2457d6]"
            />
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isPending}
              className="mt-4 rounded-full bg-slate-950 px-4 py-2 text-[0.84rem] font-medium text-white transition hover:bg-[#173c9c]"
            >
              本地登录
            </button>
          </div>
        )}
      </section>

      <section className="rounded-[24px] border border-slate-900/10 bg-white/80 px-5 py-5">
        <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">SETTINGS</div>
        <h2 className="mt-3 text-[1.3rem] font-semibold tracking-[-0.03em] text-slate-950">
          阅读与推送偏好
        </h2>
        <div className="mt-5 grid gap-5">
          <div>
            <div className="text-[0.84rem] text-slate-600">感兴趣板块</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sectionOptions.map((option) => {
                const active = settingsDraft.preferredSections.includes(option.key);
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => togglePreferredSection(option.key)}
                    className={[
                      "rounded-full border px-3 py-1.5 text-[0.82rem] transition",
                      active
                        ? "border-[#2457d6] bg-[#eef4ff] text-[#173c9c]"
                        : "border-slate-200 bg-white text-slate-600",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 text-[0.9rem] text-slate-700">
              <input
                type="checkbox"
                checked={settingsDraft.pushEmailEnabled}
                onChange={(event) =>
                  setSettingsDraft((current) => ({ ...current, pushEmailEnabled: event.target.checked }))
                }
              />
              邮件推送
            </label>
            <label className="flex items-center gap-3 text-[0.9rem] text-slate-700">
              <input
                type="checkbox"
                checked={settingsDraft.pushWechatEnabled}
                onChange={(event) =>
                  setSettingsDraft((current) => ({ ...current, pushWechatEnabled: event.target.checked }))
                }
              />
              微信 / IM 推送
            </label>
          </div>

          <div>
            <label className="text-[0.84rem] text-slate-600">每日推送时间</label>
            <input
              type="time"
              value={settingsDraft.dailyPushTime}
              onChange={(event) =>
                setSettingsDraft((current) => ({ ...current, dailyPushTime: event.target.value }))
              }
              className="mt-2 rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-[0.92rem] text-slate-900 outline-none transition focus:border-[#2457d6]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={!state.user || isPending}
              className="rounded-full bg-slate-950 px-4 py-2 text-[0.84rem] font-medium text-white transition hover:bg-[#173c9c] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              保存偏好
            </button>
            {message ? <div className="text-[0.84rem] text-slate-600">{message}</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
