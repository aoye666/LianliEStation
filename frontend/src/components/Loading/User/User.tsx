import React from 'react'
import { Skeleton } from 'antd'
import './User.scss'

const User = () => {
  return (
    <div className='loading-user-container'>
      {/* 用户背景图骨架 */}
      <div className="loading-user-bg">
        <div className="skeleton-banner" />
      </div>

      {/* 用户信息骨架 */}
      <div className="loading-user-info">
        <div className="loading-user-face">
          <Skeleton.Avatar active size={80} shape="circle" />
        </div>
        <div className="loading-user-text">
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      </div>

      {/* 用户设置项骨架 */}
      <div className="loading-user-settings">
        <div className="loading-user-item">
          <Skeleton.Avatar active size={30} shape="square" />
          <Skeleton.Input active size="small" style={{ width: '100px', height: '20px', marginLeft: '15px' }} />
          <Skeleton.Avatar active size={20} shape="square" style={{ marginLeft: 'auto' }} />
        </div>
        <div className="loading-user-item">
          <Skeleton.Avatar active size={30} shape="square" />
          <Skeleton.Input active size="small" style={{ width: '100px', height: '20px', marginLeft: '15px' }} />
          <Skeleton.Avatar active size={20} shape="square" style={{ marginLeft: 'auto' }} />
        </div>
        <div className="loading-user-item">
          <Skeleton.Avatar active size={30} shape="square" />
          <Skeleton.Input active size="small" style={{ width: '100px', height: '20px', marginLeft: '15px' }} />
          <Skeleton.Avatar active size={20} shape="square" style={{ marginLeft: 'auto' }} />
        </div>
      </div>

      {/* 设置项骨架 */}
      <div className="loading-user-settings">
        <div className="loading-user-item">
          <Skeleton.Avatar active size={30} shape="square" />
          <Skeleton.Input active size="small" style={{ width: '100px', height: '20px', marginLeft: '15px' }} />
          <Skeleton.Avatar active size={20} shape="square" style={{ marginLeft: 'auto' }} />
        </div>
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

export default User
