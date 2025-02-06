# 启动说明

## 环境变量

该后端程序默认启动在 `localhost:5000` 端口
数据库连接默认为

```js
host: "localhost",
port: 3306,
user: root,
password: root,
database: makertplace,
```

使用 `dotenv` 开发依赖进行环境变量管理，如以上环境有改动，请自行在 `server` 根目录下新建`.env`文件，用以下格式修改(SECRET_KEY 随你修改，也可以问 fanzdstar 设的是啥,最后两个也可以填入您自己的邮箱账户和邮箱授权码，也可以问fanzdstar 设的是啥)

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=
SECRET_KEY=
EMAIL_USER=
EMAIL_PASS=
```

## 数据库环境

代码中并没有新建数据库的命令，请确保本地数据库中存在`marketplace`库，示例 api 中的 users 表初始化代码如下，仅供测试

```sql
use marketplace;
CREATE TABLE `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nickname` VARCHAR(50) NOT NULL DEFAULT 'DUTers',
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100),
    `password` VARCHAR(255) NOT NULL,
    `qq_id` VARCHAR(100) NOT NULL,
    `campus_id` INT NOT NULL,
    `credit` INT NOT NULL DEFAULT 100,
    `avatar` VARCHAR(255) NOT NULL DEFAULT '/uploads/default.png',
    PRIMARY KEY (`id`),
    UNIQUE KEY `email_unique` (`email`),
    UNIQUE KEY `username_unique` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `posts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT,
    `post_type` ENUM('receive', 'sell') NOT NULL,
    `tag` VARCHAR(255),
    `author_id` INT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
    `price` DECIMAL(10, 2) DEFAULT 0.00,
    `campus_id` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `appeals` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `author_id` INT NOT NULL,
    `post_id` INT NOT NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('pending', 'resolved', 'deleted') DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `post_images` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `post_id` INT NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_favorites` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `post_id` INT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_user_post` (`user_id`, `post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `appeal_images` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `appeal_id` INT NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户表数据插入示例
INSERT INTO `users` (`nickname`, `username`, `email`, `password`, `qq_id`, `campus_id`, `credit`, `avatar`)
VALUES
('User1', 'user1', 'user1@example.com', 'hashed_password1', '123456789', 1, 100, '/uploads/avatar1.png'),
('User2', 'user2', 'user2@example.com', 'hashed_password2', '987654321', 2, 100, '/uploads/avatar2.png');

-- 帖子表数据插入示例
INSERT INTO `posts` (`author_id`, `title`, `content`, `post_type`, `tag`, `created_at`, `status`, `price`, `campus_id`)
VALUES
(1, '二手数学分析教材', '浙江大学版教材，无字迹破损，附习题解答', 'sell', '教材', '2025-01-01 10:00:00', 'active', 35.50, 1),
(2, '九成新机械键盘', 'Cherry MX红轴，RGB背光，包装齐全', 'sell', '电子产品', '2025-01-02 11:00:00', 'active', 299.00, 1),
(3, '开发区校区代取快递', '大件3元/件，小件2元/件（20:00前可预约）', 'receive', '服务', '2025-01-03 12:00:00', 'active', 2.00, 1);

-- 申诉表数据插入示例
INSERT INTO `appeals` (`author_id`, `post_id`, `content`, `status`, `created_at`)
VALUES
(1, 5, '帖子内容不符合事实，请求审核', 'pending', '2024-03-01 14:30:00'),
(2, 8, '已与发布者协商解决', 'resolved', CURRENT_TIMESTAMP),
(3, 12, '误删帖子，申请恢复', 'pending', '2025-01-15 09:00:00');

-- 帖子图片表数据插入示例
INSERT INTO `post_images` (`post_id`, `image_url`, `created_at`)
VALUES
(1, '/uploads/images/image1.jpg', '2025-01-01 10:30:00');

-- 用户收藏表数据插入示例
INSERT INTO `user_favorites` (`user_id`, `post_id`, `created_at`)
VALUES
(1, 1, '2025-01-01 11:00:00'),
(2, 3, '2025-01-02 13:00:00'),
(1, 4, '2025-01-03 14:00:00');
```

##

使用`node app.js` 或者 `npm start`启动后端
**推荐使用 nodemon app.js**启动

# API 文档

## users

### 获取所有用户信息

- **方法:** GET
- **路径:** `/api/users/`
- **功能:** 获取数据库中所有用户的基本信息，仅用于测试目的。
- **请求参数:** 无
- **成功响应:**
  - **状态码:** 200
  - **内容:** 用户信息列表，包含 `id`, `nickname`, `email`。
- **错误响应:**
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 用户注册

- **方法:** POST
- **路径:** `/api/users/register`
- **功能:** 允许新用户注册。检查邮箱和用户名是否已被注册，未注册则将新用户信息插入数据库。
- **请求体:** (使用 `multipart/form-data`)

  - **请求参数:**
    - `nickname`: 用户昵称，字符串，可选，默认为 'DUTers'。
    - `email`: 用户邮箱，字符串，必需。
    - `password`: 用户密码，字符串，必需。
    - `qq_id`: 用户的 QQ 号码，字符串，必需。
    - `username`: 用户名，字符串，必需。
    - `campus_id`: 用户所在校区，整型，必需。
    - `image`：用户头像，可选

- **成功响应:**
  - **状态码:** 201
  - **内容:** `{ "message": "注册成功" }`
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "缺少必要参数" }` 或 `{ "message": "邮箱已被注册" }` 或 `{ "message": "用户名已被注册" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 用户登录

- **方法:** POST
- **路径:** `/api/users/login`
- **功能:** 验证用户的用户名和密码。如果验证通过，返回 JWT 令牌。
- **请求参数:**
  - `identifier`: 用户名或邮箱，字符串，必需。
  - `password`: 用户密码，字符串，必需。
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "登录成功", "token": "<JWT_TOKEN>" }`
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "请正确输入用户名或密码" }`
  - **状态码:** 401
  - **内容:** `{ "message": "用户名/邮箱或密码错误" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 获取当前用户信息

- **方法:** GET
- **路径:** `/api/users/profile`
- **功能:** 获取当前登录用户的详细信息，需提供 `Authorization` 头部。
- **请求头:**
  - `Authorization`: `Bearer <JWT_TOKEN>`
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "nickname": "DUTers", "username": "testuser", "campus_id": 1, "qq": "12345678", "credit": 100 ，'avater': "default.png"}`
- **错误响应:**
  - **状态码:** 401
  - **内容:** `{ "message": "Token 无效" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 删除当前用户账户

- **方法:** DELETE
- **路径:** `/api/users/profile`
- **功能:** 删除当前登录用户的账户，需提供 `Authorization` 头部。
- **请求头:**
  - `Authorization`: `Bearer <JWT_TOKEN>`
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "账户已删除" }`
- **错误响应:**
  - **状态码:** 401
  - **内容:** `{ "message": "Token 无效" }`
  - **状态码:** 404
  - **内容:** `{ "message": "用户不存在" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 更改当前用户信息

**方法:** PUT
**路径:** `/api/users/profile`
**功能:** 更新当前登录用户的基本信息（昵称、QQ 号、用户名、校区 ID）及头像，需提供 `Authorization` 头部。

- **请求参数:**
  - `nickname`: 用户昵称，字符串，必须。
  - `qq_id`: 用户的 QQ 号码，字符串，必需。
  - `campus_id`: 用户所在校区，整型，必需。
  - `image`：用户头像，可选
- **请求头:**
  - `Authorization`: `Bearer <JWT_TOKEN>`
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "用户信息已更新" }`
- **错误响应:**
- **状态码:** 400
  - **内容:** `{ "message": "缺少必要参数" }`
  - **状态码:** 401
  - **内容:** `{ "message": "未提供 Token" }`
  - **状态码:** 401
  - **内容:** `{ "message": "Token 无效" }`
  - **状态码:** 404
  - **内容:** `{ "message": "用户不存在" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

---

### **请求验证码**

- **方法:** `POST`
- **路径:** `/api/users/RequestVerification`
- **功能:** 发送验证码到指定邮箱，用户通过该验证码修改密码。
- **请求参数:**  
  - `email` (必需): 用户注册时使用的邮箱地址，字符串。
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "验证码已发送，请检查您的邮箱" }`
- **错误响应:**
  - **状态码:** 400
    - **内容:** `{ "message": "请提供有效的邮箱地址" }`
  - **状态码:** 500
    - **内容:** `{ "message": "发送验证码失败，请稍后重试" }`
- **备注:**  
  - 服务器会将验证码发送到用户指定的邮箱，用户需在规定时间内使用该验证码修改密码。

---

### **修改密码**

- **方法:** `PUT`
- **路径:** `/api/users/change-password`
- **功能:** 通过验证码验证邮箱并允许用户修改密码。
- **请求参数:**
  - `email` (必需): 用户注册时使用的邮箱地址，字符串。
  - `newPassword` (必需): 用户想要设置的新密码，字符串。
  - `verificationCode` (必需): 用户通过邮箱收到的验证码，字符串。
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "密码修改成功" }`
- **错误响应:**
  - **状态码:** 400
    - **内容:** `{ "message": "请输入有效的邮箱、验证码和新密码" }`
  - **状态码:** 401
    - **内容:** `{ "message": "验证码错误或已过期" }`
  - **状态码:** 500
    - **内容:** `{ "message": "修改密码失败，请稍后重试" }`
- **备注:**
  - 用户需要输入邮箱、验证码以及新密码来修改密码。
  - 确保提供的验证码与发送到邮箱中的验证码匹配，且未过期。

--- 




## posts

### 获取帖子列表

- **方法:** GET
- **路径:** `/api/posts/`
- **功能:** 获取数据库中所有未删除的帖子及其图片。
- **请求参数:** 无
- **成功响应:**
  - **状态码:** 200
  - **内容:** 返回所有未删除的帖子列表，包含每个帖子的详细信息和相关的图片 URL。
  - **示例:**
    ```json
    [
      {
        "id": 1,
        "title": "二手书转让",
        "content": "出售二手书籍，八成新。",
        "author_id": 1,
        "created_at": "2023-01-01T12:00:00",
        "status": "active",
        "price": 50,
        "campus_id": 1,
        "post_type": "sale",
        "tag": "书籍",
        "images": ["/uploads/1738204953485-tios2b1p2dl.png", "/uploads/1738204953486-tios2b1p2dl.jpg"]
      }
    ]
    ```
- **错误响应:**
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 新增帖子

- **方法:** POST
- **路径:** `/api/posts/publish`
- **功能:** 发布新帖子。用户必须在请求头中携带有效的 JWT Token 以验证身份，帖子数据（标题、内容、价格、校区 ID、帖子类型、标签）通过表单数据提交。图片文件（最多 5 张）可选上传，系统会将上传的图片路径保存到数据库。
- **请求头:**
  - `Authorization`: 必填，格式为 `Bearer <JWT_TOKEN>`
- **请求体:** (使用 `multipart/form-data`)

  - **必填字段:**
    - `title` (String): 帖子标题
    - `content` (String): 帖子内容
    - `campus_id` (Integer): 校区 ID
    - `post_type` (String): 帖子类型（如 "sell" 或 "receive"）
  - **可选字段:**
    - `price` (Number): 帖子价格（默认为 0）
    - `tag` (String): 帖子标签
    - `images` (File): 文件类型字段，最多可上传 5 张图片

- **成功响应:**

  - **状态码:** 201
  - **内容:**
    ```json
    {
      "message": "发布成功",
      "image_urls": ["/uploads/1738204953485-filename1.jpg", "/uploads/1738204953490-filename2.jpg"]
    }
    ```
    如果没有上传图片，则返回的 `image_urls` 数组为空。

- **错误响应:**
  - **状态码:** 401
    - 内容: `{ "message": "未提供 Token" }` 或 `{ "message": "无效的 Token" }`
  - **状态码:** 400
    - 内容: `{ "message": "缺少必要参数" }`
  - **状态码:** 500
    - 内容: `{ "message": "服务器错误" }`

### 删除帖子

- **方法:** DELETE
- **路径:** `/api/posts/:post_id`
- **功能:** 删除指定帖子（软删除，将 `status` 字段设置为 `'deleted'`），使用 `Token` 验证用户身份，确保只有帖子的作者可以删除帖子。
- **请求参数:**
  - `post_id`: 帖子的 ID，整数，必填（作为 URL 参数传递）。
  - `Authorization`: 请求头中的 `Token`，字符串，必填，格式为 `Bearer <token>`，用于验证用户身份。
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "帖子已标记为删除" }`
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "缺少必要参数" }`
  - **状态码:** 401
  - **内容:** `{ "message": "未提供 Token" }` 或 `{ "message": "无效的 Token" }`
  - **状态码:** 404
  - **内容:** `{ "message": "帖子未找到或用户无权删除" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 示例：

#### 请求：

```http
DELETE http://localhost:5000/api/posts/1
Authorization: Bearer <your_token_here>
```

### 获取帖子详情

- **方法:** GET
- **路径:** `/api/posts/byID/:post_id`
- **功能:** 获取指定帖子的详细信息及相关的图片 URL。
- **请求参数:**
  - `post_id`: 帖子 ID，整型，必填。
- **成功响应:**
  - **状态码:** 200
  - **内容:** 返回指定帖子及相关图片信息。
  - **示例:**
    ```json
    {
      "post": {
        "id": 1,
        "title": "二手书转让",
        "content": "出售二手书籍，八成新。",
        "author_id": 1,
        "created_at": "2023-01-01T12:00:00",
        "status": "active",
        "price": 50,
        "campus_id": 1,
        "post_type": "sale",
        "tag": "书籍"
      },
      "images": ["/uploads/1738204953485-tios2b1p2dl.png", "/uploads/1738204953486-tios2b1p2dl.jpg"]
    }
    ```
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "缺少帖子 ID" }`
  - **状态码:** 404
  - **内容:** `{ "message": "帖子未找到或已被删除" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 注意事项

1. **图片上传**：上传的图片存储在服务器的 `public/uploads/` 文件夹中，并且会返回图片的 URL。前端可以通过`http://localhost:5000/uploads/xxx`访问图片，xxx 文件存储在 images 数组里。
2. **Token 验证**：需要使用 JWT Token 验证用户身份。在发送请求时，需要在请求头中提供有效的 Token（`Authorization: Bearer <token>`）。
3. **软删除**：删除帖子时并不从数据库中删除数据，而是通过更新 `status` 字段为 `'deleted'` 来实现软删除。

### 查询帖子（按条件）

- **方法:** GET
- **路径:** `/api/posts/search`
- **功能:** 根据指定条件查询帖子，并返回相关的图片信息。支持根据标题、状态、校区 ID、帖子类型、标签、价格等进行筛选，支持使用关键字在 title 和 content 中进行模糊搜索。
- **请求参数:**
  - `title`: 帖子标题，字符串，可选。
  - `status`: 帖子的状态（'active', 'inactive', 'deleted'），字符串，可选。
  - `campus_id`: 校区 ID，整数，可选。
  - `post_type`: 帖子类型，字符串，可选。
  - `tag`: 帖子的标签，字符串，可选。
  - `min_price`: 最低价格，浮动数值，可选。
  - `max_price`: 最高价格，浮动数值，可选。
  - `keyword`：关键字，字符串，可选。
  - `page`：当前页码，整数，可选，默认 1。
  - `limit`：每页的记录数，整数，可选，默认 10
- **成功响应:**

  - **状态码:** 200
  - **内容:**

  ```
  {
  "total": 50, // 符合条件的总记录数
  "page": 1, // 当前页码
  "limit": 10, // 每页记录数
  "posts": [
    {
      "id": 1, // 帖子ID
      "title": "帖子标题", // 帖子标题
      "content": "帖子内容", // 帖子内容
      "status": "active", // 帖子状态
      "campus_id": 1, // 校区ID
      "post_type": "buy", // 帖子类型
      "tag": "电子产品", // 标签
      "price": 100, // 价格
      "images": ["image_url_1", "image_url_2"] // 关联的图片URL列表
    },
    // 其他帖子数据
  ]
  }
  ```

- **无数响应**

```
{
  "total": 0, // 符合条件的总记录数
  "posts": [] // 空列表
}
```

- **错误响应:**
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`
  - **状态码:** 404
  - **内容:** `{ "message": "未找到符合条件的帖子" }`
  - **状态码:** 500
  - **内容:** `{ "message": "获取图片信息失败" }`

### 示例：

#### 请求：

```http
GET http://localhost:5000/api/posts/search?title=二手&status=active&min_price=10&max_price=100
```

### 修改帖子

- **方法:** PUT
- **路径:** `/api/posts/:post_id`
- **功能:** 修改指定帖子的内容。用户必须提供有效的 `token`，并且只能修改自己发布的帖子。
- **请求参数:**
  - **路径参数:**
    - `post_id`: 帖子的 ID，整数，必填。
  - **请求体:**
    - `title`: 帖子标题，字符串，必填。
    - `content`: 帖子内容，字符串，可选。
    - `price`: 帖子价格，浮动数值，可选。
    - `campus_id`: 校区 ID，整数，必填。
    - `status`: 帖子的状态（active, deleted），字符串，可选。
    - `post_type`: 帖子类型（如：sale，求购等），字符串，必填。
    - `tag`: 帖子标签，字符串，可选。
    - `images`: 帖子图片，文件，可选。(旧图片不会保留)
- **请求头:**
  - `Authorization`: Bearer <token>，必填，用于身份验证。
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "帖子更新成功" }`
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "缺少必要参数" }`
  - **状态码:** 401
  - **内容:** `{ "message": "未提供 Token" }` 或 `{ "message": "无效的 Token" }`
  - **状态码:** 404
  - **内容:** `{ "message": "帖子未找到或用户无权修改" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 示例：

#### 请求：

```http
PUT http://localhost:5000/api/posts/1
Content-Type: application/json
Authorization: Bearer <your_token_here>

{
  "title": "二手数学分析教材",
  "price": 50.00,
  "campus_id": 1,
  "post_type": "sale",
  "tag": "教材",
  "status": "active"
}
```

## appeals

### **获取所有申诉**

- **方法:** `GET`
- **路径:** `/api/appeals/`
- **功能:** 获取所有未删除的申诉。
- **请求参数:** 无
- **成功响应:**
  - **状态码:** `200`
  - **内容:** 返回申诉列表（`id`, `author_id`, `post_id`, `content`, `status`, `created_at`）
- **错误响应:**
  - **状态码:** `500`
  - **内容:** `{ "message": "服务器错误" }`

---

### **提交申诉**

- **方法:** `POST`
- **路径:** `/api/appeals/publish`
- **功能:** 用户提交一条申诉。
- **请求体:** (使用 `multipart/form-data`)
  - **请求参数:**
    - `post_id`: 帖子的 ID，整数类型，必填。
    - `content`: 申诉内容，字符串类型，必填。
    - `images`: 申诉图片，图片类型，可选。
- **成功响应:**
  - **状态码:** `201`
  - **内容:** `{ "message": "申诉提交成功" }`
- **错误响应:**
  - **状态码:** `400`
  - **内容:** `{ "message": "缺少必要参数" }`
  - **状态码:** `404`
  - **内容:** `{ "message": "用户不存在" }` 或 `{ "message": "帖子不存在" }`
  - **状态码:** `500`
  - **内容:** `{ "message": "服务器错误" }`

---

### **查询未解决的申诉（仅限当前用户）**

- **方法:** `GET`
- **路径:** `/api/appeals/search/pending`
- **功能:** 查询当前用户下的所有未解决的申诉（过滤已删除或已解决的申诉）。
- **请求参数:** 无
- **成功响应:**
  - **状态码:** `200`
  - **内容:** 返回未解决的申诉列表
- **错误响应:**
  - **状态码:** `401`
  - **内容:** `{ "message": "未提供 Token" }`
  - **状态码:** `500`
  - **内容:** `{ "message": "查询失败" }`

---

### **查询已解决的申诉（仅限当前用户）**

- **方法:** `GET`
- **路径:** `/api/appeals/search/resolved`
- **功能:** 查询当前用户下的所有已解决的申诉。
- **请求参数:** 无
- **成功响应:**
  - **状态码:** `200`
  - **内容:** 返回已解决的申诉列表
- **错误响应:**
  - **状态码:** `401`
  - **内容:** `{ "message": "未提供 Token" }`
  - **状态码:** `500`
  - **内容:** `{ "message": "查询失败" }`

---

### **查询已撤销的申诉（仅限当前用户）**

- **方法:** `GET`
- **路径:** `/api/appeals/search/deleted`
- **功能:** 查询当前用户下的所有已撤销（删除）的申诉。
- **请求参数:** 无
- **成功响应:**
  - **状态码:** `200`
  - **内容:** 返回已撤销的申诉列表
- **错误响应:**
  - **状态码:** `401`
  - **内容:** `{ "message": "未提供 Token" }`
  - **状态码:** `500`
  - **内容:** `{ "message": "查询失败" }`

---

### **修改申诉状态**

- **方法:** `PUT`
- **路径:** `/api/appeals/:appeal_id`
- **功能:** 修改申诉的状态。
- **请求参数:**
  - `appeal_id`: 申诉的 ID，整数类型，必填。
  - `status`: 申诉的新状态，必填。可选值：`'pending'`, `'resolved'`, `'deleted'`。
- **成功响应:**
  - **状态码:** `200`
  - **内容:** `{ "message": "申诉状态已更新" }`
- **错误响应:**
  - **状态码:** `400`
  - **内容:** `{ "message": "缺少参数" }`
  - **状态码:** `403`
  - **内容:** `{ "message": "您没有权限修改该申诉" }`
  - **状态码:** `404`
  - **内容:** `{ "message": "申诉不存在" }`
  - **状态码:** `500`
  - **内容:** `{ "message": "服务器错误" }`

---

### **删除申诉（软删除）**

- **方法:** `DELETE`
- **路径:** `/api/appeals/:appeal_id`
- **功能:** 将申诉状态修改为 `'deleted'`，即软删除申诉。
- **请求参数:**
  - `appeal_id`: 申诉的 ID，整数类型，必填。
- **成功响应:**
  - **状态码:** `200`
  - **内容:** `{ "message": "申诉已删除" }`
- **错误响应:**
  - **状态码:** `400`
  - **内容:** `{ "message": "缺少申诉 ID" }`
  - **状态码:** `403`
  - **内容:** `{ "message": "您没有权限删除该申诉" }`
  - **状态码:** `404`
  - **内容:** `{ "message": "申诉不存在" }`
  - **状态码:** `500`
  - **内容:** `{ "message": "服务器错误" }`

---

## favorites

### 添加收藏

- **方法:** POST
- **路径:** `/api/favorites/add`
- **功能:** 用户可以收藏指定的帖子。如果帖子已被收藏，则返回错误。
- **请求参数:**
  - `post_id`: 帖子的 ID，整数，必填。
  - **Headers:**
    - `Authorization`: 必填，包含 `Bearer token` 格式的认证信息。
- **成功响应:**
  - **状态码:** 201
  - **内容:** `{ "message": "收藏成功" }`
- **错误响应:**
  - **状态码:** 401
  - **内容:** `{ "message": "Token 无效或已过期" }`
  - **状态码:** 404
  - **内容:** `{ "message": "帖子未找到或已被删除" }`
  - **状态码:** 400
  - **内容:** `{ "message": "已经收藏过该帖子" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

---

### 取消收藏

- **方法:** DELETE
- **路径:** `/api/favorites/remove`
- **功能:** 用户取消对指定帖子的收藏。
- **请求参数:**
  - `post_id`: 帖子的 ID，整数，必填。
  - **Headers:**
    - `Authorization`: 必填，包含 `Bearer token` 格式的认证信息。
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "取消收藏成功" }`
- **错误响应:**
  - **状态码:** 401
  - **内容:** `{ "message": "无效的 token" }`
  - **状态码:** 404
  - **内容:** `{ "message": "未找到收藏记录" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

---

### 查询用户的所有收藏

- **方法:** GET
- **路径:** `/api/favorites/user/favorites`
- **功能:** 获取用户收藏的所有帖子信息，已删除的帖子不会显示。
- **请求参数:** 无
- **Headers:**
  - `Authorization`: 必填，包含 `Bearer token` 格式的认证信息。
- **成功响应:**
  - **状态码:** 200
  - **内容:** 返回用户所有收藏的帖子，包含 `id`, `title`, `content`, `author_id`, `created_at`, `status`, `price`, `campus_id`, `post_type`, `tag` 等字段。
- **错误响应:**
  - **状态码:** 401
  - **内容:** `{ "message": "无效的 token" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

---

### 错误处理

- **状态码:** 500
- **内容:** `{ "message": "服务器错误" }`
