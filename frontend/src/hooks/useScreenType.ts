// 用于监听屏幕尺寸并判断当前是移动端还是Web端

import { useState, useEffect } from "react";

function useScreenType(breakpoint: number = 768) {
  // breakpoint: 小于此宽度视为移动端
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    window.addEventListener("resize", handleResize);
    // 初始化
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default useScreenType;