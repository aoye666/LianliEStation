// 用于处理防抖逻辑的自定义 Hook
// 该 Hook 可用于输入框监听、窗口尺寸监听、滚动监听、表单实时校验等场景，减少高频操作带来的性能问题
// 使用时传入需要防抖的值和延迟时间（毫秒）

import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

// 使用方法示例：
// const debouncedSearch = useDebounce(searchValue, 500);
// useEffect(() => { fetchData(debouncedSearch); },