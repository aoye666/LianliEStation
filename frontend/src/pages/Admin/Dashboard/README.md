# Dashboard - 数据监控面板

## 页面布局

- **顶部统计卡片区** - 8 个关键指标卡片(4列布局)
- **中部图表区** - 访问趋势折线图(左,占 2/3) + 用户分布饼图(右,占 1/3)
- **下部图表区** - 内容分布环形图、用户活动柱状图、广告点击排行榜(各占 1/3)
- **底部表格区** - 热门关键词表格(左) + AI/事件统计表格(右)

---

## API 接口

### 1. `/api/admin/stats` - 基础统计数据
**GET**

**使用位置:** 顶部 8 个统计卡片、访问趋势图、用户分布图、内容分布图

**返回:**
```typescript
{
  totalUsers: number;        // 用户总数卡片
  activeUsers: number;       // 活跃用户卡片、用户分布图
  totalPosts: number;        // 帖子总数卡片、内容分布图
  totalGoods: number;        // 商品总数卡片、内容分布图
  todayVisits: number;       // 今日访问卡片、访问趋势图
  todayRegistrations: number;
}
```

---

### 2. `/api/admin/ai/stats` - AI 服务统计
**GET**

**使用位置:** AI 调用次数卡片、AI 统计表格

**返回:**
```typescript
{
  total_calls: number;       // AI 调用次数卡片
  success_calls: number;     // 表格:成功次数
  failed_calls: number;      // 表格:失败次数
  avg_response_time: number; // 表格:平均响应时间
}
```

---

### 3. `/api/admin/event-stats` - 用户事件统计
**GET**

**使用位置:** 活跃用户卡片、完成交易卡片、用户活动柱状图、访问趋势图、事件统计表格

**返回:**
```typescript
{
  visit: { active_users: number };                    // 活跃用户卡片
  publish_goods_tag: { total_count: number };         // 柱状图
  publish_post_tag: { total_count: number };          // 柱状图
  favorite_goods_tag: { total_count: number };        // 柱状图
  favorite_post_tag: { total_count: number };         // 柱状图
  completed_transaction: { total_count: number };     // 完成交易卡片、柱状图
  ad_click: { total_clicks: number };                 // 广告点击卡片
  recent_7_days: { [date: string]: number };          // 访问趋势折线图
}
```

---

### 4. `/api/advertisements/stats` - 广告点击统计
**GET**

**使用位置:** 广告点击数卡片、广告点击排行榜(右下角进度条)

**返回:**
```typescript
[
  {
    id: number;
    title: string;
    clicks: number;      // 排行榜进度条数值
  }
]
```

---

### 5. `/api/admin/search-keywords?limit=10` - 热门搜索关键词
**GET**

**使用位置:** 左下角关键词表格

**参数:**
- `limit=10` - 返回前 10 条

**返回:**
```typescript
[
  {
    keyword: string;        // 表格:关键词列
    search_count: number;   // 表格:搜索次数列
    updated_at: string;     // 表格:最后搜索时间列
  }
]
```
