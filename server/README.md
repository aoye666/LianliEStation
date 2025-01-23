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

使用 `dotenv` 开发依赖进行环境变量管理，如以上环境有改动，请自行在 `server` 根目录下新建`.env`文件，用以下格式修改

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=
```

## 数据库环境

代码中并没有新建数据库的命令，请确保本地数据库中存在`marketplace`库，示例 api 中的 users 表初始化代码如下，仅供测试

```sql
use marketplace;
CREATE TABLE `users` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `nickname` VARCHAR(50) NOT NULL DEFAULT 'DUTers',  -- 昵称，默认为 "DUTers"
    `username` VARCHAR(100) NOT NULL,                 -- 用户名，非空且不得重复
    `email` VARCHAR(100),                             -- 邮箱
    `password` VARCHAR(255) NOT NULL,                 -- 密码
    `qq_id` VARCHAR(100) NOT NULL,                    -- QQ 号
    `campus` VARCHAR(255) NOT NULL,                   -- 校区
    `credit` INT NOT NULL DEFAULT 100,                -- 信誉分，默认为 100
    PRIMARY KEY (`id`),
    UNIQUE KEY `email_unique` (`email`),              -- 邮箱唯一
    UNIQUE KEY `username_unique` (`username`)         -- 用户名唯一
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO users (nickname, username, email, password, qq_id, campus, credit) VALUES
('Alice', 'alice001', 'alice@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', '123456789', '开发区校区', 100),
('Bob', 'bob001', 'bob@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', '987654321', '开发区校区', 100),
('Charlie', 'charlie001', 'charlie@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', '111223344', '开发区校区', 100);

```

```sql
CREATE TABLE `posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,  -- 帖子ID，自动增加并设置为主键
  `title` VARCHAR(255) NOT NULL,  -- 帖子标题，不能为空
  `content` TEXT,  -- 帖子内容，可以为空
  `author_id` INT NOT NULL,  -- 帖子作者的 ID，不能为空
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 帖子创建时间，默认当前时间
  `status` ENUM('active', 'inactive', 'deleted') DEFAULT 'active',  -- 帖子状态，默认是 'active'
  `price` DECIMAL(10, 2) DEFAULT 0.00,  -- 帖子价格，默认 0.00
  `campus_id` INT NOT NULL,  -- 校区 ID，不能为空
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE  -- 外键约束，删除用户时，相关帖子也会被删除
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 



INSERT INTO `posts` (`author_id`, `title`, `content`, `price`, `campus_id`) VALUES
(1, '二手数学分析教材', '浙江大学版教材，无字迹破损，附习题解答', 35.50, 1),
(2, '九成新机械键盘', 'Cherry MX红轴，RGB背光，包装齐全', 299.00, 1),
(3, '开发区校区代取快递', '大件3元/件，小件2元/件（20:00前可预约）', 2.00, 1),
(1, '免费赠送考研英语资料', '近10年真题及解析电子版，联系QQ发送', 0.00, 1),
(2, '电竞椅转让', '人体工学设计，使用半年，因毕业急出', 150.00, 1);

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
  - `campus`: 用户所在校区，字符串，必需。
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
- **功能:** 验证用户的用户名和密码。如果验证通过，返回用户信息。
- **请求参数:**
  - `username`: 用户名，字符串，必需。
  - `password`: 用户密码，字符串，必需。
- **成功响应:**
  - **状态码:** 200
  - **内容:** 用户信息，包含 `id`, `nickname`, `username`, `role`。
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "缺少必要参数" }`
  - **状态码:** 401
  - **内容:** `{ "message": "密码错误" }`
  - **状态码:** 404
  - **内容:** `{ "message": "用户不存在" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 获取当前用户信息

- **方法:** POST
- **路径:** `/api/users/profile`
- **功能:** 获取指定用户的详细信息，使用用户名查找。
- **请求参数:** username
- **成功响应:**
  - **状态码:** 200
  - **内容:** 用户信息，包含 `id`, `nickname`, `email`, `campus`,`qq_id`,`credit`。
- **错误响应:**
  - **状态码:** 404
  - **内容:** `{ "message": "用户不存在" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 删除当前用户账户

- **方法:** DELETE
- **路径:** `/api/users/profile`
- **功能:** 删除指定的用户账户，使用用户名查找。
- **请求参数:** username
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "账户已删除" }`
- **错误响应:**
  - **状态码:** 404
  - **内容:** `{ "message": "用户不存在" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

## posts

### 获取所有帖子信息

- **方法:** GET
- **路径:** `/api/posts/`
- **功能:** 获取数据库中所有帖子的基本信息，仅用于测试目的。
- **请求参数:** 无
- **成功响应:**
  - **状态码:** 200
  - **内容:** 帖子信息列表，包含 `id`, `user_id`, `title`, `content`, `price`, `campus` 。
- **错误响应:**
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

### 新增帖子

- **方法:** POST
- **路径:** `/api/posts/publish`
- **功能:** 允许当前用户发布一条新的帖子信息
- **请求参数:**
  - `user_id`: 用户 id，INT，必需。
  - `title`: 帖子标题，字符串，必需。
  - `content`: 帖子描述，字符串，必需。
  - `price`: 帖子物品价格，高精度十进制浮点数(最多两位小数)或对应字符串，必需。
  - `campus`: 帖子所在校区，字符串，必需。
- **成功响应:**
  - **状态码:** 201
  - **内容:** `{ message: "发布成功" }`
- **错误响应:**
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`
