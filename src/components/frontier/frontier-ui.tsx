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

type StatProps = {
  label: string;
  value: string | number;
  hint?: string;
};

type StoryCardProps = {
  href: string;
  title: string;
  meta: string;
  summary: string;
  cta?: string;
  image?: string;
};

type HeroProps = {
  kicker: string;
  title: string;
  summary: string;
  meta: string;
  href: string;
  image?: string;
};

type ColumnProps = {
  index: string;
  title: string;
  strap: string;
  count: string;
  href?: string;
  children: ReactNode;
};

const displayFont =
  '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Source Han Serif SC", "Songti SC", serif';
const bodyFont =
  '"Avenir Next", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", sans-serif';

function resolveImage(url?: string) {
  return url?.trim() ? url : null;
}

export function FrontierShell({ eyebrow, title, description, actions, children }: ShellProps) {
  return (
    <main
      className="min-h-screen bg-[#f4efe6] px-4 py-5 text-[#161616] md:px-6 md:py-8"
      style={{ fontFamily: bodyFont }}
    >
      <div className="mx-auto max-w-[1520px]">
        <div className="overflow-hidden rounded-[32px] border border-[#1a1a1a]/10 bg-[#fbf7ef] shadow-[0_32px_120px_rgba(48,35,24,0.12)]">
          <div className="relative overflow-hidden border-b border-[#1a1a1a]/8 px-6 py-7 md:px-10 md:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(171,110,71,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(25,61,79,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.82),rgba(251,247,239,0.98))]" />
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(15,23,42,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.45)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[56rem]">
                <div className="text-[0.72rem] uppercase tracking-[0.42em] text-[#9f5734]">{eyebrow}</div>
                <h1
                  className="mt-4 text-[2.6rem] leading-[0.96] tracking-[-0.06em] text-[#131313] md:text-[4rem]"
                  style={{ fontFamily: displayFont }}
                >
                  {title}
                </h1>
                <p className="mt-4 max-w-[45rem] text-[1rem] leading-8 text-[#51473c] md:text-[1.05rem]">
                  {description}
                </p>
              </div>
              {actions ? <div className="relative flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </div>
          <div className="px-4 py-4 md:px-6 md:py-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function FrontierAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-[#1a1a1a]/12 bg-white/75 px-4 py-2 text-[0.82rem] tracking-[0.12em] text-[#53473d] transition hover:-translate-y-0.5 hover:border-[#9f5734] hover:text-[#9f5734]"
    >
      {children}
    </Link>
  );
}

export function FrontierStat({ label, value, hint }: StatProps) {
  return (
    <div className="rounded-[24px] border border-[#1a1a1a]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(249,241,230,0.88))] px-5 py-5 shadow-[0_16px_40px_rgba(48,35,24,0.06)]">
      <div className="text-[0.72rem] uppercase tracking-[0.3em] text-[#8b5b40]">{label}</div>
      <div
        className="mt-3 text-[2.4rem] leading-none tracking-[-0.08em] text-[#161616]"
        style={{ fontFamily: displayFont }}
      >
        {value}
      </div>
      {hint ? <div className="mt-3 text-[0.88rem] leading-6 text-[#62584d]">{hint}</div> : null}
    </div>
  );
}

export function FrontierHero({ kicker, title, summary, meta, href, image }: HeroProps) {
  const imageUrl = resolveImage(image);

  return (
    <section className="grid gap-5 rounded-[30px] border border-[#1a1a1a]/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(248,239,228,0.92))] p-5 shadow-[0_24px_70px_rgba(48,35,24,0.08)] lg:grid-cols-[1.18fr_0.82fr] lg:p-7">
      <div className="flex flex-col justify-between">
        <div>
          <div className="text-[0.76rem] uppercase tracking-[0.28em] text-[#8b5b40]">{kicker}</div>
          <h2
            className="mt-4 max-w-[14ch] text-[2.4rem] leading-[0.94] tracking-[-0.06em] text-[#131313] md:text-[3.5rem]"
            style={{ fontFamily: displayFont }}
          >
            {title}
          </h2>
          <div className="mt-5 max-w-[46rem] text-[1.02rem] leading-8 text-[#4e453c]">{summary}</div>
        </div>
        <div className="mt-6 flex flex-col gap-4 border-t border-[#1a1a1a]/10 pt-5 md:flex-row md:items-center md:justify-between">
          <div className="text-[0.84rem] uppercase tracking-[0.18em] text-[#786a5c]">{meta}</div>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#9f5734]/25 bg-[#9f5734] px-5 py-2 text-[0.82rem] tracking-[0.16em] text-[#fff8f0] transition hover:bg-[#874a2b]"
          >
            深读头条
          </a>
        </div>
      </div>

      <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-[#1a1a1a]/10 bg-[#e7ddd0]">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={title}
              fill
              unoptimized
              className="object-cover saturate-[0.9]"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.05),rgba(17,17,17,0.45))]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(159,87,52,0.4),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(33,64,78,0.35),transparent_44%),linear-gradient(135deg,#f0e4d3,#d9d0c2)]" />
            <div className="absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgba(17,17,17,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(17,17,17,0.8)_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="absolute bottom-5 left-5 right-5 rounded-[22px] border border-white/30 bg-white/20 p-4 backdrop-blur-md">
              <div className="text-[0.72rem] uppercase tracking-[0.32em] text-white/80">Lead Signal</div>
              <div
                className="mt-3 text-[1.2rem] leading-7 tracking-[-0.03em] text-white"
                style={{ fontFamily: displayFont }}
              >
                今日头条仍以文字判断为主，画面退到材质化处理，避免无关图像稀释信息密度。
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function FrontierColumn({ index, title, strap, count, href, children }: ColumnProps) {
  const titleNode = href ? <Link href={href}>{title}</Link> : title;

  return (
    <section className="rounded-[28px] border border-[#1a1a1a]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,241,232,0.9))] p-5 shadow-[0_18px_48px_rgba(48,35,24,0.06)]">
      <div className="flex items-start justify-between gap-4 border-b border-[#1a1a1a]/10 pb-4">
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.32em] text-[#8b5b40]">{index}</div>
          <h3
            className="mt-3 text-[1.6rem] leading-none tracking-[-0.05em] text-[#161616]"
            style={{ fontFamily: displayFont }}
          >
            {titleNode}
          </h3>
          <div className="mt-2 max-w-[24rem] text-[0.9rem] leading-7 text-[#63584b]">{strap}</div>
        </div>
        <div className="rounded-full border border-[#1a1a1a]/10 bg-white/80 px-3 py-1 text-[0.76rem] tracking-[0.18em] text-[#6e6256]">
          {count}
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function FrontierStoryCard({ href, title, meta, summary, cta, image }: StoryCardProps) {
  const imageUrl = resolveImage(image);

  return (
    <article className="group overflow-hidden rounded-[22px] border border-[#1a1a1a]/10 bg-white/75 transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(48,35,24,0.08)]">
      {imageUrl ? (
        <div className="relative aspect-[16/10] overflow-hidden border-b border-[#1a1a1a]/8 bg-[#ddd1c2]">
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 32vw, 100vw"
          />
        </div>
      ) : null}
      <div className="p-4">
        <div className="text-[0.74rem] uppercase tracking-[0.18em] text-[#7d7062]">{meta}</div>
        <h4
          className="mt-3 text-[1.18rem] leading-8 tracking-[-0.03em] text-[#161616]"
          style={{ fontFamily: displayFont }}
        >
          <a href={href} target="_blank" rel="noreferrer" className="transition group-hover:text-[#9f5734]">
            {title}
          </a>
        </h4>
        <p className="mt-3 text-[0.95rem] leading-7 text-[#55493f]">{summary}</p>
        {cta ? (
          <div className="mt-4 text-[0.8rem] uppercase tracking-[0.2em] text-[#9f5734]">{cta}</div>
        ) : null}
      </div>
    </article>
  );
}

export function FrontierSidebarPanel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-[#1a1a1a]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,239,229,0.9))] p-5 shadow-[0_16px_42px_rgba(48,35,24,0.06)]">
      <div className="text-[0.72rem] uppercase tracking-[0.3em] text-[#8b5b40]">{eyebrow}</div>
      <h3
        className="mt-3 text-[1.45rem] leading-none tracking-[-0.04em] text-[#181818]"
        style={{ fontFamily: displayFont }}
      >
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

