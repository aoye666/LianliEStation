// 通用提示对话框组件，支持多种提示类型
import React, { useState } from 'react'
import './NoticeModal.scss'
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import closeIcon from '../../assets/close-black.svg';

// 定义提示类型
export type NoticeType = 'login' | 'qq' | 'custom';

interface NoticeConfig {
  title: string;
  message: string;
  buttonText: string;
  buttonAction: () => void;
  showCloseButton?: boolean;
}

interface NoticeModalProps {
  type: NoticeType;
  customConfig?: Partial<NoticeConfig>; // 自定义配置，可扩展
  onClose?: () => void;
}

const NoticeModal: React.FC<NoticeModalProps> = ({ 
  type, 
  customConfig,
  onClose 
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [visible, setVisible] = useState(true);
  
  // 根据类型获取默认配置
  const getDefaultConfig = (noticeType: NoticeType): NoticeConfig => {
    switch (noticeType) {
      case 'login':
        return {
          title: '提示',
          message: '您还未登录，请先登录以使用当前功能',
          buttonText: '立即登录',
          buttonAction: () => navigate('/auth/login'),
          showCloseButton: true,
        };
      case 'qq':
        return {
          title: '绑定QQ',
          message: '您还未绑定QQ，请先绑定QQ以使用当前功能',
          buttonText: '去绑定',
          buttonAction: () => navigate('/settings'), // 跳转到设置页面
          showCloseButton: true,
        };
      case 'custom':
        return {
          title: '提示',
          message: '请完成相关操作',
          buttonText: '确定',
          buttonAction: () => handleClose(),
          showCloseButton: true,
        };
      default:
        return {
          title: '提示',
          message: '请完成相关操作',
          buttonText: '确定',
          buttonAction: () => handleClose(),
          showCloseButton: true,
        };
    }
  };

  // 合并默认配置和自定义配置
  const config: NoticeConfig = {
    ...getDefaultConfig(type),
    ...customConfig,
  };
  
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };
  
  const handleButtonClick = () => {
    config.buttonAction();
    // 某些操作可能需要在按钮点击后关闭对话框
    if (type === 'custom') {
      handleClose();
    }
  };
  
  // 登录类型的对话框：如果已登录则不显示
  if (type === 'login' && isAuthenticated) {
    return null;
  }
  
  // 如果手动关闭了对话框
  if (!visible) {
    return null;
  }

  return (
    <div className='notice-modal-overlay'>
      <div className='notice-modal-content'>
        {config.showCloseButton && (
          <div className='close-btn' onClick={handleClose}>
            <img src={closeIcon} alt="关闭" />
          </div>
        )}
        <div className='notice-title'>{config.title}</div>
        <div className='notice-message'>{config.message}</div>
        <button className='notice-btn' onClick={handleButtonClick}>
          {config.buttonText}
        </button>
      </div>
    </div>
  );
};

export default NoticeModal;
