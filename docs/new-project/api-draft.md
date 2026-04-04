# MVP API 草案

## 1. 设计原则

- 前台展示优先读“已生成好的简报”
- 采集、生成、推送属于后台任务，不放进用户请求主链
- API 以 `issue` 为核心，而不是以“原始文章列表”为核心

## 2. 用户侧 API

### `POST /api/auth/sign-in`

用途：

- 邮箱登录或 magic link 触发

### `POST /api/auth/sign-out`

用途：

- 登出

### `GET /api/me`

用途：

- 返回当前用户资料、偏好设置、打卡状态

返回重点：

- `user`
- `settings`
- `currentStreak`
- `todayCheckinStatus`

### `PATCH /api/me/settings`

用途：

- 更新用户偏好

支持字段：

- `preferredTopics`
- `pushEmailEnabled`
- `pushWechatEnabled`
- `dailyPushTime`

### `GET /api/issues/today`

用途：

- 返回今天的简报首页数据

返回重点：

- `issueDate`
- `headline`
- `trendLine`
- `leadStory`
- `highlights`
- `sections`
- `checkinStatus`

### `GET /api/issues/:date`

用途：

- 返回历史某一天简报

### `POST /api/checkins/today`

用途：

- 提交今日打卡

返回重点：

- `success`
- `currentStreak`
- `bestStreak`
- `issueDate`

### `GET /api/checkins/history`

用途：

- 返回用户打卡历史和连续天数

## 3. 后台任务 API

### `POST /api/internal/collect/run`

用途：

- 手动触发采集任务

仅内部调用：

- cron
- 管理端
- 运维补跑

### `POST /api/internal/issues/generate`

用途：

- 基于已采集数据生成当日简报

### `POST /api/internal/issues/publish`

用途：

- 发布某一期简报

### `POST /api/internal/push/send`

用途：

- 按渠道发送某一期简报

参数建议：

- `issueDate`
- `channel`
- `targetUsers`

### `POST /api/internal/push/resend`

用途：

- 对失败推送做补发

## 4. 管理侧 API

### `GET /api/admin/sources`

用途：

- 查看信源列表与状态

### `PATCH /api/admin/sources/:id`

用途：

- 更新信源状态、优先级、抓取配置

### `GET /api/admin/issues`

用途：

- 查看历史简报与生成状态

### `GET /api/admin/issues/:id`

用途：

- 查看某一期简报详情

### `POST /api/admin/issues/:id/rebuild`

用途：

- 重新生成某一期简报

### `GET /api/admin/push/deliveries`

用途：

- 查看推送送达结果

## 5. 返回模型建议

### Issue View Model

```json
{
  "issueDate": "2026-04-05",
  "headline": "每日简报 | 科技与商业",
  "trendLine": "今天最值得关注的是模型商业化与自动驾驶节奏同步升温。",
  "leadStory": {},
  "highlights": [],
  "sections": []
}
```

### Checkin Response

```json
{
  "success": true,
  "issueDate": "2026-04-05",
  "currentStreak": 6,
  "bestStreak": 9
}
```

## 6. MVP 不做的 API

以下接口不进入第一版：

- 评论 / 点赞 / 关注
- 复杂搜索
- 个性化推荐流
- 多人协作后台
- 用户自定义复杂推送规则

## 7. 第一阶段优先实现顺序

1. `GET /api/issues/today`
2. `POST /api/checkins/today`
3. `GET /api/me`
4. `PATCH /api/me/settings`
5. `POST /api/internal/collect/run`
6. `POST /api/internal/issues/generate`
7. `POST /api/internal/push/send`

第一阶段目标不是 API 完整，而是先把“生成一份简报 -> 展示 -> 打卡 -> 推送”这条闭环跑通。
