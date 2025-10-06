import dotenv from "dotenv";
import { Router } from "express";
import jwt from "jsonwebtoken";
import db from "../db.js";

let router = Router();
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 查询发布的商品和帖子历史
router.get("/goods", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.user_id;

    // 查询用户发布的商品
    const [goodsRows] = await db.query("SELECT * FROM goods WHERE author_id = ? AND status != 'deleted' ORDER BY id DESC", [userId]);

    // 查询用户发布的帖子
    const [postsRows] = await db.query("SELECT id, title, content, author_id, created_at, status, campus_id, tag, likes, complaints FROM posts WHERE author_id = ? AND status != 'deleted' ORDER BY id DESC", [userId]);

    // 处理商品图片
    let goodsWithImages = [];
    if (goodsRows.length > 0) {
      const goodsIds = goodsRows.map((p) => p.id);

      const [goodsImagesRows] = await db.query("SELECT goods_id, image_url FROM goods_images WHERE goods_id IN (?)", [goodsIds.length > 1 ? goodsIds : [goodsIds[0]]]);

      const goodsImagesMap = goodsImagesRows.reduce((map, row) => {
        if (!map[row.goods_id]) {
          map[row.goods_id] = [];
        }
        map[row.goods_id].push(row.image_url);
        return map;
      }, {});

      // 组装商品和图片
      goodsWithImages = goodsRows.map((goods) => {
        goods.images = goodsImagesMap[goods.id] || [];
        return goods;
      });
    }

    // 处理帖子图片
    let postsWithImages = [];
    if (postsRows.length > 0) {
      const postIds = postsRows.map((p) => p.id);

      const [postImagesRows] = await db.query("SELECT post_id, image_url FROM post_image WHERE post_id IN (?)", [postIds.length > 1 ? postIds : [postIds[0]]]);

      const postImagesMap = postImagesRows.reduce((map, row) => {
        if (!map[row.post_id]) {
          map[row.post_id] = [];
        }
        map[row.post_id].push(row.image_url);
        return map;
      }, {});

      // 组装帖子和图片
      postsWithImages = postsRows.map((post) => {
        post.images = postImagesMap[post.id] || [];
        return post;
      });
    }

    // 返回包含两个数组的对象
    res.status(200).json({
      goods: goodsWithImages,
      posts: postsWithImages,
    });
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "无效的 Token" });
    }
    res.status(500).json({ message: "服务器错误" });
  }
});

// 修改交易状态
router.put("/goods/:goods_id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.user_id;
    const goodsId = req.params.goods_id;

    // 检查用户是否有权限修改该商品
    const [checkRows] = await db.query("SELECT * FROM goods WHERE id = ? AND author_id = ?", [goodsId, userId]);
    if (checkRows.length === 0) {
      return res.status(403).json({ message: "无权修改此商品" });
    }

    // 更新商品状态
    const { status } = req.body;
    await db.query("UPDATE goods SET status = ? WHERE id = ?", [status, goodsId]);

    res.status(200).json({ message: "商品状态已更新" });
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "无效的 Token" });
    }
    res.status(500).json({ message: "服务器错误" });
  }
});

// 删除帖子
// router.delete("/posts/:post_id", async (req, res) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ message: "未提供 Token" });
//   }

//   try {
//     const decoded = jwt.verify(token, SECRET_KEY);
//     const userId = decoded.user_id;
//     const postId = req.params.post_id;

//     // 检查用户是否有权限删除该帖子
//     const [checkRows] = await db.query("SELECT * FROM posts WHERE id = ? AND author_id = ?", [postId, userId]);
//     if (checkRows.length === 0) {
//       return res.status(403).json({ message: "无权删除此帖子" });
//     }

//     // 更新帖子状态为已删除
//     await db.query("UPDATE posts SET status = 'deleted' WHERE id = ?", [postId]);

//     res.status(200).json({ message: "帖子已删除" });
//   } catch (err) {
//     console.error(err);
//     if (err.name === "JsonWebTokenError") {
//       return res.status(401).json({ message: "无效的 Token" });
//     }
//     res.status(500).json({ message: "服务器错误" });
//   }
// });

export default router;
