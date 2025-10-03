# Market - 商城管理

## 页面布局

- **中央表格** - 商品列表(标题、卖家、分类、价格、状态、浏览数、收藏数、是否推荐、发布时间、操作)
- **顶部搜索区** - 搜索框、状态筛选、分类筛选
- **操作按钮** - 审核通过/拒绝、推荐/取消推荐、删除

---

## API 接口

### 1. `/api/admin/goods` - 获取商品列表
**GET**

**使用位置:** 中央表格

**参数:**
- `page` - 页码
- `limit` - 每页数量
- `status` - 状态筛选(pending/approved/rejected/sold)
- `category` - 分类筛选
- `search` - 搜索关键词

**返回:**
```typescript
{
  goods: Array<{
    id: number;
    title: string;           // 表格:标题列
    description: string;
    price: number;           // 表格:价格列
    images: string[];
    seller: {                // 表格:卖家列
      id: number;
      username: string;
      avatar: string;
    };
    category: string;        // 表格:分类列
    status: string;          // 表格:状态列
    views: number;           // 表格:浏览数列
    favorites: number;       // 表格:收藏数列
    is_recommended: boolean; // 表格:是否推荐列
    created_at: string;      // 表格:发布时间列
  }>;
  total: number;
}
```

---

### 2. `/api/admin/goods/:id` - 删除商品
**DELETE**

**使用位置:** 表格行删除按钮

---

### 3. `/api/admin/goods/:id/recommend` - 推荐商品
**POST**

**使用位置:** 表格行推荐按钮

---

### 4. `/api/admin/goods/:id/approve` - 审核通过
**POST**

**使用位置:** 表格行审核通过按钮

---

### 5. `/api/admin/goods/:id/reject` - 审核拒绝
**POST**

**使用位置:** 表格行审核拒绝按钮

**请求:**
```typescript
{
  reason: string;            // 拒绝原因
}
```
