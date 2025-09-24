import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message, Select } from "antd";
import { useUserStore } from "../../../store";
import "./Register.scss";
import logo_title from "../../../assets/logo-title.png";
import background from "../../../assets/background2.jpg";

type RegisterInputs = {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  qq_id: string;
  username: string;
  campus_id: number;
};

const Register: React.FC = () => {
  // 输入的用户信息
  const [inputs, setInputs] = useState<RegisterInputs>({
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
    qq_id: "",
    username: "",
    campus_id: 1,
  });

  const navigate = useNavigate();
  const { register } = useUserStore();

  // 设置用户信息
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: name === "campus_id" ? parseInt(value, 10) : value }));
  };

  // 校区选项
  const campusOptions = [
    { value: 1, label: '凌水主校区' },
    { value: 2, label: '开发区校区' },
    { value: 3, label: '盘锦校区' },
  ];

  // 提交表单
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // 检查密码是否一致
      if (inputs.password !== inputs.confirmPassword) {
        message.error("密码不一致");
        return;
      }

      // 格式验证
      if (!/\S+@\S+\.\S+/.test(inputs.email)) {
        message.error("请输入有效的邮箱地址");
        return;
      }
      if (!/^\d{5,12}$/.test(inputs.qq_id)) {
        message.error("请输入有效的QQ号");
        return;
      }
      if (!/^[a-zA-Z0-9_]{3,16}$/.test(inputs.username)) {
        message.error("用户名不符合要求");
        return;
      }
      if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}/.test(inputs.password)
      ) {
        message.error("密码不符合要求");
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
      message.success("注册成功！正在跳转到登录页面...");
      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    } catch (err: any) {
      if (err.response) {
        message.error(err.response.data.message || "注册失败");
      } else {
        message.error("发生未知错误，请稍后重试");
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
        <img className="register-logo-title" src={logo_title} alt="logo-title"></img>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-item">
            <label htmlFor="nickname">昵称（用于应用内展示）</label>
            <input
              required
              type="text"
              name="nickname"
              id="nickname"
              value={inputs.nickname}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label htmlFor="email">邮箱（用于登录及账号操作）</label>
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
            <label htmlFor="qq_id">QQ号（用于交易沟通）</label>
            <input
              required
              type="text"
              name="qq_id"
              id="qq_id"
              value={inputs.qq_id}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label htmlFor="username" style={{ height: "40px" }}>
              用户名（用于登录，3~16位字母、数字或下划线）
            </label>
            <input
              required
              type="text"
              name="username"
              id="username"
              value={inputs.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label htmlFor="campus_id">请选择校区</label>
            <Select
              className="register-campus-dropdown"
              options={campusOptions}
              value={inputs.campus_id}
              onChange={v => setInputs({ ...inputs, campus_id: v })}
            />
          </div>
          <div className="form-item">
            <label htmlFor="password" style={{ height: "40px" }}>
              密码（至少含1个大写字母、1个数字，长度至少为8位）
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
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              required
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={inputs.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <button type="submit">注册</button>
          <div className="register-link">
            <Link to="/auth/login" className="link">立即登录</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
