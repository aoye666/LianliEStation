import React, { useMemo, useState, useEffect } from 'react'
import { Skeleton } from 'antd'
import './Market.scss'

const Market = () => {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // 监听窗口尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 与真实 Market 页面相同的列数计算逻辑
  const elementsPerRow = useMemo(() => {
    const containerWidth = windowSize.width - 12; // 减去左右padding
    let columns;
    if (containerWidth < 400) {
      columns = 2;
    } else if (containerWidth < 600) {
      columns = 3;
    } else if (containerWidth < 800) {
      columns = 4;
    } else {
      columns = Math.floor((containerWidth + 6) / 146);
    }
    return Math.max(2, Math.min(columns, 6));
  }, [windowSize.width]);

  // 计算每个商品项的具体宽度（像素值）
  const itemWidth = useMemo(() => {
    const containerWidth = windowSize.width - 12; // 减去左右padding 6px + 6px
    const gap = 6; // 商品项之间的间距
    const availableWidth = containerWidth - (elementsPerRow - 1) * gap;
    return Math.floor(availableWidth / elementsPerRow);
  }, [windowSize.width, elementsPerRow]);

  // 计算图片的高度（根据 aspect-ratio 1.3）
  const imageHeight = useMemo(() => {
    return Math.floor(itemWidth / 1.3);
  }, [itemWidth]);

  // 生成骨架屏商品项
  const generateSkeletonItems = (count: number) => {
    return Array.from({ length: count }, (_, index) => (
      <div key={index} className="skeleton-commodity-item">
        {/* 图片骨架屏 - 使用具体的像素值 */}
        <Skeleton.Input
          active 
          style={{ 
            width: `${itemWidth}px`,
            height: `${imageHeight}px`,
            marginBottom: '8px',
            display: 'block'
          }} 
        />
        
        {/* 标题骨架屏 - 高度 20px 与真实标题一致 */}
        <Skeleton 
          active 
          paragraph={{ rows: 1 }} 
          title={false}
          style={{ marginTop: '0px', marginBottom: '4px' }} 
        />
        
        {/* 底部：价格和标签骨架屏 */}
        <div className="skeleton-bottom">
          <Skeleton.Button active size="small" style={{ width: '60px', height: '20px' }} />
          <Skeleton.Button active size="small" style={{ width: '50px', height: '20px' }} />
        </div>
      </div>
    ))
  }

  return (
    <div className='loading-market-container'>
      {/* 顶部导航栏骨架 */}
      <div className="loading-navbar">
        <Skeleton.Avatar active size={35} shape="circle" />
        <Skeleton.Input active size="small" style={{ width: '60vw', height: '26px', borderRadius: '10px' }} />
        <Skeleton.Avatar active size={30} shape="circle" />
      </div>

      {/* Banner 骨架 */}
      <div className="loading-banner">
        <div className="skeleton-banner" />
      </div>

      {/* 标签筛选骨架 */}
      <div className="loading-tag">
        <div className="tag-buttons">
          <Skeleton.Button active size="small" style={{ width: '40px', height: '25px', marginRight: '10px' }} />
          <Skeleton.Button active size="small" style={{ width: '40px', height: '25px', marginRight: '10px' }} />
          <Skeleton.Button active size="small" style={{ width: '50px', height: '25px', marginRight: '10px' }} />
          <Skeleton.Button active size="small" style={{ width: '40px', height: '25px', marginRight: '10px' }} />
          <Skeleton.Button active size="small" style={{ width: '40px', height: '25px', marginRight: '10px' }} />
          <Skeleton.Button active size="small" style={{ width: '50px', height: '25px' }} />
        </div>
      </div>

      {/* 商品列表骨架 */}
      <div className="loading-list">
        {generateSkeletonItems(8)}
      </div>

      {/* 底部 Tabbar 骨架 */}
      <div className="loading-tabbar">
        <Skeleton.Avatar active size={40} shape="circle" />
        <Skeleton.Avatar active size={40} shape="circle" />
        <Skeleton.Avatar active size={40} shape="circle" />
      </div>
    </div>
  )
}

export default Market
