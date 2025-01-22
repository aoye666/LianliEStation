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
    `nickname` varchar(50)    NOT NULL,
    `email` varchar(100),
    `password` varchar(255) NOT NULL,
    `qq_id` varchar(100) NOT NULL,
    `role` enum('user', 'admin') DEFAULT 'user',
    PRIMARY KEY (`id`),
    UNIQUE KEY `email_unique` (`email`)
);

--id,自动增加
--nickname,昵称
--email,邮箱
--role,管理员？普通用户？

INSERT INTO users (nickname, email, password, qq_id, role) VALUES
('Alice', 'alice@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', '123456789', 'user'),
('Bob', 'bob@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', '987654321', 'admin'),
('Charlie', 'charlie@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', '111223344', 'user');

```

##

使用`node app.js` 或者 `npm start`启动后端
**推荐使用 nodemon app.js**启动

# api 文档

- GET /api/users：请求所有用户的信息（仅供测试使用）。
- POST /api/users/register：用户注册。
- POST /api/users/login：用户登录。
- GET /api/users/me：获取当前登录用户的信息。
- DELETE /api/users/me：删除当前登录用户的账户。