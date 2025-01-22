import { Router } from "express";
import db from "../db.js";

let router = Router();

// 获取所有用户信息（仅供测试使用）
router.get("/", (req, res) => {
  db.query("SELECT id, nickname, email FROM users")
    .then(([rows]) => {
      res.json(rows); // 返回用户列表
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

// 用户注册
router.post("/register", (req, res) => {
  let { nickname, email, password, qq_id, username, campus } = req.body;

  // 如果没有提供昵称，设置默认昵称为 'DUTers'
  if (!nickname) {
    nickname = 'DUTers';
  }

  if (!email || !password || !qq_id || !username || !campus) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 检查邮箱和用户名是否已注册
  db.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username])
    .then(([rows]) => {
      if (rows.length > 0) {
        // 检查具体是哪个字段导致的冲突
        const emailRegistered = rows.some(row => row.email === email);
        const usernameRegistered = rows.some(row => row.username === username);
        
        if (emailRegistered && usernameRegistered) {
          return res.status(400).json({ message: "邮箱和用户名都已被注册" });
        } else if (emailRegistered) {
          return res.status(400).json({ message: "邮箱已被注册" });
        } else {
          return res.status(400).json({ message: "用户名已被注册" });
        }
      }

      // 插入新用户，包括处理后的昵称
      return db.query(
        "INSERT INTO users (nickname, email, password, qq_id, username, campus) VALUES (?, ?, ?, ?, ?, ?)",
        [nickname, email, password, qq_id, username, campus]
      );
    })
    .then(() => {
      res.status(201).json({ message: "注册成功" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});


// 用户登录
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 检查用户是否存在并验证密码
  db.query("SELECT * FROM users WHERE username = ?", [username])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "用户不存在" });
      }

      const user = rows[0];

      // 检查密码，暂时简单比较
      if (user.password !== password) {
        return res.status(401).json({ message: "密码错误" });
      }

      res.status(200).json({
        id: user.id,
        nickname: user.nickname,
        username: user.username,
        role: user.role,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

// 查找当前用户
router.post("/profile", (req, res) => {
  const { username } = req.body;

  // 检查必要参数是否存在
  if (!username) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 根据用户名查找用户
  db.query("SELECT id, nickname, email, campus, qq_id, credit FROM users WHERE username = ?", [username])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "用户不存在" });
      }

      // 返回用户信息
      return res.status(200).json(rows[0]);
    })
    .catch((err) => {
      console.error("Database error:", err);
      res.status(500).json({ message: "服务器错误" });
    });
});


// 删除当前用户
router.delete("/profile", (req, res) => {
  const { username } = req.body;

  // 检查必要参数是否存在
  if (!username) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 根据用户名删除用户
  db.query("DELETE FROM users WHERE username = ?", [username])
    .then((result) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "用户不存在" });
      }

      // 返回删除成功消息
      return res.status(200).json({ message: "账户已删除" });
    })
    .catch((err) => {
      console.error("Database error:", err);
      res.status(500).json({ message: "服务器错误" });
    });
});


export default router;
