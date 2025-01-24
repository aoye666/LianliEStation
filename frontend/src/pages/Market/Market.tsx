import React from 'react'
import "./Market.scss"
import Navbar from '../../components/Navbar/Navbar'
import Tabbar from '../../components/Tabbar/Tabbar'

const Market = () => {
  return (
    <div>
      <Navbar />
       {/* 中间写页面内容 */}
      <Tabbar />
    </div>
  )
}

export default Market
