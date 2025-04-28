import { Router } from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";

let router = Router();
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 删除校园墙帖子(用户软删除，管理员硬删除)
router.delete("/posts/:post_id", async (req, res) => {
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



// 处理帖子互动
router.post("/posts/interact/:post_id", async (req, res) => {
  const { post_id } = req.params;
  const { action, content, parent_id } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "未提供Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user_id = decoded.user_id;

    // 验证帖子是否存在且未删除
    const [postRows] = await db.query(
      "SELECT * FROM posts WHERE id = ? AND status = 'active'", 
      [post_id]
    );

    if (postRows.length === 0) {
      return res.status(404).json({ message: "帖子不存在或已被删除" });
    }

    // 根据action执行不同操作
    switch (action) {
      case 'like':
        // 点赞操作
        const { value } = req.body;
        if (value === undefined) {
          return res.status(400).json({ message: "缺少 value 参数" });
        }

        // 判断是增加还是减少点赞数
        const valueChange = value === true ? 1 : value === false ? -1 : 0;

        if (valueChange === 0) {
          return res.status(400).json({ message: "无效的 value 参数，必须是 true 或 false" });
        }

        // 更新帖子点赞数
        await db.query("UPDATE posts SET likes = likes + ? WHERE id = ?", [valueChange, post_id]);
        
        return res.status(200).json({ 
          message: valueChange === 1 ? "点赞成功" : "取消点赞成功" 
        });

      case 'comment':
        // 评论操作
        if (!content) {
          return res.status(400).json({ message: "评论内容不能为空" });
        }

        // 检查父评论是否存在（如果有）
        if (parent_id) {
          const [parentCommentRows] = await db.query(
            "SELECT * FROM post_comments WHERE id = ? AND status = 'active'",
            [parent_id]
          );

          if (parentCommentRows.length === 0) {
            return res.status(404).json({ message: "回复的评论不存在或已被删除" });
          }
        }

        // 插入评论
        const [result] = await db.query(
          "INSERT INTO post_comments (post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)",
          [post_id, user_id, content, parent_id || null]
        );

        // 获取新创建的评论
        const [newComment] = await db.query(
          `SELECT pc.*, u.nickname, u.avatar 
           FROM post_comments pc
           JOIN users u ON pc.user_id = u.id
           WHERE pc.id = ?`, 
          [result.insertId]
        );

        if (newComment.length === 0) {
          return res.status(500).json({ message: "评论创建失败" });
        }

        // 构建响应数据
        const commentData = {
          id: newComment[0].id,
          content: newComment[0].content,
          created_at: newComment[0].created_at,
          parent_id: newComment[0].parent_id,
          user: {
            id: newComment[0].user_id,
            nickname: newComment[0].nickname,
            avatar: newComment[0].avatar
          }
        };

        return res.status(201).json({
          message: "评论发布成功",
          comment: commentData
        });

      default:
        return res.status(400).json({ message: "无效的交互类型，必须是 like 或 comment" });
    }
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "无效的Token" });
    }
    res.status(500).json({ message: "服务器错误" });
  }
});


router.get("/posts", async (req, res) => {
  try {
    const {
      campus_id,     // 校区ID
      author_id,     // 作者ID
      keyword,       // 关键词搜索(标题和内容)
      status = 'active', // 默认只查询active状态
      page = 1,      // 页码
      limit = 10,    // 每页数量
      with_comments = false // 是否包含评论，默认不包含
    } = req.query;

    // 构建基础查询
    let query = `
      SELECT p.*, u.nickname as author_name, u.avatar as author_avatar, 
             (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id AND pc.status = 'active') as comment_count
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE 1=1
    `;


    const queryParams = [];


    if (campus_id) {
      query += " AND p.campus_id = ?";
      queryParams.push(campus_id);
    }

    if (author_id) {
      query += " AND p.author_id = ?";
      queryParams.push(author_id);
    }

    if (keyword) {
      query += " AND (p.title LIKE ? OR p.content LIKE ?)";
      queryParams.push(`%${keyword}%`, `%${keyword}%`);
    }


    if (status && status !== 'all') {
      query += " AND p.status = ?";
      queryParams.push(status);
    }


    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered_posts`;
    const [countRows] = await db.query(countQuery, queryParams);
    const total = countRows[0].total;
    

    query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    const offset = (parseInt(page) - 1) * parseInt(limit);
    queryParams.push(parseInt(limit), offset);

    // 执行主查询
    const [rows] = await db.query(query, queryParams);

    // 获取帖子相关的图片和评论
    const postsWithData = await Promise.all(
      rows.map(async (post) => {
        // 获取帖子图片
        const [imageRows] = await db.query(
          "SELECT image_url FROM post_image WHERE post_id = ?", 
          [post.id]
        );
        
        // 如果需要包含评论
        let comments = [];
        if (with_comments === 'true' || with_comments === true || with_comments === '1') {
          // 获取顶级评论
          const [commentRows] = await db.query(`
            SELECT c.*, u.nickname as user_nickname, u.avatar as user_avatar
            FROM post_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ? AND c.parent_id IS NULL AND c.status = 'active'
            ORDER BY c.created_at DESC
          `, [post.id]);
          
          // 获取每个顶级评论的回复
          comments = await Promise.all(
            commentRows.map(async (comment) => {
              const [replyRows] = await db.query(`
                SELECT c.*, u.nickname as user_nickname, u.avatar as user_avatar
                FROM post_comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.parent_id = ? AND c.status = 'active'
                ORDER BY c.created_at ASC
              `, [comment.id]);
              
              // 格式化评论数据
              return {
                id: comment.id,
                content: comment.content,
                created_at: comment.created_at,
                user: {
                  id: comment.user_id,
                  nickname: comment.user_nickname,
                  avatar: comment.user_avatar
                },
                replies: replyRows.map(reply => ({
                  id: reply.id,
                  content: reply.content,
                  created_at: reply.created_at,
                  user: {
                    id: reply.user_id,
                    nickname: reply.user_nickname,
                    avatar: reply.user_avatar
                  }
                }))
              };
            })
          );
        }
        
        return {
          ...post,
          images: imageRows.map(img => img.image_url),
          comments: comments
        };
      })
    );

    // 返回结果
    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      posts: postsWithData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});



export default router;