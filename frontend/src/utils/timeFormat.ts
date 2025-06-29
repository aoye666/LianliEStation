/**  
 将ISO时间字符串转换为标准格式
 @param dateStr - ISO格式的时间字符串
 @param format - 格式化后的字符串格式，默认为"YYYY-MM-DD HH:mm"
 @returns - 格式化后的字符串
*/
export function timeFormat(
  dateStr: string | undefined,
  format: string
): string {
  if (dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const padZero = (num: number): string =>
      num < 10 ? "0" + num : num.toString();

    switch (format) {
      case "YYYY-MM-DD HH:mm":
        return `${year}.${month}.${day} ${padZero(hours)}:${padZero(minutes)}`;
      case "YYYY-MM-DD HH":
        return `${year}.${month}.${day} ${padZero(hours)}`;
      case "YYYY-MM-DD":
        return `${year}.${month}.${day}`;
      case "YYYY-MM":
        return `${year}.${month}`;
      case "MM-DD HH:mm":
        return `${month}.${day} ${padZero(hours)}:${padZero(
          minutes
        )}`;
      default:
        return `${year}.${month}.${day} ${padZero(hours)}:${padZero(minutes)}`;
    }
  } else return "日期获取失败";
}
