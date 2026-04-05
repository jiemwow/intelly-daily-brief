"use client";

import { useState, useTransition } from "react";

import type { IntellyMeResponse, IntellyPreferredSection, IntellyUserSettings } from "@/types/intelly";

type Props = {
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

export function TechMePanel({ initialState }: Props) {
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

      setState((current) => ({ ...current, user: payload.user, settings: payload.settings }));
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

      setState((current) => ({ ...current, settings: payload.settings }));
      setMessage("偏好已保存。");
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#8bb7ff]">账号</div>
        {state.user ? (
          <div className="mt-4">
            <div className="text-[1.15rem] tracking-[-0.03em] text-white">{state.user.displayName}</div>
            <div className="mt-1 text-[0.9rem] text-[#95a3b8]">{state.user.email}</div>
            <div className="mt-4 text-[0.9rem] leading-7 text-[#95a3b8]">当前连续 {state.currentStreak} 天</div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isPending}
              className="mt-5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[0.78rem] uppercase tracking-[0.12em] text-[#dce9ff] transition hover:border-[#8bb7ff] hover:bg-[#8bb7ff]/10"
            >
              退出登录
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <label className="text-[0.82rem] text-[#95a3b8]">邮箱登录</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-[16px] border border-white/10 bg-black/20 px-4 py-3 text-[0.92rem] text-white outline-none transition focus:border-[#8bb7ff]"
            />
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isPending}
              className="mt-4 rounded-full border border-[#8bb7ff]/30 bg-[#8bb7ff]/12 px-4 py-2 text-[0.78rem] uppercase tracking-[0.12em] text-[#dce9ff] transition hover:border-[#8bb7ff] hover:bg-[#8bb7ff]/18"
            >
              本地登录
            </button>
          </div>
        )}
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#8bb7ff]">偏好设置</div>
        <h2 className="mt-3 text-[1.2rem] tracking-[-0.03em] text-white">阅读与推送</h2>

        <div className="mt-5 grid gap-5">
          <div>
            <div className="text-[0.84rem] text-[#95a3b8]">感兴趣板块</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sectionOptions.map((option) => {
                const active = settingsDraft.preferredSections.includes(option.key);
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => togglePreferredSection(option.key)}
                    className={[
                      "rounded-full border px-3 py-1.5 text-[0.8rem] uppercase tracking-[0.08em] transition",
                      active
                        ? "border-[#8bb7ff]/40 bg-[#8bb7ff]/14 text-[#dce9ff]"
                        : "border-white/10 bg-white/[0.03] text-[#95a3b8]",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-black/15 px-4 py-3 text-[0.9rem] text-[#dbe4f3]">
              <input
                type="checkbox"
                checked={settingsDraft.pushEmailEnabled}
                onChange={(event) =>
                  setSettingsDraft((current) => ({ ...current, pushEmailEnabled: event.target.checked }))
                }
              />
              邮件推送
            </label>
            <label className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-black/15 px-4 py-3 text-[0.9rem] text-[#dbe4f3]">
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
            <label className="text-[0.84rem] text-[#95a3b8]">每日推送时间</label>
            <input
              type="time"
              value={settingsDraft.dailyPushTime}
              onChange={(event) =>
                setSettingsDraft((current) => ({ ...current, dailyPushTime: event.target.value }))
              }
              className="mt-2 rounded-[16px] border border-white/10 bg-black/20 px-4 py-3 text-[0.92rem] text-white outline-none transition focus:border-[#8bb7ff]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={!state.user || isPending}
              className="rounded-full border border-[#8bb7ff]/30 bg-[#8bb7ff]/12 px-4 py-2 text-[0.78rem] uppercase tracking-[0.12em] text-[#dce9ff] transition hover:border-[#8bb7ff] hover:bg-[#8bb7ff]/18 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/6 disabled:text-[#677487]"
            >
              保存偏好
            </button>
            {message ? <div className="text-[0.84rem] text-[#95a3b8]">{message}</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}

