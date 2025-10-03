# Forum - 论坛管理

## 页面布局

- **中央表格** - 帖子列表(标题、作者、状态、点赞数、评论数、浏览数、是否置顶、发布时间、操作)
- **顶部搜索区** - 搜索框、状态筛选
- **操作按钮** - 审核通过/拒绝、置顶/取消置顶、删除

---

## API 接口

### 1. `/api/admin/posts` - 获取帖子列表
**GET**

**使用位置:** 中央表格

**参数:**
- `page` - 页码
- `limit` - 每页数量
- `status` - 状态筛选(pending/approved/rejected)
- `search` - 搜索关键词

**返回:**
```typescript
{
  posts: Array<{
    id: number;
    title: string;           // 表格:标题列
    content: string;
    author: {                // 表格:作者列
      id: number;
      username: string;
      avatar: string;
    };
    status: string;          // 表格:状态列
    likes: number;           // 表格:点赞数列
    comments: number;        // 表格:评论数列
    views: number;           // 表格:浏览数列
    is_pinned: boolean;      // 表格:是否置顶列
    created_at: string;      // 表格:发布时间列
  }>;
  total: number;
}
```

---

### 2. `/api/admin/posts/:id` - 删除帖子
**DELETE**

**使用位置:** 表格行删除按钮

---

### 3. `/api/admin/posts/:id/pin` - 置顶帖子
**POST**

**使用位置:** 表格行置顶按钮

---

### 4. `/api/admin/posts/:id/approve` - 审核通过
**POST**

**使用位置:** 表格行审核通过按钮

---

### 5. `/api/admin/posts/:id/reject` - 审核拒绝
**POST**

**使用位置:** 表格行审核拒绝按钮

**请求:**
```typescript
{
  reason: string;            // 拒绝原因
}
```
