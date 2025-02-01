import { Router } from "express";
import bcrypt from "bcrypt"; // 用于密码加密
import jwt from "jsonwebtoken"; // 用于生成 JWT
import db from "../db.js";
import dotenv from "dotenv";
import upload from "../middlewares/uploadImg.js"; // 引入图片上传中间件
import fs from "fs";

let router = Router();

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

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

// 用户注册，支持头像上传
router.post("/register", upload.single("image"), async (req, res) => {
  let { nickname, email, password, qq_id, username, campus_id } = req.body;

  const avatarFile = req.file; // 获取上传的头像文件

  if (!nickname) nickname = "DUTers"; // 默认昵称
  if (!email || !password || !qq_id || !username || !campus_id) {
    // 如果必填参数缺少，删除文件（如果存在）并返回 400
    if (avatarFile) {
      try {
        await fs.promises.unlink(avatarFile.path);
      } catch {}
    }
    return res.status(400).json({ message: "缺少必要参数" });
  }

  try {
    // 检查邮箱或用户名是否已存在
    const [rows] = await db.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username]);

    // 处理头像路径
    const avatarPath = avatarFile ? "/uploads/" + avatarFile.filename : "/uploads/default.png";

    if (rows.length > 0) {
      // 如果已存在，也删除上传文件
      if (avatarFile) {
        try {
          await fs.promises.unlink(avatarFile.path);
        } catch {}
      }

      const emailRegistered = rows.some((row) => row.email === email);
      const usernameRegistered = rows.some((row) => row.username === username);
      return res.status(400).json({
        message: emailRegistered && usernameRegistered ? "邮箱和用户名都已被注册" : emailRegistered ? "邮箱已被注册" : "用户名已被注册",
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 存入数据库
    await db.query("INSERT INTO users (nickname, email, password, qq_id, username, campus_id, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)", [nickname, email, hashedPassword, qq_id, username, campus_id, avatarPath]);

    res.status(201).json({ message: "注册成功" });
  } catch (err) {
    // console.error(err);
    if (avatarFile) {
      try {
        await fs.promises.unlink(avatarFile.path);
      } catch {}
    }
    res.status(500).json({ message: "服务器错误" });
  }
});

// 用户登录
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "请正确输入用户名或密码" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ? OR email = ?", [identifier, identifier]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "用户名/邮箱或密码错误" });
    }

    const user = rows[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "用户名/邮箱或密码错误" });
    }

    // 生成 JWT 令牌
    const token = jwt.sign(
      {
        user_id: user.id,
        username: user.username,
        nickname: user.nickname,
        campus_id: user.campus_id,
        qq: user.qq_id,
        avatar: `${user.avatar}`,
      },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "登录成功",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 获取用户个人信息
router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // 直接返回 JWT 里已有的信息，减少数据库查询
    const userData = {
      nickname: decoded.nickname,
      username: decoded.username,
      campus_id: decoded.campus_id,
      qq: decoded.qq,
      avatar: decoded.avatar,
    };

    // 只有当信用分等重要信息需要更新时，才查数据库?  how?  还没想好。。。。
    // 给出查询路由，具体时机由前端决定
    const [rows] = await db.query("SELECT credit FROM users WHERE id = ?", [decoded.user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "用户不存在" });
    }

    userData.credit = rows[0].credit;

    res.status(200).json(userData);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token 无效" });
  }
});

// 删除当前用户（需要身份验证）
router.delete("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [decoded.user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "用户不存在" });
    }

    res.status(200).json({ message: "账户已删除" });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token 无效" });
  }
});

// 修改用户信息，包括头像（需要身份验证）
router.put("/profile", upload.single("image"), async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const avatarFile = req.file; // 获取上传的头像文件

  if (!token) {
    if (avatarFile) {
      try {
        await fs.promises.unlink(avatarFile.path);
      } catch {}
    }
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { nickname, qq_id, campus_id } = req.body;

    // 验证必填参数
    if (!nickname || !qq_id || !campus_id) {
      if (avatarFile) {
        try {
          await fs.promises.unlink(avatarFile.path);
        } catch {}
      }
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 从数据库获取旧头像路径
    const [oldUserRows] = await db.query("SELECT avatar FROM users WHERE id = ?", [decoded.user_id]);
    if (!oldUserRows.length) {
      if (avatarFile) {
        import("fs").then((fsModule) => fsModule.unlink(avatarFile.path, () => {}));
      }
      return res.status(404).json({ message: "用户不存在" });
    }

    let oldAvatar = oldUserRows[0].avatar;
    let avatarPath = oldAvatar; // 如果无新头像就保持原头像

    // 如果上传了新头像，则删除旧头像（非默认）并更新为新路径
    if (avatarFile) {
      if (oldAvatar && oldAvatar !== "/uploads/default.png") {
        try {
          await fs.promises.unlink("public" + oldAvatar);
        } catch {}
      }
      avatarPath = "/uploads/" + avatarFile.filename;
    }

    // 更新用户信息
    const [result] = await db.query("UPDATE users SET nickname = ?, qq_id = ?,  campus_id = ?, avatar = ? WHERE id = ?", [nickname, qq_id, campus_id, avatarPath, decoded.user_id]);

    if (result.affectedRows === 0) {
      if (avatarFile) {
        try {
          await fs.promises.unlink(avatarFile.path);
        } catch {}
      }

      return res.status(404).json({ message: "用户不存在" });
    }

    // 生成新 Token
    const newToken = jwt.sign(
      {
        user_id: decoded.user_id,
        username: decoded.username,
        nickname: nickname,
        campus_id: campus_id,
        qq: qq_id,
        avatar: avatarPath,
      },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "更新成功", token: newToken });
  } catch (err) {
    console.error(err);
    if (avatarFile) {
      try {
        await fs.promises.unlink(avatarFile.path);
      } catch {}
    }
    res.status(401).json({ message: "Token 无效" });
  }
});

export default router;
