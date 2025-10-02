import React from 'react'
import { Skeleton, Card } from 'antd'
import './Forum.scss'

const Forum = () => {
  // 生成骨架屏帖子卡片
  const generateSkeletonPosts = (count: number) => {
    return Array.from({ length: count }, (_, index) => (
      <Card key={index} className="skeleton-post-card">
        <Skeleton active title={{ width: '60%' }} paragraph={{ rows: 2 }} />
        <div className="skeleton-post-images">
          <div className="skeleton-image-item" />
          <div className="skeleton-image-item" />
          <div className="skeleton-image-item" />
        </div>
        <div className="skeleton-likes">
          <Skeleton.Avatar active size={20} shape="circle" />
          <Skeleton.Button active size="small" style={{ width: '60px', height: '20px', marginLeft: '8px' }} />
        </div>
      </Card>
    ))
  }

  return (
    <div className='loading-forum-container'>
      {/* 顶部导航栏骨架 */}
      <div className="loading-navbar">
        <Skeleton.Button active size="small" style={{ width: '30px', height: '30px' }} />
        <Skeleton.Input active size="small" style={{ width: '100px', height: '30px' }} />
        <Skeleton.Button active size="small" style={{ width: '30px', height: '30px' }} />
      </div>

      {/* Tabs 骨架 */}
      <div className="loading-tabs">
        <Skeleton.Button active size="small" style={{ width: '60px', height: '30px', marginRight: '20px' }} />
        <Skeleton.Button active size="small" style={{ width: '60px', height: '30px' }} />
      </div>

      {/* 帖子列表骨架 */}
      <div className="loading-posts">
        {generateSkeletonPosts(6)}
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

export default Forum
