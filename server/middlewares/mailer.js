import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto";

// 加载环境变量
dotenv.config();

// 配置邮件服务器（QQ 邮箱 SMTP）
const transporter = nodemailer.createTransport({
  service: "qq",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // 邮箱账户
    pass: process.env.EMAIL_PASS, // 邮箱授权码
  },
});

// 生成随机验证码
const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString("hex"); // 生成一个 6 位的验证码
};

// 发送验证码邮件
const sendVerificationCode = async (recipientEmail) => {
  const verificationCode = generateVerificationCode(); // 生成验证码

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: "验证码 - 注册验证",
    text: `您的验证码是: ${verificationCode}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return verificationCode; // 返回生成的验证码
  } catch (error) {
    console.error("邮件发送失败: ", error);
    throw new Error("邮件发送失败");
  }
};

export default sendVerificationCode;
