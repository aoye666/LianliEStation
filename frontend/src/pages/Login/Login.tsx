import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "../../App.scss";

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
  const { login } = useContext(AuthContext);

  // 设置用户信息
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(inputs);
      await axios.post("http://localhost:8800/api/auth/login", inputs);
      navigate("/home");
    } catch (err: any) {
      setError(err.response.data);
    }
  };

  return (
    <div>
      <div className="login_register">
        <div>Login</div>
        <form onSubmit={handleSubmit}>
          <input
            required
            type="text"
            placeholder="username"
            name="username"
            onChange={handleChange}
          />
          <input
            required
            type="password"
            placeholder="password"
            name="password"
            onChange={handleChange}
          />
          <button type="submit">登录</button>
          {error && <div>{error.message}</div>}
          <span>
            <Link to="/register">立即注册！</Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
