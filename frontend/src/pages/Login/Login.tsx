import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store";
import "./Login.scss";
import logo from "../../assets/logo.png";
import background from "../../assets/background1.jpg";

type LoginInputs = {
  username: string;
  password: string;
};

type ErrorType = {
  message: string;
};

const Login: React.FC = () => {
  // 输入的用户信息
  const [inputs, setInputs] = useState<LoginInputs>({
    username: "",
    password: "",
  });

  // 错误信息
  const [error, setError] = useState<ErrorType | null>(null);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  // 设置用户信息
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(inputs.username, inputs.password); // 调用 login 方法
      navigate("/home");
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data);
      } else {
        setError({ message: "发生未知错误" });
      }
    }
  };

  return (
    <div className="login-container">
      <img className="login-background" src={background} alt="background"></img>
      <div className="login-box">
        <img className="login-logo" src={logo} alt="logo"></img>
        <div className="login-title">连理e站</div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-item">
            <label htmlFor="username">用户名:</label>
            <input
              required
              type="text"
              placeholder="请输入用户名"
              name="username"
              id="username"
              value={inputs.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label htmlFor="password">密码:</label>
            <input
              required
              type="password"
              placeholder="请输入密码"
              name="password"
              id="password"
              value={inputs.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit">登录</button>
          {error && <div>{error.message}</div>}
          <div className="login-register">
            <Link to="/register">立即注册！</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
