/**
 * px转rem工具函数
 * 设计稿宽度：375px
 * 基准字体：37.5px
 * @param px - 像素值
 * @returns rem字符串
 */
export const px2rem = (px: number): string => {
  return `${px / 37.5}rem`;
};

/**
 * 获取当前rem基准值（用于动态计算）
 * @returns 当前根元素字体大小（单位：px）
 */
export const getRemBase = (): number => {
  const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return fontSize || 37.5; // 默认 37.5px (对应 375px 屏幕宽度)
};
