// 提示未登录用户进行登录，跳转至登录页
import React, { useState } from 'react'
import './NoticeLogin.scss'
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import closeIcon from '../../assets/close-black.svg';

const NoticeLogin = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useUserStore();
    const [visible, setVisible] = useState(true);
    
    const handleLogin = () => {
        navigate('/auth/login');
    };
    
    const handleClose = () => {
        setVisible(false);
    };
    
    if (isAuthenticated || !visible) {
        return null;
    }

  return (
    <div className='notice-login-overlay'>
      <div className='notice-login-content'>
        <div className='close-btn' onClick={handleClose}>
          <img src={closeIcon} alt="关闭" />
        </div>
        <div className='notice-title'>提示</div>
        <div className='notice-message'>您还未登录，请先登录以使用完整功能</div>
        <button className='login-btn' onClick={handleLogin}>立即登录</button>
      </div>
    </div>
  )
}

export default NoticeLogin
