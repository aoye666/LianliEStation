# Messages - 消息管理

## 页面布局

- **左侧表格** - 消息历史列表(标题、类型、发送目标、已读/总数、发送时间)
- **右侧表单** - 发送新消息表单(标题、内容、类型、目标用户)
- **模态框** - 消息统计详情弹窗

---

## API 接口

### 1. `/api/admin/messages` - 获取消息列表
**GET**

**使用位置:** 左侧消息历史表格

**参数:**
- `page` - 页码
- `limit` - 每页数量
- `type` - 消息类型(system/announcement/notice)

**返回:**
```typescript
{
  messages: Array<{
    id: number;
    title: string;           // 表格:标题列
    content: string;
    type: string;            // 表格:类型列
    target: string;          // 表格:发送目标列(all/user/group)
    target_ids: number[];
    read_count: number;      // 表格:已读数
    total_count: number;     // 表格:总发送数
    created_at: string;      // 表格:发送时间列
    sender: {
      id: number;
      username: string;
    };
  }>;
  total: number;
}
```

---

### 2. `/api/admin/messages/send` - 发送消息
**POST**

**使用位置:** 右侧发送消息表单提交

**请求:**
```typescript
{
  title: string;             // 表单:标题
  content: string;           // 表单:内容
  type: string;              // 表单:类型(system/announcement/notice)
  target: string;            // 表单:目标(all/user/group)
  target_ids?: number[];     // 表单:目标用户ID列表
}
```

**返回:**
```typescript
{
  success: boolean;
  message: string;
  sent_count: number;
}
```

---

### 3. `/api/admin/messages/:id` - 删除消息
**DELETE**

**使用位置:** 表格行删除按钮

---

### 4. `/api/admin/messages/:id/stats` - 消息统计
**GET**

**使用位置:** 统计详情模态框

**返回:**
```typescript
{
  total_sent: number;        // 模态框:总发送数
  read_count: number;        // 模态框:已读数量
  unread_count: number;      // 模态框:未读数量
  read_rate: number;         // 模态框:阅读率
  read_users: Array<{        // 模态框:已读用户列表
    user_id: number;
    username: string;
    read_at: string;
  }>;
}
```
