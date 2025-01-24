import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

type RegisterInputs = {
  username: string;
  password: string;
};

type ErrorType = {
  message: string;
};

const Register: React.FC = () => {
  // 输入的用户信息
  const [inputs, setInputs] = useState<RegisterInputs>({
    username: "",
    password: "",
  });

  // 错误信息
  const [error, setError] = useState<ErrorType | null>(null);

  const navigate = useNavigate();

  // 设置用户信息
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8800/api/auth/register", inputs);
      navigate("/");
    } catch (err: any) {
      setError(err.response.data);
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
          <input required type="password" placeholder="confirmed password" />
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
