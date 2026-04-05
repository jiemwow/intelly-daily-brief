import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type ShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

type MetricProps = {
  label: string;
  value: string | number;
  hint?: string;
};

type StreamCardProps = {
  href: string;
  title: string;
  meta: string;
  summary: string;
  tag?: string;
  image?: string;
};

function imageOrNull(url?: string) {
  return url?.trim() ? url : null;
}

const displayFont = '"Exo", "DIN Alternate", "Avenir Next Condensed", "PingFang SC", sans-serif';
const bodyFont =
  '"Avenir Next", "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", sans-serif';
const monoFont =
  '"Roboto Mono", "SFMono-Regular", "JetBrains Mono", "PingFang SC", monospace';

export function TechShell({ eyebrow, title, description, actions, children }: ShellProps) {
  return (
    <main
      className="min-h-screen bg-[#06070b] px-4 py-4 text-[#f5f7fb] md:px-6 md:py-6"
      style={{ fontFamily: bodyFont }}
    >
      <div className="mx-auto max-w-[1540px]">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#0b0f16_0%,#05070c_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.42)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(66,153,225,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="relative border-b border-white/10 px-5 py-6 md:px-8 md:py-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[60rem]">
                <div className="text-[0.7rem] uppercase tracking-[0.28em] text-[#8bb7ff]">{eyebrow}</div>
                <h1
                  className="mt-4 text-[2.4rem] leading-[0.94] tracking-[-0.05em] text-white md:text-[3.8rem]"
                  style={{ fontFamily: displayFont }}
                >
                  {title}
                </h1>
                <p className="mt-4 max-w-[46rem] text-[0.98rem] leading-8 text-[#9ca8bc] md:text-[1rem]">
                  {description}
                </p>
              </div>
              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </div>
          <div className="relative px-4 py-4 md:px-6 md:py-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function TechAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[0.76rem] uppercase tracking-[0.14em] text-[#c2cad8] transition hover:border-[#8bb7ff] hover:bg-[#8bb7ff]/10 hover:text-white"
      style={{ fontFamily: monoFont }}
    >
      {children}
    </Link>
  );
}

export function TechMetric({ label, value, hint }: MetricProps) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(139,183,255,0.7),transparent)]" />
      <div className="text-[0.7rem] uppercase tracking-[0.18em] text-[#8fa2c5]" style={{ fontFamily: monoFont }}>
        {label}
      </div>
      <div
        className="mt-3 text-[2.05rem] leading-none tracking-[-0.06em] text-white"
        style={{ fontFamily: displayFont }}
      >
        {value}
      </div>
      {hint ? <div className="mt-3 text-[0.8rem] leading-6 text-[#7e8ca3]">{hint}</div> : null}
    </section>
  );
}

export function TechHero({
  title,
  summary,
  meta,
  href,
  image,
}: {
  title: string;
  summary: string;
  meta: string;
  href: string;
  image?: string;
}) {
  const imageUrl = imageOrNull(image);
  const hasImage = Boolean(imageUrl);

  return (
    <section className={hasImage ? "grid gap-5 xl:grid-cols-[1.05fr_0.95fr]" : "grid gap-5"}>
      <div
        className={[
          "relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 md:p-7",
          hasImage ? "" : "min-h-[360px] lg:min-h-[420px]",
        ].join(" ")}
      >
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(transparent_0%,rgba(139,183,255,0.32)_50%,transparent_100%)] [background-size:100%_10px] motion-safe:animate-[pulse_8s_linear_infinite]" />
        {!hasImage ? (
          <>
            <div className="absolute -right-10 top-6 h-44 w-44 rounded-full bg-[#56b3ff]/12 blur-3xl" />
            <div className="absolute right-24 top-20 h-28 w-28 rounded-full border border-[#8bb7ff]/18 bg-[#8bb7ff]/6 backdrop-blur-sm" />
            <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-[#ec4899]/8 blur-3xl" />
            <div className="absolute inset-y-0 right-[14%] w-px bg-[linear-gradient(180deg,transparent,rgba(139,183,255,0.55),transparent)]" />
            <div className="absolute bottom-6 left-6 right-6 h-px bg-[linear-gradient(90deg,transparent,rgba(139,183,255,0.5),transparent)]" />
          </>
        ) : null}
        <div className="relative">
          <div className="text-[0.7rem] uppercase tracking-[0.18em] text-[#8bb7ff]" style={{ fontFamily: monoFont }}>
            头条主稿
          </div>
          <h2
            className={[
              "mt-4 max-w-[22ch] text-[1.56rem] leading-[1.14] tracking-[-0.03em] text-white md:text-[2.25rem] xl:text-[2.7rem]",
              hasImage ? "" : "lg:max-w-[16ch] lg:text-[2.7rem] lg:leading-[1.02] xl:text-[3rem]",
            ].join(" ")}
            style={{ fontFamily: displayFont }}
          >
            {title}
          </h2>
          <p
            className={[
              "mt-5 max-w-[50rem] text-[0.95rem] leading-8 text-[#a8b4c9] md:text-[0.98rem]",
              hasImage ? "" : "lg:max-w-[38rem]",
            ].join(" ")}
          >
            {summary}
          </p>
          <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
            <div className="text-[0.76rem] uppercase tracking-[0.12em] text-[#71809a]" style={{ fontFamily: monoFont }}>
              {meta}
            </div>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit rounded-full border border-[#8bb7ff]/25 bg-[#8bb7ff]/10 px-5 py-2 text-[0.76rem] uppercase tracking-[0.14em] text-[#dce9ff] transition hover:border-[#8bb7ff] hover:bg-[#8bb7ff]/20"
              style={{ fontFamily: monoFont }}
            >
              {href.includes("news.google.com") ? "查看聚合页" : "查看原文"}
            </a>
          </div>
        </div>
      </div>

      {hasImage ? (
      <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0d121b]">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={title}
              fill
              unoptimized
              className="object-cover opacity-85"
              sizes="(min-width: 1280px) 42vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,6,11,0.08),rgba(3,6,11,0.74))]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.24),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.18),transparent_24%),radial-gradient(circle_at_50%_70%,rgba(96,165,250,0.22),transparent_30%),linear-gradient(180deg,#0d121b,#06070b)]" />
            <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(139,183,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(139,183,255,0.55)_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(6,7,11,0.9))]" />
          </>
        )}
      </div>
      ) : null}
    </section>
  );
}

export function TechStreamCard({ href, title, meta, summary, tag, image }: StreamCardProps) {
  const imageUrl = imageOrNull(image);

  return (
    <article className="group overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] transition hover:border-[#8bb7ff]/40 hover:bg-[linear-gradient(180deg,rgba(139,183,255,0.08),rgba(255,255,255,0.02))]">
      {imageUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-[#0f1722]">
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(min-width: 1280px) 28vw, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(6,7,11,0.72))]" />
        </div>
      ) : null}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[0.72rem] tracking-[0.04em] text-[#7b8ba3]">{meta}</div>
          {tag ? (
            <div
              className="rounded-full border border-[#8bb7ff]/20 bg-[#8bb7ff]/10 px-2.5 py-1 text-[0.66rem] uppercase tracking-[0.12em] text-[#bdd8ff]"
              style={{ fontFamily: monoFont }}
            >
              {tag}
            </div>
          ) : null}
        </div>
        <h3
          className="mt-3 text-[1.02rem] leading-7 tracking-[-0.02em] text-white"
          style={{ fontFamily: displayFont }}
        >
          <a href={href} target="_blank" rel="noreferrer" className="transition group-hover:text-[#dce9ff]">
            {title}
          </a>
        </h3>
        <p className="mt-3 text-[0.84rem] leading-7 text-[#98a4b7]">{summary}</p>
      </div>
    </article>
  );
}

export function TechRail({
  title,
  eyebrow,
  href,
  children,
}: {
  title: string;
  eyebrow: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#8bb7ff]" style={{ fontFamily: monoFont }}>
            {eyebrow}
          </div>
          <h3
            className="mt-3 text-[1.2rem] leading-none tracking-[-0.03em] text-white"
            style={{ fontFamily: displayFont }}
          >
            {href ? (
              <Link href={href} className="transition hover:text-[#dce9ff]">
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
        </div>
        {href ? (
          <Link
            href={href}
            className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.12em] text-[#c2cad8] transition hover:border-[#8bb7ff] hover:bg-[#8bb7ff]/10 hover:text-white"
            style={{ fontFamily: monoFont }}
          >
            进入
          </Link>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
