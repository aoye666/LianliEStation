import React from 'react'
import './Tabbar.scss'
import axios from "axios"
import market from '../../assets/market.png'
import heart from '../../assets/heart.png'
import post from '../../assets/post.png'
import user from '../../assets/user.png'

const Tabbar = () => {
  return (
    <div className='tabbar-container'>
      <div className="tabbar-icon"><img src={market} alt='market'></img></div>
      <div className="tabbar-icon"><img src={heart} alt='heart'></img></div>
      <div className="tabbar-icon"><img src={post} alt='post'></img></div>
      <div className="tabbar-icon"><img src={user} alt='user'></img></div>
    </div>
  )
}

export default Tabbar
