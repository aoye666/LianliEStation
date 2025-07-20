/**
 * 表单验证工具函数
 * 提供常用的验证规则，返回布尔值
 */

// 邮箱验证
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 手机号验证
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// QQ号验证
export const isValidQQ = (qq: string): boolean => {
  const qqRegex = /^[1-9][0-9]{4,10}$/;
  return qqRegex.test(qq);
};

// 价格验证
export const isValidPrice = (price: number): boolean => {
  return price > 0 && price <= 1000000;
};

// 必填验证
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== null && value !== undefined;
};