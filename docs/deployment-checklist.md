# 部署清单

这份清单用于把 `Intelly Daily Brief` 从本地项目推进到正式可访问环境。

## 1. GitHub 仓库

1. 在 GitHub 创建一个新仓库，例如 `intelly-daily-brief`
2. 在本地项目根目录执行：

```bash
git remote add origin git@github.com:<your-account>/intelly-daily-brief.git
git push -u origin main
```

如果使用 HTTPS：

```bash
git remote add origin https://github.com/<your-account>/intelly-daily-brief.git
git push -u origin main
```

## 2. Vercel 项目

1. 登录 Vercel：

```bash
vercel login
```

2. 在项目根目录执行首次部署：

```bash
vercel
```

3. 将生产环境变量补到 Vercel：

- `APP_URL`
- `BRIEF_RECIPIENT_EMAIL`
- `BRIEF_TIMEZONE`
- `CRON_SECRET`
- `OPENAI_API_KEY`（可选）
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` 或整套 `SMTP_*`

4. 再执行生产部署：

```bash
vercel --prod
```

## 3. 定时任务校验

部署后检查：

- `vercel.json` 中的 `/api/cron/daily-brief`
- Vercel 项目是否已开启 Cron
- 线上环境变量中的 `CRON_SECRET` 是否正确

手动触发一次：

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" \
  "<APP_URL>/api/cron/daily-brief?issueDate=2026-04-04"
```

## 4. 邮件投递

当前项目支持两条路：

- `Resend`
- `SMTP`

如果使用 Gmail SMTP，建议：

- 开启 2FA
- 使用 App Password
- 使用 `smtp.gmail.com:465`

## 5. 上线前检查

- `npm run typecheck`
- `npm run build`
- 首页 `/`
- 历史页 `/issues`
- 板块页 `/sections/ai?date=2026-04-04`
- 推送预览 `/push/preview`
- 管理台 `/admin`

## 6. 当前本地状态

当前工作区已经完成：

- 项目目录改名为 `intelly-daily-brief`
- 本地 git 仓库初始化
- SMTP 发送能力接入代码
- Vercel 配置文件就绪

仍需要人工登录完成：

- GitHub 认证与首次推送
- Vercel 登录与首次正式部署
- 微信机器人配置
