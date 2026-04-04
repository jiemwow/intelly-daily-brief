# 数据库表设计草案

## 1. 设计原则

- 原始采集与最终成稿分离
- 每日简报按 `issue` 版本化
- 打卡、推送、用户偏好独立建模
- 尽量支持后续增加板块、来源和渠道

## 2. 核心表

### users

用途：用户基础信息

关键字段：

- `id`
- `email`
- `display_name`
- `avatar_url`
- `timezone`
- `created_at`
- `updated_at`

### user_settings

用途：用户偏好和通知设置

关键字段：

- `user_id`
- `preferred_topics`
- `push_email_enabled`
- `push_wechat_enabled`
- `daily_push_time`
- `language`

### auth_accounts

用途：登录方式绑定

关键字段：

- `id`
- `user_id`
- `provider`
- `provider_account_id`
- `created_at`

### sources

用途：信源注册表

关键字段：

- `id`
- `source_id`
- `name`
- `domain`
- `channel_type`
- `entry_url`
- `topics`
- `regions`
- `trust_level`
- `priority`
- `fetch_interval_minutes`
- `status`
- `last_success_at`
- `last_failure_at`
- `notes`

### source_fetch_logs

用途：抓取任务日志

关键字段：

- `id`
- `source_id`
- `started_at`
- `finished_at`
- `status`
- `fetched_count`
- `error_message`

### raw_articles

用途：保存原始抓取结果

关键字段：

- `id`
- `source_id`
- `external_id`
- `title_raw`
- `url`
- `published_at`
- `author_raw`
- `summary_raw`
- `content_raw`
- `image_url_raw`
- `language`
- `fetched_at`

约束建议：

- `source_id + url` 建唯一索引

### normalized_articles

用途：归一化后的候选内容

关键字段：

- `id`
- `raw_article_id`
- `canonical_url`
- `title`
- `summary`
- `content_text`
- `image_url`
- `published_at`
- `primary_topic`
- `secondary_topics`
- `region`
- `trust_score`
- `quality_score`
- `status`

### article_clusters

用途：同一事件多源聚类

关键字段：

- `id`
- `cluster_key`
- `representative_article_id`
- `topic`
- `region`
- `confidence_score`
- `created_at`

### article_cluster_items

用途：聚类成员关系

关键字段：

- `cluster_id`
- `normalized_article_id`
- `rank_in_cluster`

### brief_issues

用途：每日简报主记录

关键字段：

- `id`
- `issue_date`
- `status`
- `headline`
- `trend_line`
- `lead_item_id`
- `version`
- `generated_at`
- `published_at`

约束建议：

- `issue_date + version` 唯一

### brief_sections

用途：每期简报的板块

关键字段：

- `id`
- `brief_issue_id`
- `section_key`
- `title`
- `sort_order`

### brief_items

用途：最终成稿条目

关键字段：

- `id`
- `brief_issue_id`
- `brief_section_id`
- `source_article_id`
- `cluster_id`
- `title`
- `summary`
- `why_it_matters`
- `source_name`
- `target_url`
- `image_url`
- `sort_order`
- `is_lead`
- `is_highlight`

### checkin_records

用途：用户每日打卡记录

关键字段：

- `id`
- `user_id`
- `issue_date`
- `brief_issue_id`
- `status`
- `checked_in_at`

约束建议：

- `user_id + issue_date` 唯一

### user_streaks

用途：连续打卡状态快照

关键字段：

- `user_id`
- `current_streak`
- `best_streak`
- `last_checkin_date`
- `updated_at`

### push_subscriptions

用途：用户渠道订阅

关键字段：

- `id`
- `user_id`
- `channel`
- `endpoint`
- `status`
- `verified_at`

### push_deliveries

用途：每次推送记录

关键字段：

- `id`
- `brief_issue_id`
- `user_id`
- `channel`
- `status`
- `sent_at`
- `delivered_at`
- `error_message`

## 3. MVP 最少实现集合

第一阶段最少需要落地这些表：

- `users`
- `user_settings`
- `sources`
- `raw_articles`
- `normalized_articles`
- `brief_issues`
- `brief_sections`
- `brief_items`
- `checkin_records`
- `user_streaks`
- `push_subscriptions`
- `push_deliveries`

`article_clusters` 和 `source_fetch_logs` 可以在第一阶段后半或第二阶段补齐，但结构上要预留。

## 4. 枚举建议

### channel_type

- `rss`
- `crawler`
- `dynamic`
- `pdf`
- `manual`

### trust_level

- `official`
- `mainstream`
- `vertical`
- `aggregated`

### issue_status

- `draft`
- `generated`
- `published`
- `failed`

### delivery_status

- `queued`
- `sent`
- `delivered`
- `failed`

### checkin_status

- `valid`
- `invalid`
- `revoked`

## 5. 关键索引建议

- `sources.status`
- `raw_articles.source_id + published_at`
- `normalized_articles.primary_topic + region + published_at`
- `brief_issues.issue_date`
- `brief_items.brief_issue_id + sort_order`
- `checkin_records.user_id + issue_date`
- `push_deliveries.user_id + channel + sent_at`

## 6. 建模边界

- `raw_articles` 永远保留原始值，不在上面覆盖编辑结果
- `brief_items` 是最终对用户展示的内容层，不直接复用 `normalized_articles`
- 用户看到的标题、摘要、理由，都应来自 `brief_items`
- 推送内容从 `brief_issue` 和 `brief_items` 派生，不直接读原始内容
