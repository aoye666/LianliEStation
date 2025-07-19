import dotenv from "dotenv";
import { Router } from "express";
import jwt from "jsonwebtoken"; // 用于解析 JWT
import fs from "fs";
import db from "../db.js";

let router = Router();

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 根据 qq_id 查询用户信息（仅限管理员）
router.post("/search-user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // 获取 token
  const { qq_id } = req.body; // 从请求体中获取 qq_id

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  if (!qq_id) {
    return res.status(400).json({ message: "缺少 qq_id 参数" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // 解码 Token 获取用户信息

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    // 查询指定 qq_id 的用户信息
    const [rows] = await db.query("SELECT id, nickname, email, qq_id, username, credit, campus_id FROM users WHERE qq_id = ?", [qq_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "没有找到匹配的用户" });
    }

    res.status(200).json(rows[0]); // 返回找到的用户信息
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});

// 管理员修改用户信用值 (credit)
router.put("/credit", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // 获取 token
  const { qq_id, credit } = req.body; // 获取 qq_id 和新的 credit 值

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  if (!qq_id || credit === undefined) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // 解码 Token 获取用户信息

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    // 更新指定 qq_id 用户的 credit 值
    const [result] = await db.query("UPDATE users SET credit = ? WHERE qq_id = ?", [credit, qq_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "没有找到匹配的用户" });
    }

    res.status(200).json({ message: "信用值已更新" });
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});

// 管理员硬删除帖子
router.delete("/posts/:post_id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { post_id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    // 先查询帖子是否存在
    const [postRows] = await db.query("SELECT * FROM posts WHERE id = ?", [post_id]);

    if (postRows.length === 0) {
      return res.status(404).json({ message: "帖子不存在" });
    }

    // 查询帖子关联的所有图片
    const [imageRows] = await db.query("SELECT image_url FROM post_image WHERE post_id = ?", [post_id]);

    // 删除文件系统中的图片文件
    const deleteImagePromises = imageRows.map(async (image) => {
      const imagePath = `./public${image.image_url}`;
      try {
        await fs.promises.unlink(imagePath);
      } catch (error) {
        console.error(`删除图片文件失败: ${imagePath}`, error);
        // 继续执行，不中断流程
      }
    });

    // 等待所有图片文件删除完成
    await Promise.all(deleteImagePromises);

    // 删除数据库中的记录
    await db.query("DELETE FROM post_image WHERE post_id = ?", [post_id]);
    await db.query("DELETE FROM posts WHERE id = ?", [post_id]);

    res.status(200).json({ message: "管理员已完全删除帖子" });
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});

// 管理员硬删除商品
router.delete("/goods/:goods_id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { goods_id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    // 先查询商品是否存在
    const [goodsRows] = await db.query("SELECT * FROM goods WHERE id = ?", [goods_id]);

    if (goodsRows.length === 0) {
      return res.status(404).json({ message: "商品不存在" });
    }

    // 查询商品关联的所有图片
    const [imageRows] = await db.query("SELECT image_url FROM goods_images WHERE goods_id = ?", [goods_id]);

    // 删除文件系统中的图片文件
    const deleteImagePromises = imageRows.map(async (image) => {
      const imagePath = `./public${image.image_url}`;
      try {
        await fs.promises.unlink(imagePath);
      } catch (error) {
        console.error(`删除图片文件失败: ${imagePath}`, error);
        // 继续执行，不中断流程
      }
    });

    // 等待所有图片文件删除完成
    await Promise.all(deleteImagePromises);

    // 删除数据库中的记录
    await db.query("DELETE FROM goods_images WHERE goods_id = ?", [goods_id]);
    await db.query("DELETE FROM goods WHERE id = ?", [goods_id]);

    res.status(200).json({ message: "管理员已完全删除商品" });
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});

export default router;
