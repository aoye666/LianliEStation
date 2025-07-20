// 用于处理 API 请求的自定义 Hook
// 该 Hook 封装了数据获取逻辑，提供 loading、error 和 data 状态
// 使用时只需传入 api 请求函数即可

import { useState, useEffect } from "react";

function useRequest<T = any>(fetchFn: () => Promise<any>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFn()
      .then(res => {
        if (!cancelled) setData(res.data);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, deps);

  return { data, loading, error };
}

export default useRequest;

// 使用方法示例：
// import useRequest from "path/to/hooks/useRequest";
// import api from "path/to/api";
// const { data, loading, error } = useRequest(() => api.get("/api/users"), []);