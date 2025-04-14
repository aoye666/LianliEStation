import { Router } from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";

let router = Router();
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 删除校园墙帖子(用户软删除，管理员硬删除)
router.delete("/:post_id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { post_id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "未提供Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const author_id = decoded.user_id;
    const isAdmin = decoded.isAdmin === true;

    // 如果是管理员，执行硬删除
    if (isAdmin) {
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

      return res.status(200).json({ message: "管理员已完全删除帖子" });
    } 
    
    // 普通用户，检查归属权并执行软删除
    else {
      // 验证帖子归属权
      const [rows] = await db.query("SELECT * FROM posts WHERE id = ? AND author_id = ?", [post_id, author_id]);

      if (rows.length === 0) {
        return res.status(403).json({ message: "没有权限删除此帖子" });
      }

      // 软删除帖子
      await db.query("UPDATE posts SET status = 'deleted' WHERE id = ?", [post_id]);

      res.status(200).json({ message: "删除成功" });
    }
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "无效的Token" });
    }
    res.status(500).json({ message: "服务器错误" });
  }
});

export default router;