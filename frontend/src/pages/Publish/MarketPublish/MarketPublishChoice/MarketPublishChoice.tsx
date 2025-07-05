import React from 'react'
import { useNavigate } from 'react-router-dom'
import './MarketPublishChoice.scss'
import Navbar from '../../../../components/Navbar/Navbar'

const MarketPublishChoice = () => {

  const navigate = useNavigate()
    
  return (
    <div className='market-publish-choice-container'>
      <Navbar backPath='/market' title='商品发布' backActive={true} />
      <div className="card" onClick={() => navigate('/publish/market-publish-basic')}>基本发布</div>
      <div className="card" onClick={() => navigate('/publish/market-publish-ai')}>AI发布</div>
    </div>
  )
}

export default MarketPublishChoice
