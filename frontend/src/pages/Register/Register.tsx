import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store";
import "./Register.scss";
import logo from "../../assets/logo.png";
import background from "../../assets/background2.jpg";

type RegisterInputs = {
  nickname?: string;
  email: string;
  password: string;
  confirmPassword: string; // 添加 confirmPassword 属性
  qq_id: string;
  username: string;
  campus_id: number;
};

type ErrorType = {
  message: string;
};

const Register: React.FC = () => {
  // 输入的用户信息
  const [inputs, setInputs] = useState<RegisterInputs>({
    nickname: "DUTers",
    email: "",
    password: "",
    confirmPassword: "",
    qq_id: "",
    username: "",
    campus_id: 0,
  });

  // 错误信息
  const [error, setError] = useState<ErrorType | null>(null);

  const navigate = useNavigate();
  const { register } = useAuthStore();

  // 设置用户信息
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // 检查密码是否一致
      if (inputs.password !== inputs.confirmPassword) {
        setError({ message: "密码不一致" });
        return;
      }

      // 提交给注册方法的用户数据
      const userData = {
        nickname: inputs.nickname,
        email: inputs.email,
        password: inputs.password,
        qq_id: inputs.qq_id,
        username: inputs.username,
        campus_id: inputs.campus_id,
      };

      await register(userData);
      navigate("/");
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data);
      } else {
        setError({ message: "发生未知错误" });
      }
    }
  };

  return (
    <div className="register-container">
      <img
        className="register-background"
        src={background}
        alt="background"
      ></img>
      <div className="register-box">
        <img className="register-logo" src={logo} alt="logo"></img>
        <div className="register-title">连理e站</div>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-item">
            <label htmlFor="nickname">昵称:</label>
            <input
              required
              type="text"
              placeholder="nickname"
              name="nickname"
              id="nickname"
              value={inputs.nickname}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label htmlFor="email">邮箱:</label>
            <input
              required
              type="text"
              placeholder="email"
              name="email"
              id="email"
              value={inputs.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label htmlFor="qq_id">QQ号:</label>
            <input
              required
              type="text"
              placeholder="qq_id"
              name="qq_id"
              id="qq_id"
              value={inputs.qq_id}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label htmlFor="username">用户名:</label>
            <input
              required
              type="text"
              placeholder="username"
              name="username"
              id="username"
              value={inputs.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label htmlFor="campus_id">校区ID:</label>
            <input
              required
              type="number"
              placeholder="campus_id"
              name="campus_id"
              id="campus_id"
              value={inputs.campus_id.toString()}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label htmlFor="password">密码:</label>
            <input
              required
              type="password"
              placeholder="password"
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
              placeholder="confirm password"
              name="confirmPassword"
              id="confirmPassword"
              value={inputs.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <button type="submit">注册</button>
          {error && <div>{error.message}</div>}
          <div>
            <Link to="/">立即登录！</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
