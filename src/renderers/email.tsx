import type { BriefItem, DailyBrief } from "@/types/brief";
import {
  buildDeck,
  buildDisplayTitle,
  formatPublishedAt,
  formatSourceLabel,
} from "@/lib/brief-format";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderItem(item: BriefItem): string {
  const link = item.canonicalUrl ?? item.url;

  return `
    <article style="padding:22px 0;border-top:1px solid #e9dece;">
      <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#8f7763;margin-bottom:12px;">${escapeHtml(formatSourceLabel(item.source))} · ${escapeHtml(formatPublishedAt(item.publishedAt))}</div>
      <h3 style="margin:0 0 12px;font-size:22px;line-height:1.45;color:#23150d;font-weight:600;">${escapeHtml(buildDisplayTitle(item))}</h3>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.9;color:#4b382d;">${escapeHtml(buildDeck(item))}</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.9;color:#23150d;"><strong>为什么重要：</strong>${escapeHtml(item.whyItMatters)}</p>
      <a href="${link}" style="color:#8c4e2f;text-decoration:none;font-weight:600;">查看原文</a>
    </article>
  `;
}

export function renderBriefEmail(brief: DailyBrief): string {
  const leadStory = brief.leadStory;
  const supportSections = brief.sections;
  const sectionsHtml = brief.sections
    .map(
      (section) => `
        <section style="margin-top:30px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;">
            <h2 style="margin:0;font-size:24px;line-height:1.2;color:#23150d;">${escapeHtml(section.title)}</h2>
            <span style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8f7763;">${section.items.length} 条</span>
          </div>
          ${section.items.map((item) => renderItem(item)).join("")}
        </section>
      `,
    )
    .join("");

  const highlightList = brief.topHighlights
    .map(
      (item) => `
        <div style="padding:0 0 14px;border-bottom:1px solid #e9dece;margin-bottom:14px;">
          <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8f7763;">重点条目</div>
          <p style="margin:10px 0 6px;font-size:18px;line-height:1.6;color:#23150d;font-weight:600;">${escapeHtml(buildDisplayTitle(item))}</p>
          <p style="margin:0;font-size:14px;line-height:1.85;color:#4b382d;">${escapeHtml(buildDeck(item))}</p>
        </div>
      `,
    )
    .join("");

  return `
  <!doctype html>
  <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(brief.headline)}</title>
    </head>
    <body style="margin:0;padding:0;background:#eee4d8;font-family:'PingFang SC','Hiragino Sans GB','Microsoft YaHei',Arial,Helvetica,sans-serif;color:#23150d;">
      <div style="padding:26px 14px;">
        <div style="max-width:960px;margin:0 auto;background:#fffdf8;border:1px solid #eadcca;border-radius:30px;overflow:hidden;box-shadow:0 22px 80px rgba(60,35,20,0.12);">
          <div style="padding:46px 34px;background:radial-gradient(circle at top right,rgba(151,93,58,0.18),transparent 26%),linear-gradient(135deg,#fff8ef 0%,#f2e7da 60%,#efe1d2 100%);border-bottom:1px solid #eadcca;">
            <div style="font-size:12px;letter-spacing:0.12em;color:#8f7763;">晨间情报版</div>
            <h1 style="margin:16px 0 10px;font-size:42px;line-height:1.08;color:#23150d;letter-spacing:-0.04em;">${escapeHtml(brief.headline)}</h1>
            <p style="margin:0 0 18px;font-size:16px;line-height:1.95;color:#4b382d;">${escapeHtml(brief.trendLine)}</p>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
              <div style="display:inline-block;padding:10px 14px;border-radius:999px;background:#23150d;color:#fff7ee;font-size:12px;letter-spacing:0.08em;">
                ${escapeHtml(brief.date)}
              </div>
              <div style="display:inline-block;padding:10px 14px;border-radius:999px;border:1px solid #d8c7b4;color:#6d5645;font-size:12px;letter-spacing:0.08em;">
                四栏浏览
              </div>
            </div>
          </div>

          <div style="padding:34px;">
            <section style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:28px;border-bottom:1px solid #e9dece;padding-bottom:30px;">
              <div style="padding-right:10px;border-right:1px solid #e9dece;">
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8f7763;margin-bottom:16px;">头版提要</div>
                <h2 style="margin:0 0 16px;font-size:34px;line-height:1.18;color:#23150d;letter-spacing:-0.04em;">${escapeHtml(buildDisplayTitle(leadStory))}</h2>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.95;color:#4b382d;">
                  ${escapeHtml(leadStory.summary)}
                </p>
                ${renderItem(leadStory)}
              </div>

              <div>
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8f7763;margin-bottom:16px;">今日重点</div>
                ${highlightList}
                <div style="margin-top:20px;border-top:1px solid #e9dece;padding-top:16px;">
                  <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8f7763;margin-bottom:12px;">快速切换</div>
                  ${supportSections
                    .map(
                      (section) => `
                        <div style="display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid #f0e6db;">
                          <span style="font-size:14px;line-height:1.8;color:#23150d;">${escapeHtml(section.title)}</span>
                          <span style="font-size:12px;line-height:1.8;color:#8f7763;">${section.items.length} 条</span>
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              </div>
            </section>

            <section style="margin-top:30px;column-gap:28px;">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8f7763;margin-bottom:12px;">专题版面</div>
              ${sectionsHtml}
            </section>

            <section style="margin-top:40px;padding-top:24px;border-top:1px solid #e9dece;">
              <p style="margin:0;font-size:12px;line-height:1.8;color:#8f7763;">
                本期覆盖全球与中国的人工智能、智能驾驶重点动态，并统一按北京时间展示时间信息。
              </p>
            </section>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}
