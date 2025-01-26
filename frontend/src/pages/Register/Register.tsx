import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store";
import "../../App.scss";

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
    <div>
      <div className="login_register">
        <div>Register</div>
        <form onSubmit={handleSubmit}>
          <input
            required
            type="text"
            placeholder="nickname"
            name="nickname"
            value={inputs.nickname}
            onChange={handleChange}
          />
          <input
            required
            type="text"
            placeholder="email"
            name="email"
            value={inputs.email}
            onChange={handleChange}
          />
          <input
            required
            type="password"
            placeholder="password"
            name="password"
            value={inputs.password}
            onChange={handleChange}
          />
          <input
            required
            type="password"
            placeholder="confirm password"
            name="confirmPassword"
            value={inputs.confirmPassword}
            onChange={handleChange}
          />
          <input
            required
            type="text"
            placeholder="qq_id"
            name="qq_id"
            value={inputs.qq_id}
            onChange={handleChange}
          />
          <input
            required
            type="text"
            placeholder="username"
            name="username"
            value={inputs.username}
            onChange={handleChange}
          />
          <input
            required
            type="number"
            placeholder="campus_id"
            name="campus_id"
            value={inputs.campus_id.toString()}
            onChange={handleChange}
          />
          <button type="submit">Register</button>
          {error && <div>{error.message}</div>}
          <span>
            <Link to="/">Login the account.</Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Register;
