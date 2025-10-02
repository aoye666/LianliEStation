import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useMainStore from '../../store/mainStore';
import useUserStore from '../../store/userStore';
import LoadingMarket from '../Loading/Market/Market';
import LoadingForum from '../Loading/Forum/Forum';
import LoadingUser from '../Loading/User/User';
import './LoadingManager.scss';

interface LoadingManagerProps {
  children: React.ReactNode;
}

const LoadingManager: React.FC<LoadingManagerProps> = ({ children }) => {
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // ========== 从 Store 获取加载状态 ==========
  const isMarketLoading = useMainStore(state => state.isMarketLoading);
  const isForumLoading = useMainStore(state => state.isForumLoading);
  const isUserLoading = useUserStore(state => state.isUserLoading);
  
  const [showPageLoading, setShowPageLoading] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 延迟显示阈值(毫秒): 只有加载超过此时间才显示骨架屏,避免快速加载时的闪屏
  const LOADING_DELAY = 250;

  // ========== 判断当前路由对应的 loading 组件 ==========
  const getLoadingComponent = () => {
    const path = location.pathname;
    if (path.startsWith('/market')) return <LoadingMarket />;
    if (path.startsWith('/forum')) return <LoadingForum />;
    if (path.startsWith('/user')) return <LoadingUser />;
    return null;
  };

  // ========== 根据路由和加载状态控制骨架屏(延迟显示机制) ==========
  useEffect(() => {
    const path = location.pathname;
    let shouldShowLoading = false;

    if (path.startsWith('/market')) {
      shouldShowLoading = isMarketLoading;
    } else if (path.startsWith('/forum')) {
      shouldShowLoading = isForumLoading;
    } else if (path.startsWith('/user')) {
      shouldShowLoading = isUserLoading;
    }

    // 清除之前的定时器
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }

    if (shouldShowLoading) {
      // 延迟显示骨架屏,避免快速加载时的闪屏
      loadingTimerRef.current = setTimeout(() => {
        setShowPageLoading(true);
      }, LOADING_DELAY);
    } else {
      // 加载完成,立即隐藏骨架屏
      setShowPageLoading(false);
    }

    // 清理函数:组件卸载或依赖变化时清除定时器
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [location.pathname, isMarketLoading, isForumLoading, isUserLoading]);

  return (
    <div className="loading-manager">
      {/* 页面 Loading 蒙版 */}
      {showPageLoading && (
        <div className="page-loading-overlay">
          {getLoadingComponent()}
        </div>
      )}

      {/* 实际页面内容 */}
      <div 
        ref={contentRef}
        className={`page-content ${!showPageLoading ? 'visible' : 'hidden'}`}
      >
        {children}
      </div>
    </div>
  );
};

export default LoadingManager;
