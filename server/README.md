<!--
 * @Author: ourEDA MaMing
 * @Date: 2025-01-22 13:20:55
 * @LastEditors: ourEDA MaMing
 * @LastEditTime: 2025-01-22 16:15:02
 * @FilePath: \server\README.md
 * @Description: 李猴啊
 * 
 * Copyright (c) 2025 by FanZDStar , All Rights Reserved. 
-->
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
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `nickname` varchar(50)    NOT NULL,--nickname,昵称
    `email` varchar(100),              --email,邮箱
    `password` varchar(255) NOT NULL,
    `qq_id` varchar(100) NOT NULL,
    `role` enum('user', 'admin') DEFAULT 'user',--role,管理员？普通用户？
    PRIMARY KEY (`id`),
    UNIQUE KEY `email_unique` (`email`)
);

INSERT INTO users (nickname, email, password, qq_id, role) VALUES
('Alice', 'alice@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', '123456789', 'user'),
('Bob', 'bob@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', '987654321', 'admin'),
('Charlie', 'charlie@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', '111223344', 'user');

```

##

使用`node app.js` 或者 `npm start`启动后端
**推荐使用 nodemon app.js**启动

# API 文档

## 获取所有用户信息

- **方法:** GET
- **路径:** `/`
- **功能:** 获取数据库中所有用户的基本信息，仅用于测试目的。
- **请求参数:** 无
- **成功响应:**
  - **状态码:** 200
  - **内容:** 用户信息列表，包含 `id`, `nickname`, `email`, `role`。
- **错误响应:**
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`
- **示例**
  - `fetch('http://localhost:5000/api/users/', {
  method: 'GET'
}).then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`

## 用户注册

- **方法:** POST
- **路径:** `/register`
- **功能:** 允许新用户注册。检查邮箱是否已注册，未注册则将新用户信息插入数据库。
- **请求参数:**
  - `nickname`: 用户昵称，字符串，必需。
  - `email`: 用户邮箱，字符串，必需。
  - `password`: 用户密码，字符串，必需。
  - `qq_id`: 用户的 QQ 号码，字符串，必需。
- **成功响应:**
  - **状态码:** 201
  - **内容:** `{ "message": "注册成功" }`
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "缺少必要参数" }` 或 `{ "message": "邮箱已被注册" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

## 用户登录

- **方法:** POST
- **路径:** `/login`
- **功能:** 验证用户的邮箱和密码。如果验证通过，返回用户信息。
- **请求参数:**
  - `email`: 用户邮箱，字符串，必需。
  - `password`: 用户密码，字符串，必需。
- **成功响应:**
  - **状态码:** 200
  - **内容:** 用户信息，包含 `id`, `nickname`, `email`, `role`。
- **错误响应:**
  - **状态码:** 400
  - **内容:** `{ "message": "缺少必要参数" }`
  - **状态码:** 401
  - **内容:** `{ "message": "密码错误" }`
  - **状态码:** 404
  - **内容:** `{ "message": "用户不存在" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

## 获取当前用户信息

- **方法:** GET
- **路径:** `/profile`
- **功能:** 获取指定用户的详细信息，此例中使用模拟的用户 ID。
- **请求参数:** 无
- **成功响应:**
  - **状态码:** 200
  - **内容:** 用户信息，包含 `id`, `nickname`, `email`, `role`。
- **错误响应:**
  - **状态码:** 404
  - **内容:** `{ "message": "用户不存在" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`

## 删除当前用户账户

- **方法:** DELETE
- **路径:** `/profile`
- **功能:** 删除指定的用户账户，此例中使用模拟的用户 ID。
- **请求参数:** 无
- **成功响应:**
  - **状态码:** 200
  - **内容:** `{ "message": "账户已删除" }`
- **错误响应:**
  - **状态码:** 404
  - **内容:** `{ "message": "用户不存在" }`
  - **状态码:** 500
  - **内容:** `{ "message": "服务器错误" }`
