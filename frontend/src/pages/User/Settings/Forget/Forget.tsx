import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import { useUserStore } from "../../../../store";
import "./Forget.scss";
import logo_title from "../../../../assets/logo-title.png";
import background from "../../../../assets/background3.jpg";

type VerificationInputs = {
  email: string;
  verification: string;
  password: string;
  confirmPassword: string; // 增加确认密码字段
};

const Forget: React.FC = () => {
  const [inputs, setInputs] = useState<VerificationInputs>({
    email: "",
    verification: "",
    password: "",
    confirmPassword: "", // 初始化确认密码字段
  });

  const [countdown, setCountdown] = useState<number>(0);

  const navigate = useNavigate();
  const { requestVerification, changePassword, isAuthenticated } =
    useUserStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequest = async () => {
    if (countdown > 0) return; // 倒计时中则不发送请求

    try {
      await requestVerification(inputs.email);
      message.success("验证码已发送，请查收邮件");
      setCountdown(300); // 设置5分钟倒计时
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
      }, 300000); // 5分钟后清除倒计时
    } catch (err: any) {
      if (err.response) {
        message.error(err.response.data.message || "发送验证码失败");
      } else {
        message.error("发送验证码失败，请稍后重试");
      }
    }
  };

  const validatePasswords = () => {
    if (inputs.password !== inputs.confirmPassword) {
      message.error("两次输入的密码不一致");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 检查密码是否一致
    if (!validatePasswords()) {
      message.error("两次输入的密码不一致");
      return;
    }

    // 检查密码是否符合要求
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}/.test(inputs.password)) {
      message.error("密码不符合要求");
      return;
    }

    try {
      await changePassword(inputs.email, inputs.verification, inputs.password);
      message.success("密码重置成功！正在跳转...");
      setTimeout(() => {
        navigate("/market");
      }, 1500);
    } catch (err: any) {
      if (err.response) {
        message.error(err.response.data.message || "重置密码失败");
      } else {
        message.error("发生未知错误，请稍后重试");
      }
    }
  };

  return (
    <div className="forget-container">
      <img className="forget-background" src={background} alt="background" />
      <div className="forget-box">
        <img className="forget-logo-title" src={logo_title} alt="logo-title" />
        <form className="forget-form" onSubmit={handleSubmit}>
          <div className="form-item">
            <label htmlFor="email">账户邮箱:</label>
            <input
              required
              type="text"
              name="email"
              id="email"
              value={inputs.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label htmlFor="verification">验证码:</label>
            <div className="verification-container">
              <input
                required
                type="text"
                name="verification"
                id="verification"
                value={inputs.verification}
                onChange={handleChange}
              />
              {countdown > 0 ? (
                <button className="verification-disabled-btn" disabled>
                  {Math.ceil(countdown)}秒后再试
                </button>
              ) : (
                <button className="verification-btn" onClick={handleRequest}>
                  获取验证码
                </button>
              )}
            </div>
          </div>
          <div className="form-item">
            <label htmlFor="password" style={{ height: "40px" }}>
              新密码（至少含1个大写字母、1个数字，长度至少为8位）:
            </label>
            <input
              required
              type="password"
              name="password"
              id="password"
              value={inputs.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label htmlFor="confirmPassword">确认密码:</label>
            <input
              required
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={inputs.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="reset-btn">
            重置密码
          </button>
          <div className="forget-link">
            {isAuthenticated ? (
              <Link className="link" to="/user/settings">
                返回设置
              </Link>
            ) : (
              <Link className="link" to="/auth/login">
                返回登录
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Forget;
