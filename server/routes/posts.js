import { Router } from "express";
import db from "../db.js";
import upload from "../routes/uploadImg.js";  // 引入图片上传中间件




let router = Router();

// 获取帖子列表
router.get("/", (req, res) => {
  db.query("SELECT * FROM posts WHERE status != 'deleted'") // 排除已删除的帖子
    .then(([rows]) => {
      res.json(rows);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

// 新增帖子
router.post("/publish", upload.array("images", 5), (req, res) => {
  const { author_id, title, content, price, campus_id, post_type, tag } = req.body;
  const files = req.files; // 获取上传的文件

  // 确保必需的字段存在
  if (!author_id || !title || !campus_id || !post_type) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 插入帖子数据到 posts 表
  return db
    .query("INSERT INTO posts (author_id, title, content, price, campus_id, post_type, tag) VALUES (?, ?, ?, ?, ?, ?, ?)", [author_id, title, content, price, campus_id, post_type, tag])
    .then((result) => {
      const postId = result.insertId; // 获取刚插入的帖子 ID

      // 获取所有上传的图片文件路径
      const imageUrls = files.map((file) => `/uploads/${file.filename}`);

      // 将图片链接存入 post_images 表
      const imagePromises = imageUrls.map((url) =>
        db.query("INSERT INTO post_images (post_id, image_url) VALUES (?, ?)", [postId, url])
      );

      Promise.all(imagePromises)
        .then(() => {
          res.status(201).json({ message: "发布成功", image_urls: imageUrls });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "图片保存失败" });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

// 删除帖子
router.delete("/:post_id", (req, res) => {
  const { post_id } = req.params; // 从 URL 参数中获取 post_id
  const { author_id } = req.body; // 从请求体中获取 author_id（验证用户是否是帖子作者）

  // 确保必需的参数存在
  if (!post_id || !author_id) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 查找帖子并验证用户是否是作者
  db.query("SELECT * FROM posts WHERE id = ? AND author_id = ?", [post_id, author_id])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "帖子未找到或用户无权删除" });
      }

      // 软删除：将 status 字段设置为 'deleted'
      db.query("UPDATE posts SET status = 'deleted' WHERE id = ?", [post_id])
        .then(() => {
          res.status(200).json({ message: "帖子已标记为删除" });
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

// 获取帖子详情
router.get("/byID/:post_id", (req, res) => {
  const { post_id } = req.params; // 从 URL 参数中获取 post_id

  if (!post_id) {
    return res.status(400).json({ message: "缺少帖子 ID" });
  }

  // 查询帖子信息，并且获取与该帖子相关的图片
  db.query(
    "SELECT id, title, content, author_id, created_at, status, price, campus_id, post_type, tag FROM posts WHERE id = ? AND status != 'deleted'", 
    [post_id]
  )
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "帖子未找到或已被删除" });
      }

      const post = rows[0]; // 获取帖子信息

      // 查询与该帖子关联的图片信息
      db.query(
        "SELECT image_url FROM post_images WHERE post_id = ?", 
        [post_id]
      )
        .then(([imageRows]) => {
          // 获取图片链接数组
          const images = imageRows.map(row => row.image_url);

          // 返回帖子信息以及相关图片的 URL 列表
          res.status(200).json({
            post: post,
            images: images
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "查询帖子图片失败" });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});



// 查询帖子（按条件）
router.get("/search", (req, res) => {
  const { title, status, campus_id, post_type, tag, min_price, max_price } = req.query;

  let query = "SELECT * FROM posts WHERE status != 'deleted'"; // 排除已删除的帖子
  let params = [];

  if (title) {
    query += " AND title LIKE ?";
    params.push(`%${title}%`);
  }

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  if (campus_id) {
    query += " AND campus_id = ?";
    params.push(campus_id);
  }

  if (post_type) {
    query += " AND post_type = ?";
    params.push(post_type);
  }

  if (tag) {
    query += " AND tag = ?";
    params.push(tag);
  }

  if (min_price || max_price) {
    if (min_price) {
      query += " AND price >= ?";
      params.push(min_price);
    }
    if (max_price) {
      query += " AND price <= ?";
      params.push(max_price);
    }
  }

  // 执行查询帖子
  db.query(query, params)
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "未找到符合条件的帖子" });
      }

      // 查询与帖子相关的图片
      const postIds = rows.map(post => post.id);
      
      db.query("SELECT post_id, image_url FROM post_images WHERE post_id IN (?)", [postIds])
        .then(([imageRows]) => {
          // 创建一个帖子 ID 到图片 URL 的映射
          const imagesMap = imageRows.reduce((map, row) => {
            if (!map[row.post_id]) {
              map[row.post_id] = [];
            }
            map[row.post_id].push(row.image_url);
            return map;
          }, {});

          // 将图片信息添加到帖子中
          const postsWithImages = rows.map(post => {
            post.images = imagesMap[post.id] || [];
            return post;
          });

          res.status(200).json(postsWithImages);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "获取图片信息失败" });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});


// 修改帖子
router.put("/:post_id", (req, res) => {
  const { post_id } = req.params;
  const { author_id, title, content, price, campus_id, status, post_type, tag } = req.body;

  // 确保必需的字段存在
  if (!author_id || !title || !campus_id || !post_type) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 校验价格是否为合法数字
  if (price && isNaN(price)) {
    return res.status(400).json({ message: "价格必须是数字" });
  }

  // 查找帖子并验证用户是否是作者且帖子未被删除
  db.query("SELECT * FROM posts WHERE id = ? AND author_id = ? AND status != 'deleted'", [post_id, author_id])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "帖子未找到或用户无权修改" });
      }

      // 更新帖子
      const updateQuery = `
        UPDATE posts
        SET title = ?, content = ?, price = ?, campus_id = ?, status = ?, post_type = ?, tag = ?
        WHERE id = ?`;
      db.query(updateQuery, [title, content, price, campus_id, status, post_type, tag, post_id])
        .then(() => {
          res.status(200).json({ message: "帖子更新成功" });
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

export default router;
