import { Router } from "express";
import db from "../db.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"; // 用于生成 JWT

let router = Router();

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;


// 添加帖子收藏
router.post("/posts/add", (req, res) => {
  const { post_id } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  // 确保 token 存在
  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  // 验证 Token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token 无效或已过期" });
    }

    const user_id = decoded.user_id;

    // 确保必需的字段存在
    if (!post_id) {
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 检查帖子是否存在且未删除
    db.query("SELECT * FROM posts WHERE id = ? AND status != 'deleted'", [
      post_id,
    ])
      .then(([rows]) => {
        if (rows.length === 0) {
          return res.status(404).json({ message: "帖子未找到或已被删除" });
        }

        // 检查是否已经收藏过该帖子
        db.query(
          "SELECT * FROM user_favorites WHERE user_id = ? AND post_id = ? AND goods_id IS NULL",
          [user_id, post_id]
        )
          .then(([existingRows]) => {
            if (existingRows.length > 0) {
              return res.status(400).json({ message: "已经收藏过该帖子" });
            }

            // 执行收藏操作
            db.query(
              "INSERT INTO user_favorites (user_id, post_id, goods_id) VALUES (?, ?, NULL)",
              [user_id, post_id]
            )
              .then(() => {
                res.status(201).json({ message: "收藏帖子成功" });
              })
              .catch((err) => {
                console.error(err);
                res.status(500).json({ message: "服务器错误" });
              });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).json({ message: "服务器错误" });
          });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "服务器错误" });
      });
  });
});

// 添加商品收藏
router.post("/goods/add", (req, res) => {
  const { goods_id } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  // 确保 token 存在
  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  // 验证 Token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token 无效或已过期" });
    }

    const user_id = decoded.user_id;

    // 确保必需的字段存在
    if (!goods_id) {
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 检查商品是否存在且未删除
    db.query("SELECT * FROM goods WHERE id = ? AND status != 'deleted'", [
      goods_id,
    ])
      .then(([rows]) => {
        if (rows.length === 0) {
          return res.status(404).json({ message: "商品未找到或已被删除" });
        }

        // 检查是否已经收藏过该商品
        db.query(
          "SELECT * FROM user_favorites WHERE user_id = ? AND goods_id = ? AND post_id IS NULL",
          [user_id, goods_id]
        )
          .then(([existingRows]) => {
            if (existingRows.length > 0) {
              return res.status(400).json({ message: "已经收藏过该商品" });
            }

            // 执行收藏操作
            db.query(
              "INSERT INTO user_favorites (user_id, post_id, goods_id) VALUES (?, NULL, ?)",
              [user_id, goods_id]
            )
              .then(() => {
                res.status(201).json({ message: "收藏商品成功" });
              })
              .catch((err) => {
                console.error(err);
                res.status(500).json({ message: "服务器错误" });
              });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).json({ message: "服务器错误" });
          });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "服务器错误" });
      });
  });
});

// 取消帖子收藏
router.delete("/posts/remove", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  // 确保 token 存在
  if (!token) {
    return res.status(401).json({ message: "未提供 token" });
  }

  try {
    // 验证 token 并获取 user_id
    const decoded = jwt.verify(token, SECRET_KEY);
    const user_id = decoded.user_id;
    const { post_id } = req.body;

    // 确保 post_id 存在
    if (!post_id) {
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 执行取消帖子收藏操作
    db.query("DELETE FROM user_favorites WHERE user_id = ? AND post_id = ? AND goods_id IS NULL", [
      user_id,
      post_id,
    ])
      .then((result) => {
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "未找到收藏记录" });
        }

        res.status(200).json({ message: "取消帖子收藏成功" });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "服务器错误" });
      });
  } catch (err) {
    return res.status(401).json({ message: "无效的 token" });
  }
});

// 取消商品收藏
router.delete("/goods/remove", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  // 确保 token 存在
  if (!token) {
    return res.status(401).json({ message: "未提供 token" });
  }

  try {
    // 验证 token 并获取 user_id
    const decoded = jwt.verify(token, SECRET_KEY);
    const user_id = decoded.user_id;
    const { goods_id } = req.body;

    // 确保 goods_id 存在
    if (!goods_id) {
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 执行取消商品收藏操作
    db.query("DELETE FROM user_favorites WHERE user_id = ? AND goods_id = ? AND post_id IS NULL", [
      user_id,
      goods_id,
    ])
      .then((result) => {
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "未找到收藏记录" });
        }

        res.status(200).json({ message: "取消商品收藏成功" });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "服务器错误" });
      });
  } catch (err) {
    return res.status(401).json({ message: "无效的 token" });
  }
});

// // 取消收藏 (兼容旧API)
// router.delete("/remove", (req, res) => {
//   const token = req.headers.authorization?.split(" ")[1];

//   // 确保 token 存在
//   if (!token) {
//     return res.status(401).json({ message: "未提供 token" });
//   }

//   try {
//     // 验证 token 并获取 user_id
//     const decoded = jwt.verify(token, SECRET_KEY);
//     const user_id = decoded.user_id;
//     const { post_id } = req.body;

//     // 确保 post_id 存在
//     if (!post_id) {
//       return res.status(400).json({ message: "缺少必要参数" });
//     }

//     // 执行取消收藏操作
//     db.query("DELETE FROM user_favorites WHERE user_id = ? AND post_id = ?", [
//       user_id,
//       post_id,
//     ])
//       .then((result) => {
//         if (result.affectedRows === 0) {
//           return res.status(404).json({ message: "未找到收藏记录" });
//         }

//         res.status(200).json({ message: "取消收藏成功" });
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).json({ message: "服务器错误" });
//       });
//   } catch (err) {
//     return res.status(401).json({ message: "无效的 token" });
//   }
// });

// 查询用户的所有收藏（新接口）
router.get("/", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  // 确保 token 存在
  if (!token) {
    return res.status(401).json({ message: "未提供 token" });
  }

  try {
    // 验证 token 并获取 user_id
    const decoded = jwt.verify(token, SECRET_KEY);
    const user_id = decoded.user_id;

    // 并行查询用户收藏的帖子和商品
    Promise.all([
      // 查询收藏的帖子（posts表结构：id, title, content, author_id, campus_id, status, created_at, likes, complaints）
      db.query(
        `
        SELECT p.id, p.title, p.content, p.author_id, p.created_at, p.status, p.campus_id, p.likes, p.complaints
        FROM user_favorites uf
        INNER JOIN posts p ON uf.post_id = p.id
        WHERE uf.user_id = ? AND uf.post_id IS NOT NULL AND uf.goods_id IS NULL AND p.status != 'deleted'
        ORDER BY uf.created_at DESC
      `,
        [user_id]
      ),
      // 查询收藏的商品（goods表结构：id, title, content, author_id, created_at, status, price, campus_id, goods_type, tag）
      db.query(
        `
        SELECT g.id, g.title, g.content, g.author_id, g.created_at, g.status, g.price, g.campus_id, g.goods_type, g.tag
        FROM user_favorites uf
        INNER JOIN goods g ON uf.goods_id = g.id
        WHERE uf.user_id = ? AND uf.goods_id IS NOT NULL AND uf.post_id IS NULL AND g.status != 'deleted'
        ORDER BY uf.created_at DESC
      `,
        [user_id]
      )
    ])
      .then(([postsResult, goodsResult]) => {
        const [posts] = postsResult;
        const [goods] = goodsResult;
        
        res.status(200).json({
          message: "获取收藏列表成功",
          data: {
            posts: posts,
            goods: goods
          }
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "服务器错误" });
      });

  } catch (err) {
    return res.status(401).json({ message: "无效的 token" });
  }
});

// // 查询用户的所有收藏（兼容旧接口）
// router.get("/user/favorites", (req, res) => {
//   const token = req.headers.authorization?.split(" ")[1];
  
//   // 确保 token 存在
//   if (!token) {
//     return res.status(401).json({ message: "未提供 token" });
//   }

//   try {
//     // 验证 token 并获取 user_id
//     const decoded = jwt.verify(token, SECRET_KEY);
    
//     const user_id = decoded.user_id;
    

//     // 查询用户收藏的帖子
//     db.query(
//       `
//       SELECT p.id, p.title, p.content, p.author_id, p.created_at, p.status, p.price, p.campus_id, p.post_type, p.tag
//       FROM user_favorites uf
//       INNER JOIN posts p ON uf.post_id = p.id
//       WHERE uf.user_id = ? AND p.status != 'deleted'
//     `,
//       [user_id]
//     )
//       .then(([rows]) => {
//         res.status(200).json(rows);
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).json({ message: "服务器错误" });
//       });

//   } catch (err) {
//     return res.status(401).json({ message: "无效的 token" });
//   }
// });

export default router;
