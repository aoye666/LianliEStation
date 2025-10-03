# Users - 用户管理

## 页面布局

- **中央表格** - 用户列表(用户名、昵称、角色、状态、发帖数、商品数、注册时间、操作)
- **顶部搜索区** - 搜索框、角色筛选、状态筛选
- **模态框** - 用户详情、封禁/解封弹窗

---

## API 接口

### 1. `/api/admin/users` - 获取用户列表

**GET**

**使用位置:** 中央表格

**参数:**

- `page` - 页码
- `limit` - 每页数量
- `search` - 搜索关键词
- `role` - 角色筛选(user/admin/super_admin)
- `status` - 状态筛选(active/banned)

**返回:**

```typescript
{
  users: Array<{
    id: number;
    username: string; // 表格:用户名列
    nickname: string; // 表格:昵称列
    email: string;
    avatar: string;
    role: string; // 表格:角色列
    status: string; // 表格:状态列
    posts_count: number; // 表格:发帖数列
    goods_count: number; // 表格:商品数列
    created_at: string; // 表格:注册时间列
  }>;
  total: number;
  page: number;
  totalPages: number;
}
```

---

### 2. `/api/admin/users/:id` - 获取用户详情

**GET**

**使用位置:** 用户详情模态框

**返回:**

```typescript
{
  // 基础信息 + 扩展信息
  login_history: Array<{
    // 详情:登录历史
    ip: string;
    location: string;
    login_time: string;
  }>;
  posts: Array<{
    // 详情:发布的帖子
    id: number;
    title: string;
    created_at: string;
  }>;
  goods: Array<{
    // 详情:发布的商品
    id: number;
    title: string;
    price: number;
    created_at: string;
  }>;
}
```

---

### 3. `/api/admin/users/:id/ban` - 封禁用户

**POST**

**使用位置:** 封禁按钮

**请求:**

```typescript
{
  reason: string; // 封禁原因
  duration: number; // 封禁天数(0=永久)
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

### 4. `/api/admin/users/:id/unban` - 解封用户

**POST**

**使用位置:** 解封按钮

**返回:**

```typescript
{
  success: boolean;
  message: string;
}
```

---

### 5. `/api/admin/users/:id/role` - 修改用户角色

**PUT**

**使用位置:** 角色修改按钮

**请求:**

```typescript
{
  role: string; // user/admin/super_admin
}
```

**返回:**

```typescript
{
  success: boolean;
  message: string;
}
```
