import cookieParser from "cookie-parser";
import cors from "cors";
import express, { json, urlencoded } from "express";
import createError from "http-errors";
import logger from "morgan";

// 示例路由
import aiTemplateRouter from "./routes/aiTemplate.js";
import appealsRouter from "./routes/appeals.js";
import authRouter from "./routes/auth.js";
// import campusWallRouter from "./routes/campusWall.js";
import favoritesRouter from "./routes/favorites.js";
import goodsRouter from "./routes/goods.js";
// import postsRouter from "./routes/posts.js";
// import responsesRouter from "./routes/responses.js";
import usersRouter from "./routes/users.js";
//import forumRouter from "./routes/forum.js";
//import adminRouter from "./routes/admin.js";
//import historyRouter from "./routes/history.js";
import messagesRouter from "./routes/messages.js";
import publishRouter from "./routes/publish.js";

let app = express();

// 中间件
app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// 静态文件托管，允许访问上传的图片
app.use("/uploads", express.static("public/uploads"));

// 示例路由
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/goods", goodsRouter);
// app.use("/api/posts", postsRouter);
app.use("/api/appeals", appealsRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/aiTemplate", aiTemplateRouter);
// app.use("/api/responses", responsesRouter);
// app.use("/api/campusWall", campusWallRouter);
// app.use("/api/forum", forumRouter);
// app.use("/api/admin", adminRouter);
// app.use("/api/history", historyRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/publish", publishRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// 错误处理
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    message: err.message,
    stack: req.app.get("env") === "development" ? err.stack : undefined,
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
