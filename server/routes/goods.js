import dotenv from "dotenv";
import { Router } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import upload from "../middlewares/uploadImg.js";

let router = Router();

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 软删除商品
router.delete("/:goods_id", async (req, res) => {
  const { goods_id } = req.params;
  const { reason } = req.query; // 添加reason参数：'transaction'表示完成交易，'delete'表示删除
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const author_id = decoded.user_id;

    // 确保必需的参数存在
    if (!goods_id || !author_id) {
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 查找商品并验证用户是否是作者
    const [rows] = await db.query("SELECT * FROM goods WHERE id = ? AND author_id = ?", [goods_id, author_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "商品未找到或用户无权删除" });
    }

    await db.query("UPDATE goods SET status = 'deleted' WHERE id = ?", [goods_id]);

    // 如果是完成交易，记录交易事件
    if (reason === 'transaction') {
      try {
        await db.query("INSERT INTO record_event (info, type) VALUES (?, 'completed_transaction')", [goods_id.toString()]);
      } catch (recordErr) {
        console.error("记录交易完成事件失败:", recordErr);
        // 不影响主要功能，继续执行
      }
      return res.status(200).json({ message: "交易已完成，商品已标记为删除" });
    } else {
      return res.status(200).json({ message: "商品已标记为删除" });
    }
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "无效的 Token" });
  }
});

// 分页查询商品
router.get("/", async (req, res) => {
  try {
    const { keyword, title, status, campus_id, goods_type, tag, min_price, max_price, page, limit } = req.query;

    let whereClause = "WHERE status != 'deleted'";
    let params = [];

    // 记录搜索关键词到数据库
    if (keyword && keyword.trim()) {
      const trimmedKeyword = keyword.trim();
      
      // 异步更新关键词统计，不阻塞主查询
      db.query(
        `INSERT INTO search_keywords (keyword, search_count) VALUES (?, 1) 
         ON DUPLICATE KEY UPDATE search_count = search_count + 1`,
        [trimmedKeyword]
      ).catch(err => {
        console.error('记录搜索关键词失败:', err);
        // 不影响主要功能，只记录错误
      });
    }

    if (keyword) {
      whereClause += " AND (title LIKE ? OR content LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (title) {
      whereClause += " AND title LIKE ?";
      params.push(`%${title}%`);
    }

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }

    if (campus_id) {
      whereClause += " AND campus_id = ?";
      params.push(campus_id);
    }

    if (goods_type) {
      whereClause += " AND goods_type = ?";
      params.push(goods_type);
    }

    if (tag) {
      whereClause += " AND tag = ?";
      params.push(tag);
    }

    if (min_price) {
      whereClause += " AND price >= ?";
      params.push(min_price);
    }

    if (max_price) {
      whereClause += " AND price <= ?";
      params.push(max_price);
    }

    const countQuery = `SELECT COUNT(*) as total FROM goods ${whereClause}`;
    const [countRows] = await db.query(countQuery, params);
    const total = countRows[0].total;
    // 如果总数为0，直接返回空结果
    if (total === 0) {
      return res.status(200).json({
        total: 0,
        count: 0, // 添加当前页商品数量
        page: page ? Number(page) : null,
        limit: limit ? Number(limit) : null,
        goods: [],
      });
    }

    let dataQuery;
    let finalParams = [...params];
    // 判断是否使用分页
    if (page && limit) {
      const offset = (Number(page) - 1) * limit;

      dataQuery = `
        SELECT *
        FROM goods
        ${whereClause}
        ORDER BY id DESC
        LIMIT ?
        OFFSET ?
      `;

      // 追加分页参数
      finalParams.push(Number(limit), Number(offset));
    } else {
      dataQuery = `
        SELECT *
        FROM goods
        ${whereClause}
        ORDER BY id DESC
      `;
    }

    const [rows] = await db.query(dataQuery, finalParams);

    // 添加第二次检查
    if (rows.length === 0) {
      return res.status(200).json({
        total,
        count: 0,
        page: page ? Number(page) : null,
        limit: limit ? Number(limit) : null,
        goods: [],
      });
    }

    // 获取已查到商品ID列表
    const postIds = rows.map((p) => p.id);
    // 查询对应的图片
    const [imageRows] = await db.query("SELECT goods_id, image_url FROM goods_images WHERE goods_id IN (?)", [postIds]);

    const imagesMap = imageRows.reduce((map, row) => {
      if (!map[row.goods_id]) {
        map[row.goods_id] = [];
      }
      map[row.goods_id].push(row.image_url);
      return map;
    }, {});

    const authorIds = rows.map((p) => p.author_id);
    const [authorRows] = await db.query("SELECT id, qq_id, nickname, credit, avatar FROM users WHERE id IN (?)", [authorIds]);

    // 创建作者信息映射表
    const authorsMap = authorRows.reduce((map, author) => {
      map[author.id] = {
        qq_id: author.qq_id,
        nickname: author.nickname,
        credit: author.credit,
        avatar: author.avatar,
      };
      return map;
    }, {});

    // 组装商品、图片和作者信息
    const postsWithImagesAndAuthor = rows.map((post) => {
      // 添加图片信息
      post.images = imagesMap[post.id] || [];

      // 添加作者信息
      const authorInfo = authorsMap[post.author_id] || { qq_id: null, avatar: null };
      post.author_qq_id = authorInfo.qq_id;
      post.author_nickname = authorInfo.nickname;
      post.author_credit = authorInfo.credit;
      post.author_avatar = authorInfo.avatar;

      return post;
    });

    res.status(200).json({
      total,
      count: postsWithImagesAndAuthor.length,
      page: page ? Number(page) : null,
      limit: limit ? Number(limit) : null,
      goods: postsWithImagesAndAuthor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 修改商品
router.put("/:goods_id", upload.array("images", 3), async (req, res) => {
  const { goods_id } = req.params;
  const { title, content, price, campus_id, status, goods_type, tag } = req.body;
  const files = req.files;

  // 获取 token
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    if (files && files.length) {
      for (const file of files) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
    }
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const author_id = decoded.user_id;
    const isAdmin = decoded.isAdmin || false;

    // 确保必需的字段存在
    if (!author_id || !title || !campus_id || !goods_type || !price || !status) {
      if (req.files && req.files.length) {
        for (const file of req.files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 校验价格是否为合法数字
    if (price && isNaN(price)) {
      if (req.files && req.files.length) {
        for (const file of req.files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(400).json({ message: "价格必须是数字" });
    }

    let query, queryParams;

    if (isAdmin) {
      query = "SELECT * FROM goods WHERE id = ? AND status != 'deleted'";
      queryParams = [goods_id];
    } else {
      query = "SELECT * FROM goods WHERE id = ? AND author_id = ? AND status != 'deleted'";
      queryParams = [goods_id, author_id];
    }

    const [rows] = await db.query(query, queryParams);

    if (rows.length === 0) {
      if (req.files && req.files.length) {
        for (const file of req.files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(404).json({ message: "商品未找到或用户无权修改" });
    }

    // 只在有新图片上传时才处理图片
    if (files && files.length > 0) {
      // 删除旧图片
      const [oldImages] = await db.query("SELECT image_url FROM goods_images WHERE goods_id = ?", [goods_id]);
      for (const img of oldImages) {
        const oldFilePath = "public" + img.image_url;
        await fs.promises.unlink(oldFilePath).catch(() => {});
      }
      await db.query("DELETE FROM goods_images WHERE goods_id = ?", [goods_id]);

      // 插入新图片
      const imageUrls = files.map((file) => `/uploads/${file.filename}`);
      const imagePromises = imageUrls.map((url) => db.query("INSERT INTO goods_images (goods_id, image_url) VALUES (?, ?)", [goods_id, url]));
      await Promise.all(imagePromises);
    }

    // 更新商品
    const updateQuery = `
      UPDATE goods
      SET title = ?, content = ?, price = ?, campus_id = ?, status = ?, goods_type = ?, tag = ? WHERE id = ?`;

    await db.query(updateQuery, [title, content, price, campus_id, status, goods_type, tag, goods_id]);

    // 返回成功信息
    res.status(200).json({ message: "商品更新成功" });
  } catch (err) {
    console.error(err);
    if (req.files && req.files.length) {
      for (const file of req.files) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "无效的 Token" });
    }
    res.status(500).json({ message: "服务器错误" });
  }
});

// 修改点赞数和投诉数
router.put("/:action/:goods_id", async (req, res) => {
  const { goods_id, action } = req.params;
  const { value } = req.body;
  const target_type = "goods";

  // 获取 token
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user_id = decoded.user_id;

    if (action !== "like" && action !== "complaint") {
      return res.status(400).json({ message: "无效的操作类型，必须是 like 或 complaint" });
    }

    if (value === undefined) {
      return res.status(400).json({ message: `缺少 ${action === "like" ? "like" : "complaint"} 参数` });
    }

    const valueChange = value;

    if (valueChange !== 1 && valueChange !== -1) {
      return res.status(400).json({
        message: `无效的 ${action === "like" ? "like" : "complaint"} 参数，必须是 1 或 -1`,
      });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 检查商品是否存在
      const [targetCheck] = await connection.query(`SELECT id FROM goods WHERE id = ? AND status != 'deleted'`, [goods_id]);

      if (targetCheck.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({
          message: "商品未找到",
        });
      }

      let message;
      const targetTable = action === "like" ? "likes" : "complaints";

      if (valueChange === 1) {
        // 添加点赞/投诉
        try {
          const [insertResult] = await connection.query(`INSERT INTO ${targetTable} (user_id, target_id, target_type) VALUES (?, ?, ?)`, [user_id, goods_id, target_type]);

          if (insertResult.affectedRows > 0) {
            const columnName = action === "like" ? "likes" : "complaints";
            await connection.query(`UPDATE goods SET ${columnName} = ${columnName} + 1 WHERE id = ?`, [goods_id]);

            message = action === "like" ? "点赞成功" : "投诉成功";
          } else {
            await connection.rollback();
            connection.release();
            return res.status(500).json({ message: "操作失败" });
          }
        } catch (error) {
          // 如果是重复键错误（用户已经点赞/投诉过）
          if (error.code === "ER_DUP_ENTRY") {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
              message: action === "like" ? "您已经点赞过了" : "您已经投诉过了",
            });
          }
          throw error;
        }
      } else if (valueChange === -1) {
        // 取消点赞/投诉
        const [deleteResult] = await connection.query(`DELETE FROM ${targetTable} WHERE user_id = ? AND target_id = ? AND target_type = ?`, [user_id, goods_id, target_type]);

        if (deleteResult.affectedRows > 0) {
          const columnName = action === "like" ? "likes" : "complaints";
          await connection.query(`UPDATE goods SET ${columnName} = GREATEST(${columnName} - 1, 0) WHERE id = ?`, [goods_id]);

          message = action === "like" ? "取消点赞成功" : "取消投诉成功";
        } else {
          await connection.rollback();
          connection.release();
          return res.status(400).json({
            message: action === "like" ? "您还没有点赞过" : "您还没有投诉过",
          });
        }
      }

      await connection.commit();
      connection.release();

      res.status(200).json({
        message,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "无效的 Token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    res.status(500).json({ message: "服务器错误" });
  }
});

export default router;
