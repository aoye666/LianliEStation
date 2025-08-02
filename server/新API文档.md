# 新 API 文档

[toc]

## authRoutes

### 用户注册

基本信息

- 路径: `/api/auth/register`
- 方法: `POST`
- 描述: 注册新用户

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| ----------- | ------ | ---- | ------------------------ |
| nickname | String | 否 | 用户昵称，如不提供则默认为 "DUTers" |
| email | String | 是 | 用户邮箱，必须唯一 |
| password | String | 是 | 用户密码 |
| qq_id | String | 是 | QQ 号码 |
| username | String | 是 | 用户名，必须唯一 |
| campus_id | Number | 是 | 校区 ID |

请求体示例

```json
{
  "nickname": "DUTers",
  "email": "user@example.com",
  "password": "password123",
  "qq_id": "12345678",
  "username": "user123",
  "campus_id": 1
}
```

响应参数

| 状态码 | 内容类型         | 描述                        |
| ------ | ---------------- | --------------------------- |
| 201    | application/json | 注册成功                    |
| 400    | application/json | 参数错误或邮箱/用户名已存在 |
| 500    | application/json | 服务器错误                  |

响应示例

- 成功响应 (状态码：201)

  ```json
  {
    "message": "注册成功"
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "缺少必要参数"
  }
  ```

- 邮箱/用户名已存在 (状态码：400)

  ```json
  {
    "message": "邮箱已被注册"
  }
  ```

  或

  ```json
  {
    "message": "用户名已被注册"
  }
  ```

  或

  ```json
  {
    "message": "邮箱和用户名都已被注册"
  }
  ```

- 服务器错误 (状态码：500)
  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 该接口使用了请求频率限制 (rate limit)
- 注册操作会记录用户 IP 地址

---

### 用户登录

基本信息

- 路径: `/api/auth/login`
- 方法: `POST`
- 描述: 用户或管理员登录系统，获取身份验证令牌

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| ---------- | ------ | ---- | ------------------------------ |
| identifier | String | 是 | 用户名或邮箱（普通用户），或用户名（管理员） |
| password | String | 是 | 登录密码 |

请求体示例

```json
{
  "identifier": "user123",
  "password": "password123"
}
```

响应参数

| 状态码 | 内容类型         | 描述                            |
| ------ | ---------------- | ------------------------------- |
| 200    | application/json | 登录成功，返回 token 和用户类型 |
| 400    | application/json | 请求参数缺失                    |
| 401    | application/json | 用户不存在或密码错误            |
| 500    | application/json | 服务器错误                      |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "登录成功",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isAdmin": false
  }
  ```

- 请求参数缺失 (状态码：400)

  ```json
  {
    "message": "请正确输入用户名/邮箱和密码"
  }
  ```

- 用户名/密码错误 (状态码：401)

  ```json
  {
    "message": "用户名/邮箱或密码错误"
  }
  ```

- 服务器错误 (状态码：500)
  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 该接口使用了请求频率限制 (rate limit)
- 登录成功后会返回 JWT 令牌，有效期为 7 天
- 令牌应在后续请求中通过 Authorization 头部传递，格式为 `Bearer {token}`
- 对于普通用户，令牌包含用户 ID、用户名、昵称、校区 ID 和 QQ 信息
- 对于管理员，令牌只包含用户 ID、用户名和管理员标识

---

### 管理员注册（未启用）

基本信息

- 路径: `/api/auth/admin/register`
- 方法: `POST`
- 描述: 注册新管理员

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| -------- | ------ | ---- | --------------------------- |
| username | String | 是 | 管理员用户名，必须唯一 |
| password | String | 是 | 管理员密码 |
| email | String | 是 | 管理员邮箱，必须唯一 |

请求体示例

```json
{
  "username": "admin",
  "password": "admin123",
  "email": "admin@example.com"
}
```

---

### 请求验证码

基本信息

- **路径**: `/api/auth/verification`
- **方法**: `POST`
- **描述**: 向指定邮箱发送验证码，用于密码重置等需要验证身份的操作

请求参数
| 参数名 | 类型 | 必选 | 描述 |
|-------|------|------|------|
| email | String | 是 | 用户注册的邮箱地址 |

请求体示例

```json
{
  "email": "user@example.com"
}
```

响应参数
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 200 | application/json | 验证码发送成功 |
| 400 | application/json | 请求参数错误 |
| 500 | application/json | 服务器错误或邮件发送失败 |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "验证码已发送，请检查您的邮箱"
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "邮箱不能为空"
  }
  ```

- 服务器错误 (状态码：500)
  ```json
  {
    "message": "邮件发送失败"
  }
  ```

**备注**

- 该接口使用了请求频率限制 (verificationLimiter)，防止恶意请求
- 验证码临时存储在服务器内存中，有效期限短
- 实际生产环境中建议使用 Redis 等缓存服务存储验证码

---

### 修改密码

基本信息

- **路径**: `/api/auth/change-password`
- **方法**: `PUT`
- **描述**: 通过验证码验证身份后修改用户密码

请求参数
| 参数名 | 类型 | 必选 | 描述 |
|-------|------|------|------|
| email | String | 是 | 用户注册的邮箱地址 |
| newPassword | String | 是 | 用户设置的新密码 |
| verificationCode | String | 是 | 用户收到的验证码 |

请求体示例

```json
{
  "email": "user@example.com",
  "newPassword": "newSecurePassword123",
  "verificationCode": "123456"
}
```

响应参数
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 200 | application/json | 密码修改成功 |
| 400 | application/json | 请求参数错误或验证码错误 |
| 404 | application/json | 用户不存在 |
| 500 | application/json | 服务器错误 |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "密码修改成功"
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "缺少必要参数"
  }
  ```

- 验证码错误 (状态码：400)

  ```json
  {
    "message": "验证码错误或已过期"
  }
  ```

- 用户不存在 (状态码：404)

  ```json
  {
    "message": "用户不存在"
  }
  ```

- 服务器错误 (状态码：500)
  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 该接口使用了请求频率限制 (passwordChangeLimiter)，防止暴力破解
- 验证码必须与最近一次请求发送的验证码匹配
- 新密码会经过 bcrypt 加密后存储
- 验证码验证成功后即视为身份验证通过

## usersRoutes

### 获取用户资料

基本信息

- **路径**: `/api/users/profile`
- **方法**: `GET`
- **描述**: 获取当前用户的个人资料，包括基本信息、主题设置和用户记录

请求参数
| 参数名 | 类型 | 必选 | 描述 |
|-------|------|------|------|
| - | - | - | 无需请求参数，通过 Token 识别用户身份 |

请求头

```
Authorization: Bearer {token}
```

响应参数
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 200 | application/json | 成功获取用户资料 |
| 401 | application/json | 未提供 Token 或 Token 无效 |
| 404 | application/json | 用户不存在 |
| 500 | application/json | 服务器错误 |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "nickname": "测试用户",
    "username": "testuser",
    "campus_id": 1,
    "qq": "123456789",
    "email": "test@example.com",
    "credit": 100,
    "theme_id": 1,
    "background_url": "/uploads/background.jpg",
    "banner_url": "/uploads/banner.jpg",
    "avatar": "/uploads/avatar.jpg",
    "records": {
      "likes": [
        {
          "targetId": 123,
          "targetType": "post"
        },
        {
          "targetId": 456,
          "targetType": "goods"
        }
      ],
      "complaints": [
        {
          "targetId": 789,
          "targetType": "post"
        }
      ]
    }
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "Token 无效"
  }
  ```

- 用户不存在 (状态码：404)
  ```json
  {
    "message": "用户不存在"
  }
  ```

**备注**

- 该 API 合并了原来的 `/records` 功能，现在一次请求可获取完整的用户信息
- 用户只能查看自己的资料
- records 对象包含用户的所有点赞和投诉记录
- `targetType` 表示目标类型，可能的值包括：`post`（帖子）、`goods`（商品）
- `targetId` 表示目标对象的 ID
- 建议前端使用 localStorage 缓存主题相关信息，避免频繁请求

### 更新用户资料

基本信息

- **路径**: `/api/users/profile`
- **方法**: `PUT`
- **描述**: 更新当前用户的个人信息，包括基本资料和主题设置

请求参数
| 参数名 | 类型 | 必选 | 描述 |
|-------|------|------|------|
| nickname | String | 是 | 用户昵称 |
| qq_id | String | 是 | QQ 号码 |
| campus_id | Number | 是 | 校区 ID |
| theme_id | Number | 否 | 主题 ID，不提供则保持原值 |

请求头

```
Authorization: Bearer {token}
```

请求体示例

```json
{
  "nickname": "新昵称",
  "qq_id": "123456789",
  "campus_id": 2,
  "theme_id": 3
}
```

响应参数
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 200 | application/json | 更新成功 |
| 400 | application/json | 缺少必要参数 |
| 401 | application/json | 未提供 Token 或 Token 无效 |
| 404 | application/json | 用户不存在 |
| 500 | application/json | 服务器错误 |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "更新成功",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "缺少必要参数"
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "Token 无效"
  }
  ```

- 用户不存在 (状态码：404)
  ```json
  {
    "message": "用户不存在"
  }
  ```

**备注**

- 此 API 合并了个人资料更新和主题设置功能
- 更新成功后会返回新的 JWT 令牌，包含更新后的用户信息
- 客户端应使用返回的新 token 替换旧 token
- nickname、qq_id 和 campus_id 为必填项，theme_id 为可选项

### 上传用户图片

基本信息

- **路径**: `/api/users/profile/image`
- **方法**: `PUT`
- **描述**: 统一处理用户头像、背景图和 Banner 图的上传

请求参数
| 参数名 | 类型 | 必选 | 描述 |
|-------|------|------|------|
| type | String | 是 | 图片类型，必须是以下值之一：`avatar`（头像）、`background`（背景图）、`banner`（Banner 图）。作为查询参数提供 |
| image | File | 是 | 要上传的图片文件 |

请求头

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

请求示例

```
PUT /api/users/profile/image?type=avatar

备注：
/api/users/profile/image?type=avatar 上传头像
/api/users/profile/image?type=background 上传背景
/api/users/profile/image?type=banner 上传banner
```

响应参数
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 200 | application/json | 更新成功 |
| 400 | application/json | 未选择图片文件或无效的图片类型 |
| 401 | application/json | 未提供 Token 或 Token 无效 |
| 404 | application/json | 用户不存在 |
| 500 | application/json | 服务器错误 |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "更新成功",
    "url": "/uploads/avatar123.jpg",
    "type": "avatar"
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "请选择要上传的头像图片"
  }
  ```

  或

  ```json
  {
    "message": "无效的图片类型，必须是 avatar, background 或 banner"
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "Token 无效"
  }
  ```

- 用户不存在 (状态码：404)
  ```json
  {
    "message": "用户不存在"
  }
  ```

**备注**

- 此 API 合并了原先的三个图片上传接口（头像/背景/Banner）
- 通过查询参数`type`指定要上传的图片类型
- 图片上传后保存在服务器的`/uploads/`目录
- 如果用户已有自定义图片（非默认图片），旧图片将被自动删除
- 根据不同的图片类型，会更新用户表中的不同字段（avatar/background_url/banner_url）
- 使用 multipart/form-data 提交图片，字段名必须为"image"

### 获取用户点赞/投诉记录

**基本信息**

- **路径**: `/api/users/records`
- **方法**: `GET`
- **描述**: 获取当前用户的点赞记录和投诉记录

**请求参数**
无

**请求头**

```
Authorization: Bearer {token}
```

**请求示例**

```
GET /api/users/records
```

**响应参数**
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 200 | application/json | 获取成功 |
| 401 | application/json | 未提供 Token 或 Token 无效 |
| 500 | application/json | 服务器错误 |

**响应示例**

- 成功响应 (状态码：200)
  ```json
  {
    "likes": [
      {
        "targetId": 123,
        "targetType": "post"
      },
      {
        "targetId": 456,
        "targetType": "goods"
      }
    ]
  }
  ```
- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)
  ```json
  {
    "message": "Token 无效"
  }
  ```

**备注**

- 此 API 返回用户的所有点赞记录和投诉记录
- `targetType` 表示目标类型，可能的值包括：`post`、`goods`
- `targetId` 表示目标对象的 ID
- 点赞记录从 `likes` 表查询，投诉记录从 `complaints` 表查询
- 需要提供有效的认证 Token 才能访问

## goodsRoutes

### 软删除商品

基本信息

- **路径**: `/api/goods/:post_id`
- **方法**: `DELETE`
- **描述**: 用户软删除商品，将商品状态标记为已删除

请求参数
| 参数名 | 类型 | 必选 | 描述 |
|-------|------|------|------|
| post_id | String | 是 | 商品 ID，作为 URL 路径参数提供 |

请求头

```
Authorization: Bearer {token}
```

响应参数
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 200 | application/json | 删除成功 |
| 400 | application/json | 缺少必要参数 |
| 401 | application/json | 未提供 Token 或 Token 无效 |
| 404 | application/json | 商品未找到或用户无权删除 |
| 500 | application/json | 服务器错误 |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "商品已标记为删除"
  }
  ```

- 管理员删除成功 (状态码：200)

  ```json
  {
    "message": "管理员已删除商品"
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "缺少必要参数"
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "无效的 Token"
  }
  ```

- 商品未找到 (状态码：404)

  ```json
  {
    "message": "商品未找到或用户无权删除"
  }
  ```

- 服务器错误 (状态码：500)
  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 该接口执行的是软删除，实际上是将商品状态更新为"deleted"
- 用户只能删除自己创建的商品
- 管理员硬删除功能已移至 `/api/admin/goods/:goods_id` 接口
- 已删除的商品将不会出现在商品列表中

### 分页查询商品

基本信息

- **路径**: `/api/goods`
- **方法**: `GET`
- **描述**: 根据条件筛选和分页获取商品列表

请求参数
| 参数名 | 类型 | 必选 | 描述 |
|-------|------|------|------|
| keyword | String | 否 | 搜索关键词，会匹配标题和内容 |
| title | String | 否 | 商品标题关键词 |
| status | String | 否 | 商品状态 |
| campus_id | Number | 否 | 校区 ID |
| goods_type | String | 否 | 商品类型 |
| tag | String | 否 | 商品标签 |
| min_price | Number | 否 | 最低价格 |
| max_price | Number | 否 | 最高价格 |
| page | Number | 否 | 页码，不提供则返回所有结果 |
| limit | Number | 否 | 每页数量，与 page 一起使用 |

请求示例

```
GET /api/goods?keyword=电脑&campus_id=1&min_price=1000&max_price=5000&page=1&limit=10
```

响应参数
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 200 | application/json | 成功获取商品列表 |
| 500 | application/json | 服务器错误 |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "total": 3,
    "count": 1,
    "page": 1,
    "limit": 1,
    "goods": [
      {
        "id": 3,
        "title": "开发区校区代取快递",
        "content": "大件3元/件，小件2元/件（20:00前可预约）",
        "goods_type": "receive",
        "tag": "服务",
        "author_id": 3,
        "created_at": "2025-01-03T04:00:00.000Z",
        "status": "active",
        "price": "2.00",
        "campus_id": 1,
        "likes": 0,
        "complaints": 0,
        "images": [],
        "author_qq_id": "12345",
        "author_nickname": "晁慧",
        "author_credit": 100,
        "author_avatar": "/uploads/default.png"
      }
    ]
  }
  ```

- 无结果响应 (状态码：200)

  ```json
  {
    "total": 0,
    "count": 0,
    "page": 1,
    "limit": 10,
    "goods": []
  }
  ```

- 服务器错误 (状态码：500)
  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 查询结果按照商品 ID 降序排列（最新发布的商品排在前面）
- 默认不返回已删除（status='deleted'）的商品
- 响应中的商品包含关联的图片 URLs
- 当使用分页时，需同时提供 page 和 limit 参数
- 不使用分页时，将返回所有符合条件的商品
- total 表示符合条件的总商品数，count 表示当前页面返回的商品数

### 修改商品信息

基本信息

- **路径**: `/api/goods/:post_id`
- **方法**: `PUT`
- **描述**: 更新指定商品的信息，包括文本信息和图片

请求参数
| 参数名 | 类型 | 必选 | 描述 |
|-------|------|------|------|
| post_id | String | 是 | 商品 ID，作为 URL 路径参数提供 |
| title | String | 是 | 商品标题 |
| content | String | 否 | 商品描述内容 |
| price | Number | 是 | 商品价格 |
| campus_id | Number | 是 | 校区 ID |
| status | String | 是 | 商品状态 |
| goods_type | String | 是 | 商品类型 |
| tag | String | 否 | 商品标签 |
| images | File[] | 否 | 商品图片，最多 3 张 |

请求头

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

请求体示例

```
FormData:
title: "二手笔记本电脑"
content: "9成新笔记本电脑，性能良好，电池续航6小时"
price: 3000
campus_id: 1
status: "available"
goods_type: "electronic"
tag: "computer"
images: [文件1.jpg, 文件2.jpg]
```

响应参数
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 200 | application/json | 更新成功 |
| 400 | application/json | 缺少必要参数或参数错误 |
| 401 | application/json | 未提供 Token 或 Token 无效 |
| 404 | application/json | 商品未找到或用户无权修改 |
| 500 | application/json | 服务器错误 |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "商品更新成功"
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "缺少必要参数"
  }
  ```

  或

  ```json
  {
    "message": "价格必须是数字"
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "无效的 Token"
  }
  ```

- 商品未找到 (状态码：404)

  ```json
  {
    "message": "商品未找到或用户无权修改"
  }
  ```

- 服务器错误 (状态码：500)
  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 普通用户只能修改自己发布的商品，管理员可以修改任何商品
- 上传新图片时会删除该商品原有的所有图片
- 图片上传字段名必须为"images"，最多允许上传 3 张图片
- 图片将保存在服务器的`/uploads/`目录，并通过 post_images 表与商品关联
- 如果只想更新商品文本信息而不更改图片，请不要包含 images 字段

## forumRoutes

### 删除帖子

基本信息

- **路径**: `/api/forum/posts/:post_id`
- **方法**: `DELETE`
- **描述**: 用户软删除校园墙帖子（修改状态为 deleted）

请求参数

| 参数名  | 类型   | 必选 | 描述                           |
| ------- | ------ | ---- | ------------------------------ |
| post_id | String | 是   | 帖子 ID，作为 URL 路径参数提供 |

请求头

```
Authorization: Bearer {token}
```

响应参数

| 状态码 | 内容类型         | 描述                               |
| ------ | ---------------- | ---------------------------------- |
| 200    | application/json | 删除成功                           |
| 401    | application/json | 未提供 Token 或 Token 无效         |
| 403    | application/json | 没有权限删除此帖子（针对普通用户） |
| 404    | application/json | 帖子不存在（针对管理员）           |
| 500    | application/json | 服务器错误                         |

响应示例

- 普通用户删除成功 (状态码：200)

  ```json
  {
    "message": "删除成功"
  }
  ```

- 管理员删除成功 (状态码：200)

  ```json
  {
    "message": "管理员已完全删除帖子"
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "无效的Token"
  }
  ```

- 权限不足 (状态码：403)

  ```json
  {
    "message": "没有权限删除此帖子"
  }
  ```

- 帖子不存在 (状态码：404)

  ```json
  {
    "message": "帖子不存在"
  }
  ```

- 服务器错误 (状态码：500)

  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 该接口只支持用户软删除操作，将帖子状态更新为"deleted"
- 用户只能删除自己发布的帖子
- 管理员硬删除功能已移至 `/api/admin/posts/:post_id` 接口
- 已软删除的帖子将不会出现在帖子列表中

### 处理帖子互动

基本信息

- 路径: `/posts/interact/:post_id`
- 方法: `POST`
- 描述: 处理用户对帖子进行的交互，包括点赞、投诉和评论。

请求参数

| 参数名    | 类型   | 必选 | 描述                                                                      |
| --------- | ------ | ---- | ------------------------------------------------------------------------- |
| post_id   | Number | 是   | 帖子 ID (URL 参数)                                                        |
| action    | String | 是   | 交互类型，"like"（点赞）、"complaint"（投诉）或 "comment"（评论）         |
| content   | String | 否   | 评论内容，仅在 action 为 "comment" 时需要                                 |
| parent_id | Number | 否   | 如果是回复评论，则提供父评论的 ID                                         |
| value     | Number | 否   | 操作值，仅在 action 为 "like" 或 "complaint" 时需要 (1 为添加, -1 为取消) |

请求头

| 参数名        | 类型   | 必选 | 描述                                  |
| ------------- | ------ | ---- | ------------------------------------- |
| Authorization | String | 是   | 身份验证令牌，格式为 `Bearer {token}` |

请求体示例

- 点赞请求

```json
{
  "action": "like",
  "value": 1
}
```

- 取消点赞请求

```json
{
  "action": "like",
  "value": -1
}
```

- 投诉请求

```json
{
  "action": "complaint",
  "value": 1
}
```

- 取消投诉请求

```json
{
  "action": "complaint",
  "value": -1
}
```

- 评论请求

```json
{
  "action": "comment",
  "content": "这是一个评论内容"
}
```

- 回复评论请求

```json
{
  "action": "comment",
  "content": "这是对某条评论的回复",
  "parent_id": 123
}
```

响应参数

| 状态码 | 内容类型         | 描述                               |
| ------ | ---------------- | ---------------------------------- |
| 200    | application/json | 点赞/投诉成功或取消成功            |
| 201    | application/json | 评论发布成功                       |
| 400    | application/json | 缺少必要参数、无效的参数或重复操作 |
| 401    | application/json | 未提供 Token 或 Token 无效         |
| 404    | application/json | 帖子或评论不存在                   |
| 500    | application/json | 服务器错误                         |

响应示例

- 点赞成功 (状态码：200)

```json
{
  "message": "点赞成功"
}
```

- 取消点赞成功 (状态码：200)

```json
{
  "message": "取消点赞成功"
}
```

- 投诉成功 (状态码：200)

```json
{
  "message": "投诉成功"
}
```

- 取消投诉成功 (状态码：200)

```json
{
  "message": "取消投诉成功"
}
```

- 评论发布成功 (状态码：201)

```json
{
  "message": "评论发布成功",
  "comment": {
    "id": 123,
    "content": "这是一个评论内容",
    "created_at": "2025-04-28T00:00:00Z",
    "parent_id": null,
    "user": {
      "id": 1,
      "nickname": "张三",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

- 缺少参数 (状态码：400)

```json
{
  "message": "评论内容不能为空"
}
```

或

```json
{
  "message": "缺少 value 参数"
}
```

或

```json
{
  "message": "无效的 value 参数，必须是 1 或 -1"
}
```

- 重复操作 (状态码：400)

```json
{
  "message": "您已经点赞过了"
}
```

或

```json
{
  "message": "您已经投诉过了"
}
```

或

```json
{
  "message": "您还没有点赞过"
}
```

或

```json
{
  "message": "您还没有投诉过"
}
```

- 帖子不存在或已删除 (状态码：404)

```json
{
  "message": "帖子不存在或已被删除"
}
```

- 回复的评论不存在 (状态码：404)

```json
{
  "message": "回复的评论不存在或已被删除"
}
```

- Token 无效 (状态码：401)

```json
{
  "message": "无效的Token"
}
```

- 无效的交互类型 (状态码：400)

```json
{
  "message": "无效的交互类型，必须是 like、complaint 或 comment"
}
```

- 服务器错误 (状态码：500)

```json
{
  "message": "服务器错误"
}
```

**备注**

- 该接口需要用户登录验证
- 点赞和投诉使用防重复机制，同一用户对同一帖子只能执行一次相同操作
- 取消点赞/投诉时，如果用户之前没有执行过对应操作，会返回相应错误信息
- 评论支持多级回复功能
- 所有操作都使用数据库事务确保数据一致性

### 条件查询帖子

基本信息

- 路径: `/api/forum/posts`
- 方法: `GET`
- 描述: 获取帖子列表，并可以选择是否包含评论。

请求参数

| 参数名        | 类型    | 必选 | 描述                                                |
| ------------- | ------- | ---- | --------------------------------------------------- |
| campus_id     | Number  | 否   | 校区 ID                                             |
| author_id     | Number  | 否   | 作者 ID                                             |
| keyword       | String  | 否   | 根据标题和内容进行关键词搜索                        |
| status        | String  | 否   | 帖子状态，默认为 `active`，可选 `inactive` 或 `all` |
| page          | Number  | 否   | 页码，默认为 `1`                                    |
| limit         | Number  | 否   | 每页数量，默认为 `10`                               |
| with_comments | Boolean | 否   | 是否包含评论，默认为 `false`，可以设置为 `true`     |

请求头

| 参数名        | 类型   | 必选 | 描述                                  |
| ------------- | ------ | ---- | ------------------------------------- |
| Authorization | String | 是   | 身份验证令牌，格式为 `Bearer {token}` |

请求体示例

```json
http://localhost:5000/api/forum/posts?page=1&limit=5&with_comments=true
```

响应参数

| 状态码 | 内容类型         | 描述                     |
| ------ | ---------------- | ------------------------ |
| 200    | application/json | 返回帖子列表及其相关数据 |
| 500    | application/json | 服务器错误               |

响应示例

- 成功响应 (状态码：200)

```json
{
  "total": 2,
  "page": 1,
  "limit": 5,
  "pages": 1,
  "posts": [
    {
      "id": 2,
      "title": "好啊",
      "content": "好",
      "author_id": 1,
      "campus_id": 1,
      "status": "active",
      "created_at": "2025-04-28T02:26:53.000Z",
      "likes": 0,
      "author_name": "DUTers",
      "author_avatar": "/uploads/default.png",
      "comment_count": 0,
      "images": ["/uploads/1745807213371-kmzx9tsmz2m.jpg"],
      "comments": []
    },
    {
      "id": 1,
      "title": "好啊",
      "content": "好",
      "author_id": 1,
      "campus_id": 1,
      "status": "active",
      "created_at": "2025-04-28T02:26:33.000Z",
      "likes": 1,
      "author_name": "DUTers",
      "author_avatar": "/uploads/default.png",
      "comment_count": 2,
      "images": [],
      "comments": [
        {
          "id": 1,
          "content": "这是一条评论",
          "created_at": "2025-04-28T02:34:22.000Z",
          "user": {
            "id": 1,
            "nickname": "DUTers",
            "avatar": "/uploads/default.png"
          },
          "replies": [
            {
              "id": 2,
              "content": "这是一条评论2",
              "created_at": "2025-04-28T02:35:54.000Z",
              "user": {
                "id": 1,
                "nickname": "DUTers",
                "avatar": "/uploads/default.png"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

- 服务器错误 (状态码：500)

```json
{
  "message": "服务器错误"
}
```

## appealsRoutes

### 提交申诉

基本信息

- **路径**: `/api/appeals/publish`
- **方法**: `POST`
- **描述**: 提交新的申诉信息，包括文本内容和可选的图片（最多 3 张）

请求参数
| 参数名 | 类型 | 必选 | 描述 |
|-------|------|------|------|
| title | string | 是 | 申诉名称 |
| id | Number | 是 | 申诉对象 ID（商品 ID 或帖子 ID） |
| content | String | 是 | 申诉内容 |
| type | String | 是 | 申诉类型，必须是以下值之一：`goods`（商品申诉）、`post`（帖子申诉） |
| images | File[] | 否 | 申诉相关的图片文件，最多 3 张 |

请求头

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

请求体示例

```
POST /api/appeals/publish
Content-Type: multipart/form-data

title:商品问题
id: 123
content: "商品存在问题，描述与实际不符"
type: "goods"
images: [file1.jpg, file2.jpg]
```

响应参数
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 201 | application/json | 申诉提交成功 |
| 400 | application/json | 缺少必要参数 |
| 401 | application/json | 未提供 Token |
| 404 | application/json | 商品或帖子不存在 |
| 500 | application/json | 服务器错误 |

响应示例

- 成功响应 (状态码：201)

  ```json
  {
    "message": "申诉提交成功"
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "缺少必要参数"
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- 商品不存在 (状态码：404)

  ```json
  {
    "message": "商品不存在"
  }
  ```

- 帖子不存在 (状态码：404)

  ```json
  {
    "message": "帖子不存在"
  }
  ```

- 服务器错误 (状态码：500)
  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 此 API 用于用户提交对商品或帖子的申诉
- 必须提供有效的 JWT 令牌进行身份验证
- 申诉类型(type)决定了申诉对象是商品还是帖子
- 图片上传为可选项，最多支持 3 张图片
- 上传的图片将保存在服务器的`/uploads/`目录
- 若申诉提交失败，已上传的图片将被自动删除

### 查询申诉

基本信息

- 路径: `/api/appeals/search`
- 方法: `GET`
- 描述: 查询用户提交的申诉记录

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| ------ | ------ | ---- | ---------------------- |
| status | String | 否 | 过滤申诉状态(`pending`或`resolved`)，不提供则返回所有状态的申诉 |

请求头
| 参数名 | 类型 | 必选 | 描述 |
| ------------ | ------ | ---- | ------------------------- |
| Authorization | String | 是 | 身份验证令牌，格式为`Bearer {token}` |

请求示例

```
GET /api/appeals/search?status=pending
```

响应参数

| 状态码 | 内容类型         | 描述                       |
| ------ | ---------------- | -------------------------- |
| 200    | application/json | 查询成功，返回申诉列表     |
| 401    | application/json | 未提供 Token 或 Token 无效 |
| 404    | application/json | 用户不存在                 |
| 500    | application/json | 服务器错误                 |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "查询成功",
    "data": [
      {
        "id": 5,
        "title": "appeal",
        "author_id": 3,
        "post_id": 3,
        "content": "测试测试测试",
        "type": "post",
        "status": "pending",
        "read_status": "unread",
        "created_at": "2025-04-14T20:50:52.000Z",
        "images": ["/uploads/1744692652944-mtflasewzvs.jpg", "/uploads/1744692652935-5e4lmlppy77.jpg"]
      },
      {
        "id": 3,
        "title": "appeal",
        "author_id": 3,
        "post_id": 12,
        "content": "误删帖子，申请恢复",
        "type": "post",
        "status": "pending",
        "read_status": "unread",
        "created_at": "2025-01-15T01:00:00.000Z",
        "images": ["/uploads/wall/student_card.jpg"]
      }
    ]
  }
  ```

- 查询结果为空 (状态码：200)

  ```json
  {
    "message": "查询成功",
    "data": []
  }
  ```

- 未提供 Token (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "无效的 Token"
  }
  ```

- 用户不存在 (状态码：404)

  ```json
  {
    "message": "用户不存在"
  }
  ```

- 服务器错误 (状态码：500)
  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 该接口需要用户登录，并通过 Authorization 头部提供有效的 JWT 令牌
- 返回的申诉列表按创建时间降序排序
- 每条申诉记录包含相关图片的 URL 列表
- 申诉状态可能的值包括：pending（待处理）、resolved（已处理）
- 并不筛选是否已读，由`read_status`标识并交由前端结构

## publishRoutes

### 发布商品

基本信息

- **路径**: `/api/publish/goods`
- **方法**: `POST`
- **描述**: 发布新商品信息，包括文本信息和可选的图片（最多 3 张）

请求参数

| 参数名     | 类型   | 必选 | 描述                |
| ---------- | ------ | ---- | ------------------- |
| title      | String | 是   | 商品标题            |
| content    | String | 否   | 商品描述内容        |
| price      | Number | 否   | 商品价格            |
| campus_id  | Number | 是   | 校区 ID             |
| goods_type | String | 是   | 商品类型            |
| tag        | String | 否   | 商品标签            |
| images     | File[] | 否   | 商品图片，最多 3 张 |

请求头

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

请求体示例

```
FormData:
title: "全新笔记本电脑"
content: "原价5000元，用了不到3个月，因换新出售"
price: 3500
campus_id: 1
goods_type: "sell"
tag: "computer"
images: [文件1.jpg, 文件2.jpg]
```

响应参数

| 状态码 | 内容类型         | 描述                       |
| ------ | ---------------- | -------------------------- |
| 201    | application/json | 发布成功                   |
| 400    | application/json | 缺少必要参数               |
| 401    | application/json | 未提供 Token 或 Token 无效 |
| 500    | application/json | 服务器错误                 |

响应示例

- 成功响应 (状态码：201)

  ```json
  {
    "message": "发布成功",
    "image_urls": ["/uploads/image1.jpg", "/uploads/image2.jpg"]
  }
  ```

- 缺少必要参数 (状态码：400)

  ```json
  {
    "message": "缺少必要参数"
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "无效的 Token"
  }
  ```

- 服务器错误 (状态码：500)

  ```json
  {
    "message": "商品插入失败，无法获取 postId"
  }
  ```

  或

  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 用户必须登录才能发布商品
- 图片上传字段名必须为"images"，最多允许上传 3 张图片
- 图片将保存在服务器的`/uploads/`目录，并通过 goods_images 表与商品关联
- 发布成功后，响应中会包含上传图片的 URL 路径
- 如果服务器处理过程中出现错误，已上传的图片会被自动删除

### 生成商品模板

基本信息

- **路径**: `/api/publish/template`
- **方法**: `POST`
- **描述**: 基于用户输入的文本，使用 AI 生成商品信息模板

请求参数

| 参数名 | 类型   | 必选 | 描述               |
| ------ | ------ | ---- | ------------------ |
| text   | String | 是   | 用户输入的文本描述 |

请求头

```
Authorization: Bearer {token}
Content-Type: application/json
```

请求体示例

```json
{
  "text": "我想卖一台去年买的华硕笔记本电脑，i5处理器，8G内存，原价5000，现在卖3500"
}
```

响应参数

| 状态码 | 内容类型         | 描述                       |
| ------ | ---------------- | -------------------------- |
| 200    | application/json | 生成成功                   |
| 400    | application/json | 缺少生成文本               |
| 401    | application/json | 未提供 Token 或 Token 无效 |
| 500    | application/json | 生成商品信息失败           |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "title": "华硕笔记本电脑 i5处理器 8G内存",
    "price": 3500,
    "tag": "数码电子",
    "post_type": "sell",
    "details": "去年购买的华硕笔记本电脑，i5处理器，8G内存，原价5000元，现售3500元，性能良好。"
  }
  ```

- 缺少生成文本 (状态码：400)

  ```json
  {
    "message": "缺少生成文本"
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "无效的 Token"
  }
  ```

- 服务器错误 (状态码：500)

  ```json
  {
    "message": "生成商品信息失败"
  }
  ```

**备注**

- 该接口利用 AI 模型根据用户文本输入自动生成结构化的商品信息
- 生成的信息包括商品标题、价格、标签、发布类型和详情
- 标签选项包括：学业资料、跑腿代课、生活用品、数码电子、拼单组队或捞人询问
- 发布类型选项包括：sell（出售）或 receive（求购）
- 用户必须登录才能使用此功能
- 响应内容可直接用于商品发布表单的预填充

### 发布校园墙帖子

基本信息

- **路径**: `/api/publish/posts`
- **方法**: `POST`
- **描述**: 发布新的校园墙帖子，包括文本内容和可选的图片（最多 5 张）

请求参数
| 参数名 | 类型 | 必选 | 描述 |
|-------|------|------|------|
| title | String | 是 | 帖子标题 |
| content | String | 是 | 帖子内容 |
| campus_id | Number | 是 | 校区 ID |
| images | File[] | 否 | 帖子相关图片，最多 5 张 |

请求头

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

请求体示例

```
FormData:
title: "求推荐开发区美食"
content: "最近搬到开发区，有什么好吃的餐厅推荐吗？"
campus_id: 1
images: [图片1.jpg, 图片2.jpg]
```

响应参数
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 201 | application/json | 发布成功 |
| 400 | application/json | 缺少必要参数 |
| 401 | application/json | 未提供 Token 或 Token 无效 |
| 500 | application/json | 服务器错误 |

响应示例

- 成功响应 (状态码：201)

  ```json
  {
    "message": "发布成功",
    "image_urls": ["/uploads/image1.jpg", "/uploads/image2.jpg"]
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "缺少必要参数"
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "无效的Token"
  }
  ```

- 服务器错误 (状态码：500)
  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 用户必须登录才能发布帖子
- 图片上传字段名必须为"images"，最多允许上传 5 张图片
- 图片将保存在服务器的`/uploads/`目录，并通过 post_image 表与帖子关联
- 发布成功后，响应中会包含上传图片的 URL 路径
- 如果服务器处理过程中出现错误，已上传的图片会被自动删除
- 帖子创建时默认状态为"active"

---

## messagesRoutes

### 获取通知

基本信息

- 路径: `/api/messages/`
- 方法: `GET`
- 描述: 获取用户的所有通知消息

请求头
| 参数名 | 类型 | 必选 | 描述 |
| ------------- | ------ | ---- | ------------------------------------ |
| Authorization | String | 是 | 身份验证令牌，格式为`Bearer {token}` |

响应参数
| 状态码 | 内容类型 | 描述 |
| ------ | ---------------- | -------------------------- |
| 200 | application/json | 成功，返回通知列表 |
| 401 | application/json | 未提供 Token 或 Token 无效 |
| 500 | application/json | 服务器错误 |

响应示例

- 成功响应 (状态码：200)
  ```json
  {
    "message": "查询成功",
    "data": [
      {
        "id": 14,
        "title": "responses",
        "user_id": 3,
        "response_type": "violation",
        "related_id": 1,
        "content": "您的帖子因包含广告内容被移除，这违反了我们的社区规则第3.2条。",
        "read_status": "read",
        "created_at": "2025-04-14T20:42:47.000Z",
        "images": ["https://example.com/images/response/violation_content_1.jpg", "https://example.com/images/response/community_rules_2.jpg", "https://example.com/images/response/violation_evidence_1.jpg"],
        "image_count": 3
      },
      {
        "id": 15,
        "title": "responses",
        "user_id": 3,
        "response_type": "appeal",
        "related_id": 1,
        "content": "我们已收到您的申诉，经审核后认为您的帖子不违反社区规定，已恢复显示。",
        "read_status": "unread",
        "created_at": "2025-04-14T20:42:47.000Z",
        "images": ["https://example.com/images/response/appeal_success_2.jpg", "https://example.com/images/response/post_restored_2.jpg"],
        "image_count": 2
      },
      {
        "id": 16,
        "title": "responses",
        "user_id": 3,
        "response_type": "violation",
        "related_id": 1,
        "content": "您的账户因多次违规已被临时限制发布内容，限制期为7天。",
        "read_status": "unread",
        "created_at": "2025-04-14T20:42:47.000Z",
        "images": [],
        "image_count": 0
      }
    ]
  }
  ```
- 查询成功但无数据 (状态码：200)
  ```json
  {
    "message": "查询成功",
    "data": []
  }
  ```
- 未提供 Token (状态码：401)
  ```json
  {
    "message": "未提供 Token"
  }
  ```
- Token 无效 (状态码：401)
  ```json
  {
    "message": "Token 无效"
  }
  ```
- 服务器错误 (状态码：500)
  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 该接口需要用户登录，并通过 Authorization 头部提供有效的 JWT 令牌
- 返回的通知列表按创建时间降序排序

---

### 修改通知状态

基本信息

- 路径: `/api/messages/status/batch`
- 方法: `PUT`
- 描述: 修改指定通知的状态（已读/未读）

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| ------ | ------ | ---- | ------------------------ |
| messages | Array | 是 | 通知对象数组，每个对象包含 message_id、type、status |

消息对象结构
| 参数名 | 类型 | 必选 | 描述 |
| ------ | ------ | ---- | ------------------------ |
| message_id | Number | 是 | 通知 ID |
| type | String | 是 | 通知类型，"appeal"或"response" |
| status | String | 是 | 状态值，"unread" 表示未读，"read" 表示已读 |

请求头
| 参数名 | 类型 | 必选 | 描述 |
| ------------ | ------ | ---- | ------------------------- |
| Authorization | String | 是 | 身份验证令牌，格式为`Bearer {token}` |

请求体示例

```json
{
  "messages": [
    { "message_id": 1, "type": "appeal", "status": "read" },
    { "message_id": 2, "type": "response", "status": "read" },
    { "message_id": 3, "type": "appeal", "status": "unread" },
    { "message_id": 4, "type": "response", "status": "read" }
  ]
}
```

响应参数

| 状态码 | 内容类型         | 描述                       |
| ------ | ---------------- | -------------------------- |
| 200    | application/json | 批量处理完成               |
| 400    | application/json | 缺少消息数组或数组为空     |
| 401    | application/json | 未提供 Token 或 Token 无效 |
| 500    | application/json | 服务器错误                 |

响应示例

- 全部成功响应 (状态码：200)

  ```json
  {
    "message": "批量处理完成",
    "success_count": 4,
    "error_count": 0,
    "results": [
      { "message_id": 1, "type": "appeal", "status": "read", "success": true },
      { "message_id": 2, "type": "response", "status": "read", "success": true },
      { "message_id": 3, "type": "appeal", "status": "unread", "success": true },
      { "message_id": 4, "type": "response", "status": "read", "success": true }
    ]
  }
  ```

- 部分成功响应 (状态码：200)

  ```json
  {
    "message": "批量处理完成",
    "success_count": 2,
    "error_count": 2,
    "results": [
      { "message_id": 1, "type": "appeal", "status": "read", "success": true },
      { "message_id": 4, "type": "response", "status": "read", "success": true }
    ],
    "errors": [
      { "message_id": 2, "type": "response", "error": "无权限修改此通知" },
      { "message_id": 3, "error": "缺少必要参数" }
    ]
  }
  ```

- 缺少消息数组 (状态码：400)

  ```json
  {
    "message": "缺少消息数组或数组为空"
  }
  ```

- 未提供 Token (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "Token 无效"
  }
  ```

- 服务器错误 (状态码：500)
  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 该接口支持批量处理多个通知的状态更新
- 每个消息对象必须包含 message_id、type 和 status 三个字段
- 用户只能修改属于自己的通知状态
- type 参数指定通知类型，必须为"appeal"或"response"
- status 参数必须为"read"或"unread"
- 接口会返回成功和失败的详细信息，允许部分成功的情况
- 如果某个通知处理失败，不会影响其他通知的处理

## historyRoutes

### 查询发布历史

基本信息

- **路径**: `/api/history/goods`
- **方法**: `GET`
- **描述**: 查询用户发布的商品和帖子历史记录，包括关联的图片信息

请求参数

无需请求参数

请求头

```
Authorization: Bearer {token}
```

响应参数

| 状态码 | 内容类型         | 描述                       |
| ------ | ---------------- | -------------------------- |
| 200    | application/json | 查询成功                   |
| 401    | application/json | 未提供 Token 或 Token 无效 |
| 500    | application/json | 服务器错误                 |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "goods": [
      {
        "id": 1,
        "title": "全新笔记本电脑",
        "content": "原价5000元，用了不到3个月，因换新出售",
        "price": 3500,
        "campus_id": 1,
        "goods_type": "sell",
        "tag": "computer",
        "author_id": 3,
        "status": "active",
        "created_at": "2025-04-14T20:42:47.000Z",
        "images": ["/uploads/image1.jpg", "/uploads/image2.jpg"]
      }
    ],
    "posts": [
      {
        "id": 1,
        "title": "求推荐开发区美食",
        "content": "最近搬到开发区，有什么好吃的餐厅推荐吗？",
        "campus_id": 1,
        "author_id": 3,
        "status": "active",
        "created_at": "2025-04-14T20:42:47.000Z",
        "images": ["/uploads/post1.jpg", "/uploads/post2.jpg"]
      }
    ]
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "无效的 Token"
  }
  ```

- 服务器错误 (状态码：500)

  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 用户必须登录才能查询发布历史
- 返回结果按发布时间倒序排列（最新的在前）
- 不返回状态为 'deleted' 的记录
- 自动关联并返回商品和帖子的相关图片
- 商品图片通过 goods_images 表关联，帖子图片通过 post_image 表关联
- 返回对象包含 goods 和 posts 两个数组

### 修改商品状态

基本信息

- **路径**: `/api/history/goods/:post_id`
- **方法**: `PUT`
- **描述**: 修改指定商品的交易状态

请求参数

| 参数名  | 类型   | 必选 | 描述                  |
| ------- | ------ | ---- | --------------------- |
| post_id | Number | 是   | 商品 ID (URL 参数)    |
| status  | String | 是   | 商品状态 (请求体参数) |

请求头

```
Authorization: Bearer {token}
Content-Type: application/json
```

请求体示例

```json
{
  "status": "sold"
}
```

响应参数

| 状态码 | 内容类型         | 描述                       |
| ------ | ---------------- | -------------------------- |
| 200    | application/json | 状态更新成功               |
| 401    | application/json | 未提供 Token 或 Token 无效 |
| 403    | application/json | 无权修改此商品             |
| 500    | application/json | 服务器错误                 |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "商品状态已更新"
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "无效的 Token"
  }
  ```

- 无权限 (状态码：403)

  ```json
  {
    "message": "无权修改此商品"
  }
  ```

- 服务器错误 (状态码：500)

  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 用户必须登录才能修改商品状态
- 只能修改自己发布的商品
- 常见状态值包括：active（活跃）、sold（已售出）、reserved（已预订）等

### 删除帖子

基本信息

- **路径**: `/api/history/posts/:post_id`
- **方法**: `DELETE`
- **描述**: 删除指定的校园墙帖子（软删除，将状态设置为 deleted）

请求参数

| 参数名  | 类型   | 必选 | 描述               |
| ------- | ------ | ---- | ------------------ |
| post_id | Number | 是   | 帖子 ID (URL 参数) |

请求头

```
Authorization: Bearer {token}
```

响应参数

| 状态码 | 内容类型         | 描述                       |
| ------ | ---------------- | -------------------------- |
| 200    | application/json | 删除成功                   |
| 401    | application/json | 未提供 Token 或 Token 无效 |
| 403    | application/json | 无权删除此帖子             |
| 500    | application/json | 服务器错误                 |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "帖子已删除"
  }
  ```

- Token 未提供 (状态码：401)

  ```json
  {
    "message": "未提供 Token"
  }
  ```

- Token 无效 (状态码：401)

  ```json
  {
    "message": "无效的 Token"
  }
  ```

- 无权限 (状态码：403)

  ```json
  {
    "message": "无权删除此帖子"
  }
  ```

- 服务器错误 (状态码：500)

  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 用户必须登录才能删除帖子
- 只能删除自己发布的帖子
- 采用软删除方式，将帖子状态设置为 'deleted'，不会物理删除数据
- 删除后的帖子不会在查询发布历史接口中返回

## favoritesRoute

### 添加帖子收藏

基本信息

- 路径: `/api/favorites/posts/add`
- 方法: `POST`
- 描述: 用户收藏指定的帖子

请求参数

| 参数名  | 类型   | 必选 | 描述    |
| ------- | ------ | ---- | ------- |
| post_id | Number | 是   | 帖子 ID |

请求头

| 参数名        | 类型   | 必选 | 描述             |
| ------------- | ------ | ---- | ---------------- |
| Authorization | String | 是   | Bearer JWT_TOKEN |

请求体示例

```json
{
  "post_id": 1
}
```

响应参数

| 状态码 | 内容类型         | 描述             |
| ------ | ---------------- | ---------------- |
| 201    | application/json | 收藏成功         |
| 400    | application/json | 参数错误或已收藏 |
| 401    | application/json | Token 无效       |
| 404    | application/json | 帖子不存在       |
| 500    | application/json | 服务器错误       |

响应示例

- 成功响应 (状态码：201)

  ```json
  {
    "message": "收藏帖子成功"
  }
  ```

- 已收藏过 (状态码：400)

  ```json
  {
    "message": "已经收藏过该帖子"
  }
  ```

- 帖子不存在 (状态码：404)
  ```json
  {
    "message": "帖子未找到或已被删除"
  }
  ```

---

### 添加商品收藏

基本信息

- 路径: `/api/favorites/goods/add`
- 方法: `POST`
- 描述: 用户收藏指定的商品

请求参数

| 参数名   | 类型   | 必选 | 描述    |
| -------- | ------ | ---- | ------- |
| goods_id | Number | 是   | 商品 ID |

请求头

| 参数名        | 类型   | 必选 | 描述             |
| ------------- | ------ | ---- | ---------------- |
| Authorization | String | 是   | Bearer JWT_TOKEN |

请求体示例

```json
{
  "goods_id": 1
}
```

响应参数

| 状态码 | 内容类型         | 描述             |
| ------ | ---------------- | ---------------- |
| 201    | application/json | 收藏成功         |
| 400    | application/json | 参数错误或已收藏 |
| 401    | application/json | Token 无效       |
| 404    | application/json | 商品不存在       |
| 500    | application/json | 服务器错误       |

响应示例

- 成功响应 (状态码：201)

  ```json
  {
    "message": "收藏商品成功"
  }
  ```

- 已收藏过 (状态码：400)

  ```json
  {
    "message": "已经收藏过该商品"
  }
  ```

- 商品不存在 (状态码：404)
  ```json
  {
    "message": "商品未找到或已被删除"
  }
  ```

---

### 取消帖子收藏

基本信息

- 路径: `/api/favorites/posts/remove`
- 方法: `DELETE`
- 描述: 取消收藏指定的帖子

请求参数

| 参数名  | 类型   | 必选 | 描述    |
| ------- | ------ | ---- | ------- |
| post_id | Number | 是   | 帖子 ID |

请求头

| 参数名        | 类型   | 必选 | 描述             |
| ------------- | ------ | ---- | ---------------- |
| Authorization | String | 是   | Bearer JWT_TOKEN |

请求体示例

```json
{
  "post_id": 1
}
```

响应参数

| 状态码 | 内容类型         | 描述           |
| ------ | ---------------- | -------------- |
| 200    | application/json | 取消收藏成功   |
| 400    | application/json | 参数错误       |
| 401    | application/json | Token 无效     |
| 404    | application/json | 收藏记录不存在 |
| 500    | application/json | 服务器错误     |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "取消帖子收藏成功"
  }
  ```

- 收藏记录不存在 (状态码：404)
  ```json
  {
    "message": "未找到收藏记录"
  }
  ```

---

### 取消商品收藏

基本信息

- 路径: `/api/favorites/goods/remove`
- 方法: `DELETE`
- 描述: 取消收藏指定的商品

请求参数

| 参数名   | 类型   | 必选 | 描述    |
| -------- | ------ | ---- | ------- |
| goods_id | Number | 是   | 商品 ID |

请求头

| 参数名        | 类型   | 必选 | 描述             |
| ------------- | ------ | ---- | ---------------- |
| Authorization | String | 是   | Bearer JWT_TOKEN |

请求体示例

```json
{
  "goods_id": 1
}
```

响应参数

| 状态码 | 内容类型         | 描述           |
| ------ | ---------------- | -------------- |
| 200    | application/json | 取消收藏成功   |
| 400    | application/json | 参数错误       |
| 401    | application/json | Token 无效     |
| 404    | application/json | 收藏记录不存在 |
| 500    | application/json | 服务器错误     |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "取消商品收藏成功"
  }
  ```

- 收藏记录不存在 (状态码：404)
  ```json
  {
    "message": "未找到收藏记录"
  }
  ```

---

### 查询用户的所有收藏

基本信息

- 路径: `/api/favorites/`
- 方法: `GET`
- 描述: 获取用户收藏的所有帖子和商品，分别返回在两个数组中

请求头

| 参数名        | 类型   | 必选 | 描述             |
| ------------- | ------ | ---- | ---------------- |
| Authorization | String | 是   | Bearer JWT_TOKEN |

响应参数

| 状态码 | 内容类型         | 描述       |
| ------ | ---------------- | ---------- |
| 200    | application/json | 获取成功   |
| 401    | application/json | Token 无效 |
| 500    | application/json | 服务器错误 |

响应示例

- 成功响应 (状态码：200)
  ```json
  {
    "message": "获取收藏列表成功",
    "data": {
      "posts": [
        {
          "id": 1,
          "title": "开发区美食",
          "content": "美食推荐？",
          "author_id": 1,
          "created_at": "2025-07-15T13:09:07.000Z",
          "status": "active",
          "campus_id": 1,
          "likes": 1,
          "complaints": 0
        }
      ],
      "goods": [
        {
          "id": 2,
          "title": "笔记本2",
          "content": "出售",
          "author_id": 1,
          "created_at": "2025-07-18T16:05:55.000Z",
          "status": "active",
          "price": "3500.10",
          "campus_id": 1,
          "goods_type": "sell",
          "tag": "computer"
        },
        {
          "id": 1,
          "title": "笔记本",
          "content": "出售",
          "author_id": 1,
          "created_at": "2025-07-18T15:40:06.000Z",
          "status": "active",
          "price": "3500.00",
          "campus_id": 1,
          "goods_type": "sell",
          "tag": "computer"
        }
      ]
    }
  }
  ```

**前端解构使用示例：**

```javascript
// 前端接收响应后可以这样解构
const {
  data: { posts, goods },
} = response.data;
console.log("收藏的帖子:", posts);
console.log("收藏的商品:", goods);
```

## adminRoute

### 管理员搜索用户

基本信息

- 路径: `/api/admin/search-user`
- 方法: `POST`
- 描述: 管理员根据 QQ 号查询用户详细信息

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| ------ | ------ | ---- | ---------- |
| qq_id | String | 是 | 要查询的 QQ 号 |

请求头部
| 参数名 | 类型 | 必选 | 描述 |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | String | 是 | Bearer token（管理员权限） |

请求体示例

```json
{
  "qq_id": "12345678"
}
```

响应参数

| 状态码 | 内容类型         | 描述         |
| ------ | ---------------- | ------------ |
| 200    | application/json | 查询成功     |
| 400    | application/json | 参数错误     |
| 401    | application/json | 未提供 Token |
| 403    | application/json | 权限不足     |
| 404    | application/json | 未找到用户   |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "id": 1,
    "nickname": "DUTers",
    "email": "user@example.com",
    "qq_id": "12345678",
    "username": "user123",
    "credit": 100,
    "campus_id": 1
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "缺少 qq_id 参数"
  }
  ```

- 权限不足 (状态码：403)

  ```json
  {
    "message": "您没有权限执行此操作"
  }
  ```

- 未找到用户 (状态码：404)

  ```json
  {
    "message": "没有找到匹配的用户"
  }
  ```

**备注**

- 该接口仅限管理员使用
- 需要在请求头中提供有效的管理员 JWT 令牌

---

### 修改用户信用值

基本信息

- 路径: `/api/admin/credit`
- 方法: `PUT`
- 描述: 管理员修改指定用户的信用值

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| ------ | ------ | ---- | -------------- |
| qq_id | String | 是 | 要修改的用户 QQ 号 |
| credit | Number | 是 | 新的信用值 |

请求头部
| 参数名 | 类型 | 必选 | 描述 |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | String | 是 | Bearer token（管理员权限） |

请求体示例

```json
{
  "qq_id": "12345678",
  "credit": 150
}
```

响应参数

| 状态码 | 内容类型         | 描述         |
| ------ | ---------------- | ------------ |
| 200    | application/json | 修改成功     |
| 400    | application/json | 参数错误     |
| 401    | application/json | 未提供 Token |
| 403    | application/json | 权限不足     |
| 404    | application/json | 未找到用户   |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "信用值已更新"
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "缺少必要参数"
  }
  ```

- 权限不足 (状态码：403)

  ```json
  {
    "message": "您没有权限执行此操作"
  }
  ```

- 未找到用户 (状态码：404)

  ```json
  {
    "message": "没有找到匹配的用户"
  }
  ```

**备注**

- 该接口仅限管理员使用
- 需要在请求头中提供有效的管理员 JWT 令牌
- 信用值可以为负数、零或正数

---

### 管理员删除帖子

基本信息

- 路径: `/api/admin/posts/:post_id`
- 方法: `DELETE`
- 描述: 管理员完全删除帖子，包括数据库记录和关联的图片文件

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| ------ | ------ | ---- | ---------- |
| post_id | String | 是 | 要删除的帖子 ID |

请求头部
| 参数名 | 类型 | 必选 | 描述 |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | String | 是 | Bearer token（管理员权限） |

响应参数

| 状态码 | 内容类型         | 描述         |
| ------ | ---------------- | ------------ |
| 200    | application/json | 删除成功     |
| 401    | application/json | 未提供 Token |
| 403    | application/json | 权限不足     |
| 404    | application/json | 帖子不存在   |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "管理员已完全删除帖子"
  }
  ```

- 权限不足 (状态码：403)

  ```json
  {
    "message": "您没有权限执行此操作"
  }
  ```

- 帖子不存在 (状态码：404)

  ```json
  {
    "message": "帖子不存在"
  }
  ```

**备注**

- 该接口仅限管理员使用
- 执行硬删除，会彻底删除数据库记录及相关图片文件
- 删除操作不可恢复

---

### 管理员删除商品

基本信息

- 路径: `/api/admin/goods/:goods_id`
- 方法: `DELETE`
- 描述: 管理员完全删除商品，包括数据库记录和关联的图片文件

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| ------ | ------ | ---- | ---------- |
| goods_id | String | 是 | 要删除的商品 ID |

请求头部
| 参数名 | 类型 | 必选 | 描述 |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | String | 是 | Bearer token（管理员权限） |

响应参数

| 状态码 | 内容类型         | 描述         |
| ------ | ---------------- | ------------ |
| 200    | application/json | 删除成功     |
| 401    | application/json | 未提供 Token |
| 403    | application/json | 权限不足     |
| 404    | application/json | 商品不存在   |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "管理员已完全删除商品"
  }
  ```

- 权限不足 (状态码：403)

  ```json
  {
    "message": "您没有权限执行此操作"
  }
  ```

- 商品不存在 (状态码：404)

  ```json
  {
    "message": "商品不存在"
  }
  ```

**备注**

- 该接口仅限管理员使用
- 执行硬删除，会彻底删除数据库记录及相关图片文件
- 删除操作不可恢复

---

### 管理员获取申诉列表

基本信息

- 路径: `/api/admin/appeals`
- 方法: `GET`
- 描述: 管理员获取申诉列表，支持分页和多种筛选条件

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| ------ | ------ | ---- | ---------- |
| status | String | 否 | 申诉状态筛选：pending（待处理）、resolved（已处理） |
| read_status | String | 否 | 阅读状态筛选：unread（未读）、read（已读） |
| type | String | 否 | 申诉类型筛选：post（帖子申诉）、goods（商品申诉） |
| page | Number | 否 | 页码，默认为 1 |
| limit | Number | 否 | 每页数量，默认为 10 |

请求头部
| 参数名 | 类型 | 必选 | 描述 |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | String | 是 | Bearer token（管理员权限） |

响应参数

| 状态码 | 内容类型         | 描述         |
| ------ | ---------------- | ------------ |
| 200    | application/json | 获取成功     |
| 401    | application/json | 未提供 Token |
| 403    | application/json | 权限不足     |
| 500    | application/json | 服务器错误   |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "获取申诉列表成功",
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3,
    "appeals": [
      {
        "id": 1,
        "title": "帖子申诉",
        "author_id": 123,
        "post_id": 456,
        "content": "我认为我的帖子被误删了...",
        "type": "post",
        "status": "pending",
        "read_status": "unread",
        "created_at": "2024-01-01T10:00:00.000Z",
        "author_name": "张三",
        "author_qq_id": "12345678",
        "author_avatar": "/uploads/avatar.jpg",
        "author_credit": 85,
        "target_title": "被申诉的帖子标题",
        "target_content": "被申诉的帖子内容...",
        "images": [
          "/uploads/appeal_image1.jpg",
          "/uploads/appeal_image2.jpg"
        ]
      }
    ]
  }
  ```

- 权限不足 (状态码：403)

  ```json
  {
    "message": "您没有权限执行此操作"
  }
  ```

**备注**

- 该接口仅限管理员使用
- 支持多种筛选条件，可以组合使用
- 返回的申诉包含申诉者信息和被申诉对象的基本信息
- 申诉相关的图片会一并返回

---

### 管理员更新申诉状态

基本信息

- 路径: `/api/admin/appeals`
- 方法: `PUT`
- 描述: 管理员处理申诉，更新申诉状态并可选择性地发送回复

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| ------ | ------ | ---- | ---------- |
| appeal_id | Number | 是 | 申诉 ID |
| status | String | 否 | 更新申诉状态：pending、resolved、deleted |
| read_status | String | 否 | 更新阅读状态：unread、read |
| response_content | String | 否 | 管理员回复内容，如果提供将发送给申诉用户 |

请求头部
| 参数名 | 类型 | 必选 | 描述 |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | String | 是 | Bearer token（管理员权限） |

请求体示例

```json
{
  "appeal_id": 1,
  "status": "resolved",
  "read_status": "read",
  "response_content": "经过审核，您的申诉理由充分，我们已恢复您的帖子。"
}
```

响应参数

| 状态码 | 内容类型         | 描述         |
| ------ | ---------------- | ------------ |
| 200    | application/json | 更新成功     |
| 400    | application/json | 参数错误     |
| 401    | application/json | 未提供 Token |
| 403    | application/json | 权限不足     |
| 404    | application/json | 申诉不存在   |
| 500    | application/json | 服务器错误   |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "申诉状态更新成功"
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "缺少 appeal_id 参数"
  }
  ```

- 申诉不存在 (状态码：404)

  ```json
  {
    "message": "申诉不存在"
  }
  ```

**备注**

- 该接口仅限管理员使用
- 至少需要提供 status 或 read_status 中的一个参数
- 如果提供了 response_content，系统会自动向申诉用户发送回复通知
- 回复内容会保存到 responses 表中，用户可以在个人中心查看

---

### 管理员获取用户发布历史

基本信息

- 路径: `/api/admin/search-history`
- 方法: `GET`
- 描述: 管理员查询指定用户的发布历史，包含帖子和商品，支持多种筛选条件和分页

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| ------ | ------ | ---- | ---------- |
| user_id | Number | 否 | 用户ID（user_id 和 qq_id 至少提供一个） |
| qq_id | String | 否 | 用户QQ号（user_id 和 qq_id 至少提供一个） |
| type | String | 否 | 内容类型筛选：all（全部）、posts（仅帖子）、goods（仅商品），默认 all |
| status | String | 否 | 状态筛选：all（全部）、active（活跃）、deleted（已删除），默认 all |
| page | Number | 否 | 页码，默认为 1 |
| limit | Number | 否 | 每页数量，默认为 20 |

请求头部
| 参数名 | 类型 | 必选 | 描述 |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | String | 是 | Bearer token（管理员权限） |

响应参数

| 状态码 | 内容类型         | 描述         |
| ------ | ---------------- | ------------ |
| 200    | application/json | 查询成功     |
| 400    | application/json | 参数错误     |
| 401    | application/json | 未提供 Token |
| 403    | application/json | 权限不足     |
| 404    | application/json | 用户不存在   |
| 500    | application/json | 服务器错误   |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "查询成功",
    "user_info": {
      "id": 123,
      "nickname": "张三",
      "qq_id": "12345678",
      "email": "user@example.com",
      "credit": 85,
      "campus_id": 1
    },
    "statistics": {
      "total_items": 25,
      "posts": {
        "total": 15,
        "active": 12,
        "deleted": 3,
        "total_likes": 120,
        "total_complaints": 5
      },
      "goods": {
        "total": 10,
        "active": 8,
        "deleted": 2,
        "total_likes": 80,
        "total_complaints": 2
      },
      "total_likes": 200,
      "total_complaints": 7
    },
    "items": [
      {
        "type": "post",
        "id": 456,
        "title": "校园生活分享",
        "content": "今天天气真好...",
        "status": "active",
        "created_at": "2024-01-15T10:30:00.000Z",
        "likes": 25,
        "complaints": 1,
        "campus_id": 1,
        "images": [
          "/uploads/post1.jpg",
          "/uploads/post2.jpg"
        ]
      },
      {
        "type": "goods",
        "id": 789,
        "title": "二手教材出售",
        "content": "高等数学教材，9成新...",
        "status": "active",
        "created_at": "2024-01-10T15:20:00.000Z",
        "likes": 15,
        "complaints": 0,
        "campus_id": 1,
        "images": [
          "/uploads/goods1.jpg"
        ]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "per_page": 20
    }
  }
  ```

- 参数错误 (状态码：400)

  ```json
  {
    "message": "缺少 user_id 或 qq_id 参数"
  }
  ```

- 权限不足 (状态码：403)

  ```json
  {
    "message": "您没有权限执行此操作"
  }
  ```

- 用户不存在 (状态码：404)

  ```json
  {
    "message": "用户不存在"
  }
  ```

**备注**

- 该接口仅限管理员使用
- 支持通过用户ID或QQ号查询，两者至少提供一个
- 返回的数据按创建时间倒序排列
- 包含完整的用户统计信息，便于管理员评估用户行为
- 统计信息包括总发布量、活跃/删除状态分布、点赞投诉数据等
- 每个发布项目都包含关联的图片信息
- 支持分页查询，避免大量数据影响性能

**使用场景**

- 审核用户是否有违规发布历史
- 分析用户行为模式和活跃度
- 为封禁/处罚决策提供数据支持
- 关联申诉处理，查看争议内容的上下文

---

### 管理员获取热门搜索关键词

基本信息

- 路径: `/api/admin/search-keywords`
- 方法: `GET`
- 描述: 管理员获取平台热门搜索关键词统计，用于分析用户搜索行为和热点内容

请求参数
| 参数名 | 类型 | 必选 | 描述 |
| ------ | ------ | ---- | ---------- |
| limit | Number | 否 | 返回关键词数量，默认为 50 |

请求头部
| 参数名 | 类型 | 必选 | 描述 |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | String | 是 | Bearer token（管理员权限） |

响应参数

| 状态码 | 内容类型         | 描述         |
| ------ | ---------------- | ------------ |
| 200    | application/json | 查询成功     |
| 401    | application/json | 未提供 Token |
| 403    | application/json | 权限不足     |
| 500    | application/json | 服务器错误   |

响应示例

- 成功响应 (状态码：200)

  ```json
  {
    "message": "获取热门搜索关键词成功",
    "statistics": {
      "total_keywords": 156,
      "total_searches": 1024,
      "avg_searches_per_keyword": 6.56,
      "max_searches": 89
    },
    "keywords": [
      {
        "keyword": "手机",
        "search_count": 89,
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-02T15:30:00.000Z"
      },
      {
        "keyword": "笔记本电脑",
        "search_count": 67,
        "created_at": "2024-01-01T11:00:00.000Z",
        "updated_at": "2024-01-02T14:20:00.000Z"
      },
      {
        "keyword": "教材",
        "search_count": 45,
        "created_at": "2024-01-01T12:00:00.000Z",
        "updated_at": "2024-01-02T16:45:00.000Z"
      }
    ]
  }
  ```

- 权限不足 (状态码：403)

  ```json
  {
    "message": "您没有权限执行此操作"
  }
  ```

**备注**

- 该接口仅限管理员使用
- 关键词按搜索次数降序排列，显示最热门的关键词
- 统计信息包含总关键词数、总搜索次数、平均搜索次数等数据
- 关键词数据自动记录，每次用户搜索时更新计数
- 可用于生成词云图、热门话题分析等数据可视化
- 帮助管理员了解用户关注热点和平台内容趋势

**数据收集机制**

- 用户在商品列表搜索时自动记录关键词
- 用户在帖子列表搜索时自动记录关键词
- 相同关键词搜索次数累加，不重复记录
- 支持中文、英文及混合关键词统计

### 管理员获取AI调用统计

基本信息

- 路径: `/api/admin/ai/stats`
- 方法: `GET`
- 描述: 获取AI模板生成的调用统计信息，包括今日调用次数和总调用次数

请求参数

无

请求头部

| 参数名        | 类型   | 必选 | 描述                       |
| ------------- | ------ | ---- | -------------------------- |
| Authorization | String | 是   | Bearer token（管理员权限） |

请求示例

```
GET /api/ai/stats
Authorization: Bearer {admin_token}
```

响应参数

| 状态码 | 内容类型         | 描述                       |
| ------ | ---------------- | -------------------------- |
| 200    | application/json | 获取成功                   |
| 401    | application/json | 未提供 Token 或 Token 无效 |
| 403    | application/json | 权限不足                   |
| 500    | application/json | 服务器错误                 |

响应示例

- 成功响应 (状态码：200)

```json
{
  "todayCalls": 15,
  "totalCalls": 286
}
```

- Token 未提供 (状态码：401)

```json
{
  "message": "未提供 Token"
}
```

- Token 无效 (状态码：401)

```json
{
  "message": "Token 格式无效"
}
```

- 权限不足 (状态码：403)

```json
{
  "message": "您没有权限执行此操作"
}
```

- 服务器错误 (状态码：500)

```json
{
  "message": "获取统计数据失败"
}
```

**备注**

- 该接口仅限管理员使用，需要有效的管理员 Token
- 统计数据基于服务器内存变量，重启后重置
- 今日调用次数每天自动重置为 0
- 总调用次数持续累加，包括成功和失败的调用
- 用于监控AI模板生成功能的使用情况
- 可用于分析用户对AI功能的使用频率和趋势

**统计机制**

- AI调用成功时自动记录统计
- AI调用失败时也会记录（因为消耗了API额度）
- 每日零点自动重置今日调用次数
- 总调用次数永久累加，除非服务器重启
