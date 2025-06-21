// 将ISO时间字符串转换为“月+日+时:分”的格式，例如：“2025.4.13 11:46”
// @param dateStr - ISO格式的时间字符串
// @returns 格式化后的字符串
export function timeConvert(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const padZero = (num: number): string => (num < 10 ? '0' + num : num.toString());

  return `${year}.${month}.${day} ${padZero(hours)}:${padZero(minutes)}`;
}