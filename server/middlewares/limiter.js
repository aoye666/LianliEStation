import rateLimit from "express-rate-limit";

// 注册限流，防止恶意注册
export const registerLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24小时
  max: 3, // 每个 IP 最多允许 3 次成功注册请求
  skipFailedRequests: true, // 仅对成功请求计数
  message: { message: "您今天已经注册成功过一次，请明天再试" },
});

// 登录限流，防止暴力破解
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 每个 IP 最多允许 5 次登录尝试
  message: { message: "您的登录尝试次数过多，请稍后再试" },
  skipSuccessfulRequests: true, // 只对失败的请求计数
});

// 密码修改限流
export const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 3, // 每个 IP 最多允许 3 次密码修改尝试
  message: { message: "您的密码修改尝试次数过多，请稍后再试" },
  skipSuccessfulRequests: true, // 只对失败的请求计数
});


// 配置请求验证码的 IP 限制
export const verificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 3, // 每个 IP 最多允许 3 次请求验证码
    skipFailedRequests: true, // 仅对成功请求计数
    message: { message: "您的请求验证码次数过多，请稍后再试" }, // 超过限制时的响应消息
  });
  