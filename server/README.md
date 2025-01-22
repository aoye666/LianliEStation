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
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- 用户ID，自增主键
    username VARCHAR(50) NOT NULL,      -- 用户名
    email VARCHAR(100) NOT NULL,        -- 邮箱
    password_hash VARCHAR(255) NOT NULL, -- 密码哈希值
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- 更新时间
);
INSERT INTO user (username, email, password_hash) VALUES
('alice', 'alice@example.com', '5f4dcc3b5aa765d61d8327deb882cf99'), -- 密码: password
('bob', 'bob@example.com', '5f4dcc3b5aa765d61d8327deb882cf99'),     -- 密码: password
('charlie', 'charlie@example.com', '5f4dcc3b5aa765d61d8327deb882cf99'); -- 密码: password
```

##

使用`node app.js` 或者 `npm start`启动后端
**推荐使用 nodemon app.js**启动

# api 文档

- GET /api/user 请求所有用户的信息 （仅供测试使用）
