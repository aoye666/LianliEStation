# Advertisement - 广告管理

## 页面布局

- **中央表格** - 广告列表(ID、标题、位置、状态、点击数、日期、操作)
- **顶部按钮区** - 新增广告、批量清理、查看统计
- **模态框** - 新增/编辑/详情/统计弹窗

---

## API 接口

### 1. `/api/advertisements` - 获取广告列表
**GET**

**使用位置:** 中央表格

**返回:**
```typescript
[
  {
    id: number;
    title: string;           // 表格:标题列
    content: string;
    image_url: string;
    target_url: string;
    position: string;        // 表格:投放位置列(banner/sidebar/popup)
    status: string;          // 表格:状态列(active/inactive/expired)
    clicks: number;          // 表格:点击数列
    start_date: string;      // 表格:开始日期列
    end_date: string;        // 表格:结束日期列
    created_at: string;
    updated_at: string;
  }
]
```

---

### 2. `/api/advertisements` - 创建新广告
**POST**

**使用位置:** 新增广告模态框提交

**请求:**
```typescript
{
  title: string;
  content: string;
  image_url: string;
  target_url: string;
  position: string;        // banner/sidebar/popup
  duration: number;        // 投放天数
}
```

**返回:**
```typescript
{
  success: boolean;
  message: string;
  data: { id: number; /* ... */ }
}
```

---

### 3. `/api/advertisements/:id` - 更新广告
**PUT**

**使用位置:** 编辑广告模态框提交

**请求:**
```typescript
{
  title?: string;
  content?: string;
  image_url?: string;
  target_url?: string;
  position?: string;
  status?: string;         // active/inactive/expired
  duration?: number;
}
```

**返回:**
```typescript
{
  success: boolean;
  message: string;
}
```

---

### 4. `/api/advertisements/:id` - 删除广告
**DELETE**

**使用位置:** 表格行删除按钮

**返回:**
```typescript
{
  success: boolean;
  message: string;
}
```

---

### 5. `/api/advertisements/cleanup` - 批量清理过期广告
**POST**

**使用位置:** 顶部批量清理按钮

**返回:**
```typescript
{
  success: boolean;
  message: string;
  deletedCount: number;
}
```

---

### 6. `/api/advertisements/stats` - 广告统计数据
**GET**

**使用位置:** 统计模态框

**返回:**
```typescript
{
  total: number;              // 总数
  active: number;             // 活跃数
  inactive: number;           // 暂停数
  expired: number;            // 过期数
  totalClicks: number;        // 总点击
  totalImpressions: number;   // 总展示
  avgCTR: number;            // 平均点击率
  byPosition: {              // 按位置分布(进度条)
    banner: number;
    sidebar: number;
    popup: number;
  };
}
```
