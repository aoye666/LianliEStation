# 新 API 文档

[toc]
## authRoutes
### 用户注册

基本信息
- 路径: `/api/auth/register`
- 方法: `POST`
- 描述: 注册新用户

请求参数
| 参数名      | 类型   | 必选 | 描述                     |
| ----------- | ------ | ---- | ------------------------ |
| nickname    | String | 否   | 用户昵称，如不提供则默认为 "DUTers" |
| email       | String | 是   | 用户邮箱，必须唯一        |
| password    | String | 是   | 用户密码                 |
| qq_id       | String | 是   | QQ号码                   |
| username    | String | 是   | 用户名，必须唯一         |
| campus_id   | Number | 是   | 校区ID                   |

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

| 状态码 | 内容类型         | 描述                      |
| ------ | ---------------- | ------------------------- |
| 201    | application/json  | 注册成功                  |
| 400    | application/json  | 参数错误或邮箱/用户名已存在 |
| 500    | application/json  | 服务器错误                |

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
- 注册操作会记录用户IP地址

---

### 用户登录

基本信息
- 路径: `/api/auth/login`
- 方法: `POST`
- 描述: 用户或管理员登录系统，获取身份验证令牌

请求参数
| 参数名     | 类型   | 必选 | 描述                           |
| ---------- | ------ | ---- | ------------------------------ |
| identifier | String | 是   | 用户名或邮箱（普通用户），或用户名（管理员） |
| password   | String | 是   | 登录密码                       |

请求体示例
```json
{
  "identifier": "user123",
  "password": "password123"
}
```

响应参数

| 状态码 | 内容类型         | 描述                      |
| ------ | ---------------- | ------------------------- |
| 200    | application/json  | 登录成功，返回token和用户类型 |
| 400    | application/json  | 请求参数缺失               |
| 401    | application/json  | 用户不存在或密码错误       |
| 500    | application/json  | 服务器错误                 |

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
- 登录成功后会返回JWT令牌，有效期为7天
- 令牌应在后续请求中通过Authorization头部传递，格式为 `Bearer {token}`
- 对于普通用户，令牌包含用户ID、用户名、昵称、校区ID和QQ信息
- 对于管理员，令牌只包含用户ID、用户名和管理员标识

---

### 管理员注册（未启用）

基本信息
- 路径: `/api/auth/admin/register`
- 方法: `POST`
- 描述: 注册新管理员

请求参数
| 参数名   | 类型   | 必选 | 描述                        |
| -------- | ------ | ---- | --------------------------- |
| username | String | 是   | 管理员用户名，必须唯一      |
| password | String | 是   | 管理员密码                  |
| email    | String | 是   | 管理员邮箱，必须唯一        |

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
- 实际生产环境中建议使用Redis等缓存服务存储验证码

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
- 新密码会经过bcrypt加密后存储
- 验证码验证成功后即视为身份验证通过


## usersRoutes