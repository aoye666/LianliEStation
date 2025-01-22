import { Router } from "express";
import db from "../db.js";

let router = Router();

// 获取所有用户信息（仅供测试使用）
router.get("/", (req, res) => {
  db.query("SELECT id, nickname, email, role FROM users")
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
  const { nickname, email, password, qq_id } = req.body;

  if (!nickname || !email || !password || !qq_id) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 检查邮箱是否已注册
  db.query("SELECT * FROM users WHERE email = ?", [email])
    .then(([rows]) => {
      if (rows.length > 0) {
        return res.status(400).json({ message: "邮箱已被注册" });
      }

      // 插入新用户
      return db.query(
        "INSERT INTO users (nickname, email, password, qq_id, role) VALUES (?, ?, ?, ?, 'user')",
        [nickname, email, password, qq_id]
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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 检查用户是否存在
  db.query("SELECT * FROM users WHERE email = ?", [email])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "用户不存在" });
      }

      const user = rows[0];

      // 验证密码（简单字符串比较）
      if (user.password !== password) {
        return res.status(401).json({ message: "密码错误" });
      }

      // 返回用户信息（暂不生成JWT）
      res.status(200).json({
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

// 获取当前用户信息（模拟当前用户 ID 为 1）
router.get("/profile", (req, res) => {
  const userId = 1; // 模拟用户 ID

  db.query("SELECT id, nickname, email, role FROM users WHERE id = ?", [userId])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "用户不存在" });
      }

      res.json(rows[0]);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

// 删除当前用户账户（模拟当前用户 ID 为 1）
router.delete("/profile", (req, res) => {
  const userId = 1; // 模拟用户 ID

  db.query("DELETE FROM users WHERE id = ?", [userId])
    .then((result) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "用户不存在" });
      }

      res.json({ message: "账户已删除" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

export default router;
