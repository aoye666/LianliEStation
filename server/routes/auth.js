import { Router } from "express";
import bcrypt from "bcrypt"; // 用于密码加密
import jwt from "jsonwebtoken"; // 用于生成 JWT
import db from "../db.js";
import dotenv from "dotenv";
import {
  registerLimiter,
  loginLimiter,
  passwordChangeLimiter,
  verificationLimiter,
} from "../middlewares/limiter.js"; // 引入限流中间件
import logIP from "../middlewares/logIP.js"; // 记录IP的中间件
import sendVerificationCode from "../middlewares/mailer.js"; // 引入邮件发送逻辑

let router = Router();

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 在现有常量定义下添加
// 存储验证码的临时存储（实际使用中应该用缓存或数据库）
let currentVerificationCode = "";
let currentVerificationEmail = "";

// 用户注册
router.post("/register", registerLimiter, logIP, async (req, res) => {
  let { nickname, email, password, qq_id, username, campus_id } = req.body;
  // console.log("收到的请求体:", req.body);
  if (!nickname) nickname = "DUTers"; // 默认昵称
  if (!email || !password || !qq_id || !username || !campus_id) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  try {
    // 检查邮箱或用户名是否已存在
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (rows.length > 0) {
      const emailRegistered = rows.some((row) => row.email === email);
      const usernameRegistered = rows.some((row) => row.username === username);
      return res.status(400).json({
        message:
          emailRegistered && usernameRegistered
            ? "邮箱和用户名都已被注册"
            : emailRegistered
            ? "邮箱已被注册"
            : "用户名已被注册",
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 存入数据库
    await db.query(
      "INSERT INTO users (nickname, email, password, qq_id, username, campus_id ) VALUES (?, ?, ?, ?, ?, ?)",
      [nickname, email, hashedPassword, qq_id, username, campus_id]
    );

    res.status(201).json({ message: "注册成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 管理员注册
// router.post("/admin/register", async (req, res) => {
//   const { username, password, email } = req.body;

//   if (!username || !password || !email) {
//     return res.status(400).json({ message: "请提供用户名、密码和邮箱" });
//   }

//   try {
//     // 检查管理员是否已经存在
//     const [existingAdmin] = await db.query("SELECT * FROM admins WHERE username = ? OR email = ?", [username, email]);
//     if (existingAdmin.length > 0) {
//       return res.status(400).json({ message: "管理员用户名或邮箱已存在" });
//     }

//     // 加密密码
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 创建管理员账户
//     const [result] = await db.query("INSERT INTO admins (username, password, email) VALUES (?, ?, ?)", [username, hashedPassword, email]);

//     // 返回成功消息
//     res.status(201).json({ message: "管理员注册成功" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "服务器错误" });
//   }
// });

// 用户(管理员)登录
router.post("/login", loginLimiter, async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "请正确输入用户名/邮箱和密码" });
  }

  try {
    let user;
    let isAdmin = false;

    // 先在普通用户表中查询
    const [userRows] = await db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [identifier, identifier]
    );

    if (userRows.length > 0) {
      user = userRows[0];
      isAdmin = false;
    } else {
      // 如果普通用户表中没有，再在管理员表中查询
      const [adminRows] = await db.query(
        "SELECT * FROM admins WHERE username = ?",
        [identifier]
      );
      if (adminRows.length === 0) {
        return res.status(401).json({ message: "用户名/邮箱或密码错误" });
      }
      user = adminRows[0];
      isAdmin = true;
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "用户名/邮箱或密码错误" });
    }

    // 构建 JWT 负载，根据身份返回不同信息
    const tokenPayload = isAdmin
      ? {
          user_id: user.id,
          username: user.username,
          isAdmin: true,
        }
      : {
          user_id: user.id,
          username: user.username,
          nickname: user.nickname,
          campus_id: user.campus_id,
          qq: user.qq_id,
          isAdmin: false,
        };

    const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: "7d" });

    res.status(200).json({
      message: "登录成功",
      token,
      isAdmin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 请求验证码（邮件）
router.post("/verification", verificationLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "邮箱不能为空" });
  }

  try {
    // 发送验证码
    const verificationCode = await sendVerificationCode(email);

    // 存储验证码和邮箱（简易实现，实际上可以存入数据库或缓存）
    currentVerificationCode = verificationCode;
    currentVerificationEmail = email;
    // console.log(currentVerificationCode);
    // console.log(currentVerificationEmail);

    res.status(200).json({ message: "验证码已发送，请检查您的邮箱" });
  } catch (error) {
    console.error("发送验证码失败: ", error);
    res.status(500).json({ message: "邮件发送失败" });
  }
});

// 修改密码
router.put("/change-password", passwordChangeLimiter, async (req, res) => {
  const { email, newPassword, verificationCode } = req.body;

  if (!email || !newPassword || !verificationCode) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 验证验证码是否正确
  if (
    verificationCode !== currentVerificationCode ||
    email !== currentVerificationEmail
  ) {
    return res.status(400).json({ message: "验证码错误或已过期" });
  }

  try {
    // 查找用户
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (user.length === 0) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await db.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    res.status(200).json({ message: "密码修改成功" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "服务器错误" });
  }
});

export default router;
