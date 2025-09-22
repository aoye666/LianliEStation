// 提示未登录用户进行登录，跳转至登录页
import React from 'react'
import './NoticeLogin.scss'
import { useNavigate } from 'react-router-dom';
import { useUserStore } from 'store';

const NoticeLogin = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useUserStore();

  return (
    <div className='notice-login' style={{display: isAuthenticated ? 'none' : 'flex'}}>
      <button onClick={()=> {
        navigate('/auth/login');
      }}>立即登录</button>
    </div>
  )
}

export default NoticeLogin
