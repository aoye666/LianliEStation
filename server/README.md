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

使用 `dotenv` 开发依赖进行环境变量管理，如以上环境有改动，请自行在 `server` 根目录下新建`.env`文件，用以下格式修改(SECRET_KEY 随你修改，也可以问 fanzdstar 设的是啥)

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=
SECRET_KEY=
```

## 数据库环境

代码中并没有新建数据库的命令，请确保本地数据库中存在`marketplace`库，示例 api 中的 users 表初始化代码如下，仅供测试

```sql
use marketplace;
CREATE TABLE `users` (
    `id` INT NOT NULL AUTO_INCREMENT, -- 统一id格式，统一注释风格😋
    `nickname` VARCHAR(50) NOT NULL DEFAULT 'DUTers', -- 昵称，默认为 "DUTers"
    `username` VARCHAR(100) NOT NULL, -- 用户名，非空且不得重复
    `email` VARCHAR(100), -- 邮箱
    `password` VARCHAR(255) NOT NULL, -- 密码
    `qq_id` VARCHAR(100) NOT NULL, -- QQ 号
    `campus_id` INT NOT NULL, -- 校区 ID，不能为0，不能为空
    `credit` INT NOT NULL DEFAULT 100, -- 信誉分，默认为 100
    `avatar` VARCHAR(255) NOT NULL DEFAULT 'default.png' -- 用户头像存储路径
    PRIMARY KEY (`id`),
    UNIQUE KEY `email_unique` (`email`), -- 邮箱唯一
    UNIQUE KEY `username_unique` (`username`) -- 用户名唯一
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO `users` (`nickname`, `username`, `email`, `password`, `qq_id`, `campus_id`, `avatar`, `credit`)
VALUES
('Alice', 'alice001', 'alice@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', '123456789', '1', 'default.png', 100),
('Bob', 'bob001', 'bob@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', '987654321', '1', 'default.png', 100),
('Charlie', 'charlie001', 'charlie@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', '111223344', '1', 'default.png', 100);




```

```sql
CREATE TABLE `posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,  -- 帖子ID，自动增加并设置为主键
  `title` VARCHAR(255) NOT NULL,  -- 帖子标题，不能为空
  `content` TEXT,  -- 帖子内容，可以为空
  `post_type` ENUM('receive', 'sell') NOT NULL, -- 帖子收发，不能为空
  `tag` VARCHAR(255), -- 帖子分类，可以为空
  `author_id` INT NOT NULL,  -- 帖子作者的 ID，不能为空
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 帖子创建时间，默认当前时间
  `status` ENUM('active', 'inactive', 'deleted') DEFAULT 'active',  -- 帖子状态，默认是 'active'
  `price` DECIMAL(10, 2) DEFAULT 0.00,  -- 帖子价格，默认 0.00
  `campus_id` INT NOT NULL,  -- 校区 ID，不能为空
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE  -- 外键约束，删除用户时，相关帖子也会被删除
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



INSERT INTO `posts` (`author_id`, `title`, `content`, `price`, `campus_id`, `post_type`, `tag`) VALUES
(1, '二手数学分析教材', '浙江大学版教材，无字迹破损，附习题解答', 35.50, 1, 'sell', '教材'),
(2, '九成新机械键盘', 'Cherry MX红轴，RGB背光，包装齐全', 299.00, 1, 'sell', '电子产品'),
(3, '开发区校区代取快递', '大件3元/件，小件2元/件（20:00前可预约）', 2.00, 1, 'receive', '服务'),
(1, '免费赠送考研英语资料', '近10年真题及解析电子版，联系QQ发送', 0.00, 1, 'sell', '资料'),
(2, '电竞椅转让', '人体工学设计，使用半年，因毕业急出', 150.00, 1, 'sell', '家具');
```

```sql
CREATE TABLE `appeals` (
    `id` INT AUTO_INCREMENT PRIMARY KEY, -- 申诉ID，自动增加并设置为主键
    `author_id` INT NOT NULL, -- 申诉人ID，不能为空
    `post_id` INT NOT NULL, -- 帖子ID，不能为空
    `content` TEXT NOT NULL, -- 申诉内容，不能为空
    `status` ENUM ('pending', 'resolved','', 'deleted') DEFAULT 'pending', -- 申诉状态, 默认为 'pending'
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP -- 创建时间，默认当前时间
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO `appeals` (`author_id`, `post_id`, `content`, `status`, `created_at`) VALUES
(1, 5, '帖子内容不符合事实，请求审核', 'pending', '2024-03-01 14:30:00'), -- 待处理申诉
(2, 8, '已与发布者协商解决', 'resolved', CURRENT_TIMESTAMP), -- 已解决申诉
(3, 12, '误删帖子，申请恢复', 'pending', DEFAULT);-- 使用默认时间戳
```

```sql
CREATE TABLE `post_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,  -- 图片 ID，自动增长并设置为主键
  `post_id` INT NOT NULL,  -- 关联的帖子 ID
  `image_url` VARCHAR(255) NOT NULL,  -- 图片 URL，不能为空
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 图片上传时间，默认当前时间
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE  -- 外键关联，删除帖子时，相关图片也会删除
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO `post_images` (`post_id`, `image_url`)
VALUES
(1, '/uploads/images/image1.jpg');

INSERT INTO `post_images` (`post_id`, `image_url`)
VALUES
(4, '/uploads/images/image4.jpg'),
(4, '/uploads/images/image5.jpg');
```

```sql
CREATE TABLE `user_favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,  -- 收藏记录 ID，自动增长并设置为主键
  `user_id` INT NOT NULL,  -- 用户 ID，关联到用户表的主键
  `post_id` INT NOT NULL,  -- 帖子 ID，关联到帖子表的主键
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 收藏时间，默认当前时间
  UNIQUE KEY `unique_user_post` (`user_id`, `post_id`),  -- 确保用户只能收藏一个帖子一次
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,  -- 外键关联到用户表，用户删除时级联删除收藏记录
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE  -- 外键关联到帖子表，帖子删除时级联删除收藏记录
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- 用户 1 收藏帖子 1
INSERT INTO `user_favorites` (`user_id`, `post_id`) VALUES (1, 1);
-- 用户 2 收藏帖子 3
INSERT INTO `user_favorites` (`user_id`, `post_id`) VALUES (2, 3);
-- 用户 1 收藏帖子 4
INSERT INTO `user_favorites` (`user_id`, `post_id`) VALUES (1, 4);

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
- **请求参数:**
  - `nickname`: 用户昵称，字符串，可选，默认为 'DUTers'。
  - `email`: 用户邮箱，字符串，必需。
  - `password`: 用户密码，字符串，必需。
  - `qq_id`: 用户的 QQ 号码，字符串，必需。
  - `username`: 用户名，字符串，必需。
  - `campus_id`: 用户所在校区，整型，必需。
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
  - `username`: 用户名，字符串，必需。
  - `password`: 用户密码，字符串，必需。
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "登录成功", "token": "<JWT_TOKEN>" }`
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "用户名或密码错误" }`
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

- **请求头:**
  - `Authorization`: `Bearer <JWT_TOKEN>`
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "用户信息已更新" }`
- **错误响应:**
  - **状态码:** 401
  - **内容:** `{ "message": "Token 无效" }`
  - **状态码:** 404
  - **内容:** `{ "message": "用户不存在" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

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
        "images": [
          "/uploads/1738204953485-tios2b1p2dl.png",
          "/uploads/1738204953486-tios2b1p2dl.jpg"
        ]
      }
    ]
    ```
- **错误响应:**
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 新增帖子

- **方法:** POST
- **路径:** `/api/posts/publish`
- **功能:** 发布新帖子，支持上传最多 5 张图片。
- **请求参数:**
  - `title`: 帖子标题，字符串，必填。
  - `content`: 帖子内容，字符串，必填。
  - `price`: 帖子价格，浮动数值，必填。
  - `campus_id`: 校区 ID，整型，必填。
  - `post_type`: 帖子类型，字符串，必填（如：`sale`, `exchange`）。
  - `tag`: 帖子标签，字符串，可选。
  - `images`: 帖子图片，文件，最多支持 5 张图片。
- **成功响应:**
  - **状态码:** 201
  - **内容:** `{ "message": "发布成功", "image_urls": ["/uploads/1738204953485-tios2b1p2dl.png", "/uploads/1738204953486-tios2b1p2dl.jpg"] }`
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "缺少必要参数" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

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
      "images": [
        "/uploads/1738204953485-tios2b1p2dl.png",
        "/uploads/1738204953486-tios2b1p2dl.jpg"
      ]
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

1. **图片上传**：上传的图片存储在服务器的 `public/uploads/` 文件夹中，并且会返回图片的 URL。前端可以通过`http://localhost:5000/uploads/xxx`访问图片，xxx文件存储在images数组里。
2. **Token 验证**：需要使用 JWT Token 验证用户身份。在发送请求时，需要在请求头中提供有效的 Token（`Authorization: Bearer <token>`）。
3. **软删除**：删除帖子时并不从数据库中删除数据，而是通过更新 `status` 字段为 `'deleted'` 来实现软删除。


### 查询帖子（按条件）

- **方法:** GET
- **路径:** `/api/posts/search`
- **功能:** 根据指定条件查询帖子，并返回相关的图片信息。支持根据标题、状态、校区 ID、帖子类型、标签、价格等进行筛选。
- **请求参数:**
  - `title`: 帖子标题，字符串，可选。
  - `status`: 帖子的状态（'active', 'inactive', 'deleted'），字符串，可选。
  - `campus_id`: 校区 ID，整数，可选。
  - `post_type`: 帖子类型，字符串，可选。
  - `tag`: 帖子的标签，字符串，可选。
  - `min_price`: 最低价格，浮动数值，可选。
  - `max_price`: 最高价格，浮动数值，可选。
- **成功响应:**
  - **状态码:** 200
  - **内容:** 帖子信息列表，包含 `id`, `title`, `content`, `author_id`, `created_at`, `status`, `price`, `campus_id`, `post_type`, `tag`，并附带与帖子相关的图片 URL 列表。
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

### 获取所有申诉

- **方法:** GET
- **路径:** `/api/appeals`
- **功能:** 获取所有申诉记录（含已删除数据）。
- **请求参数:** 无。
- **成功响应:**
  - **状态码:** 200
  - **内容:** 返回申诉列表，包含字段 `id`, `author_id`, `post_id`, `content`, `status`, `created_at`
- **错误响应:**
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 提交申诉

- **方法:** POST
- **路径:** `/api/appeals/publish`
- **功能:** 创建新的申诉记录。
- **请求参数:**
  - `author_id`: 用户 id，整型，必填。
  - `post_id`：关联帖子 ID，整型，必填。
  - `content`：申诉内容，字符串，必填。
- **成功响应:**
  - **状态码:** 201
  - **内容:** `{ "message": "提交成功" }`
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "缺少参数" }`
  - **状态码:** 404
  - **内容:** `{ "message": "帖子不存在" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 查询申诉

- **方法:** GET
- **路径:** `/api/appeals/search`
- **功能:** 按条件筛选申诉记录
- **请求参数:**
  - `author_id`: 用户 id，整型，可选。
  - `post_id`：关联帖子 ID，整型，可选。
  - `status`：状态筛选，字符串，可选。
- **成功响应:**
  - **状态码:** 200
  - **内容:** 返回符合条件的申诉列表（默认排除已删除记录）。
- **错误响应:**
  - **状态码:** 500
  - **内容:** `{ "message": "查询失败" }`

### 示例

```
GET http://localhost:5000/api/appeals/search?author_id=1&status=pending
```

### 修改申诉状态

- **方法:** PUT
- **路径:** `/api/appeals/:appeal_id`
- **功能:** 更新申诉处理状态
- **路径参数:**
  - `appeal_id`: 用户 id，整型，必填。
- **请求参数:**
  - `status`: 新状态，字符串，必填。
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "修改成功" }`
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "缺少参数" }`
  - **状态码:** 404
  - **内容:** `{ "message": "申诉不存在" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 示例

```
PUT http://localhost:5000/api/appeals/456
Content-Type: application/json

{
  "status": "processing"
}
```

### 删除申诉

- **方法:** DELETE
- **路径:** `/api/appeals/:appeal_id`
- **功能:** 软删除申诉记录
- **路径参数:**
  - `appeal_id`: 用户 id，整型，必填。
- **请求参数:** 无
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "修改成功" }`
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "缺少参数" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 示例

```
DELETE http://localhost:5000/api/appeals/456
```

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
