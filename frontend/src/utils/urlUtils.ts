/**
 * URL处理工具函数
 * 主要用于图片路径和API路径处理
 */

// 构建完整图片URL
export const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = 'http://localhost:5000'; // 根据您的实际API地址调整
  return `${baseUrl}${imagePath}`;
};

// 获取默认图片
export const getDefaultImage = (type: 'avatar' | 'background' | 'placeholder'): string => {
  const defaults = {
    avatar: '/uploads/default_avatar.png',
    background: '/uploads/default_background.png',
    placeholder: '/assets/takePlace.png'
  };
  return defaults[type];
};
