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
- **描述**: 根据用户角色返回不同的信息：管理员获取所有用户信息，普通用户获取个人资料
- ==**备注**: 这个 api 的管理员部分还未测试==

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
| 200 | application/json | 成功获取数据 |
| 401 | application/json | 未提供 Token 或 Token 无效 |
| 404 | application/json | 用户不存在（仅针对普通用户） |
| 500 | application/json | 服务器错误 |

响应示例

- 管理员成功响应 (状态码：200)

  ```json
  {
    "users": [
      {
        "id": 1,
        "nickname": "用户1",
        "email": "user1@example.com",
        "qq_id": "123456789",
        "username": "user1",
        "campus_id": 1,
        "credit": 100,
        "theme_id": 1,
        "background_url": "/uploads/bg1.jpg",
        "banner_url": "/uploads/banner1.jpg",
        "avatar": "/uploads/avatar1.jpg"
      },
      {
        "id": 2,
        "nickname": "用户2",
        "email": "user2@example.com",
        "qq_id": "987654321",
        "username": "user2",
        "campus_id": 2,
        "credit": 80,
        "theme_id": 2,
        "background_url": "/uploads/bg2.jpg",
        "banner_url": "/uploads/banner2.jpg",
        "avatar": "/uploads/avatar2.jpg"
      }
      // 更多用户...
    ]
  }
  ```

- 普通用户成功响应 (状态码：200)

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
    "avatar": "/uploads/avatar.jpg"
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

- 该 API 合并了之前的 `/` 和 `/get-theme` 功能
- 根据用户角色（管理员/普通用户）返回不同内容
- 普通用户只能查看自己的资料
- 管理员可以查看所有用户的资料
- 建议普通用户端使用 localStorage 缓存主题相关信息，避免频繁请求

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

## goodsRoutes

### 软删除商品

基本信息

- **路径**: `/api/goods/:post_id`
- **方法**: `DELETE`
- **描述**: 根据商品 ID 将商品标记为已删除状态，管理员可删除任意商品，普通用户只能删除自己的商品

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
- 管理员可以删除任何商品，普通用户只能删除自己创建的商品
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
    "total": 25,
    "count": 10,
    "page": 1,
    "limit": 10,
    "goods": [
      {
        "id": 123,
        "title": "二手笔记本电脑",
        "content": "9成新笔记本电脑，性能良好...",
        "price": 3000,
        "campus_id": 1,
        "status": "available",
        "goods_type": "electronic",
        "tag": "computer",
        "author_id": 456,
        "likes": 5,
        "complaints": 0,
        "images": ["/uploads/image1.jpg", "/uploads/image2.jpg"],
        "author_qq_id": "123456789",
        "author_nickname": "User1",
        "author_avatar": "/uploads/avatar1.png"
      }
      // 更多商品...
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

---

### 修改商品点赞数和投诉数

基本信息

- **路径**: `/api/goods/:action/:post_id`
- **方法**: `PUT`
- **描述**: 增加或减少商品的点赞数或投诉数

请求参数
| 参数名 | 类型 | 必选 | 描述 |
|-------|------|------|------|
| action | String | 是 | 操作类型，必须是 "like" 或 "complaint"，作为 URL 路径参数提供 |
| post_id | String | 是 | 商品 ID，作为 URL 路径参数提供 |
| value | Boolean | 是 | true 表示增加计数，false 表示减少计数 |

请求体示例

```json
{
  "value": true
}
```

或

```json
{
  "value": false
}
```

响应参数
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 200 | application/json | 操作成功 |
| 400 | application/json | 无效的操作类型或参数 |
| 404 | application/json | 商品未找到 |
| 500 | application/json | 服务器错误 |

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

- 无效操作类型 (状态码：400)

  ```json
  {
    "message": "无效的操作类型，必须是 like 或 complaint"
  }
  ```

- 缺少参数 (状态码：400)

  ```json
  {
    "message": "缺少 like 参数"
  }
  ```

  或

  ```json
  {
    "message": "缺少 complaint 参数"
  }
  ```

- 参数值无效 (状态码：400)

  ```json
  {
    "message": "无效的 like 参数，必须是 true 或 false"
  }
  ```

  或

  ```json
  {
    "message": "无效的 complaint 参数，必须是 true 或 false"
  }
  ```

- 商品未找到 (状态码：404)

  ```json
  {
    "message": "商品未找到"
  }
  ```

- 服务器错误 (状态码：500)
  ```json
  {
    "message": "服务器错误"
  }
  ```

**备注**

- 该 API 用于增加或减少商品的点赞数和投诉数
- action 参数必须是"like"或"complaint"
- value 参数必须是布尔值，true 表示增加计数，false 表示减少计数
- 例如：PUT /api/goods/like/123 加上 body {"value": true} 表示给 ID 为 123 的商品点赞
- 软删除的商品不会被操作影响

## forumRoutes

### 删除校园墙帖子

基本信息

- **路径**: `/api/forum/:post_id`
- **方法**: `DELETE`
- **描述**: 删除校园墙帖子，管理员可硬删除（彻底删除数据及图片），普通用户只能软删除（修改状态）

请求参数
| 参数名 | 类型 | 必选 | 描述 |
|-------|------|------|------|
| post_id | String | 是 | 帖子 ID，作为 URL 路径参数提供 |

请求头

```
Authorization: Bearer {token}
```

响应参数
| 状态码 | 内容类型 | 描述 |
|------|----------|------|
| 200 | application/json | 删除成功 |
| 401 | application/json | 未提供 Token 或 Token 无效 |
| 403 | application/json | 没有权限删除此帖子（针对普通用户） |
| 404 | application/json | 帖子不存在（针对管理员） |
| 500 | application/json | 服务器错误 |

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

- 该接口根据用户角色执行不同的删除操作：
  - 管理员：执行硬删除，会彻底删除数据库记录及相关图片文件
  - 普通用户：执行软删除，仅将帖子状态更新为"deleted"
- 普通用户只能删除自己发布的帖子
- 管理员可以删除任何帖子，无论发布者是谁
- 已软删除的帖子将不会出现在校园墙帖子列表中

## publishRoutes

### 发布商品

基本信息

- **路径**: `/api/goods`
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
goods_type: "electronic"
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

- **路径**: `/api/template`
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
