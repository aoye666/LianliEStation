import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Tabbar from '../../components/Tabbar/User/Tabbar'
import './Template.scss'

const Template = () => {
  return (
    <div className='container'>
      <div className='navbar'>
        <Navbar />
      </div>
       
      <div className='content'>
        <div className='title'>
          <div className='title-text'>
            标题 
          </div>
          <div className='title-input'>
            <input type='text' placeholder='标题' />
          </div>
        </div>

        <div className='sort'>
          <div className='sort-text'>
            分类
          </div>
          <div className='sort-input'>
            <input type='text' placeholder='分类' />
          </div>
        </div>

        <div className='price'>
            <div className='price-text'>
                价格区间
            </div>
            <div className='price-unit'>
                <div className='price-low'>
                    <input type="text" value='最低价格'/>
                </div>
                -
                <div className='price-high'>
                    <input type="text" value='最高价格'/>
                </div>
            </div>
        </div>

        <div className='img-upload'>
          <div className='img-upload-up'>
            <div className='img-upload-text'>
              上传图片（最多 3 张）
            </div>
            <div className='img-upload-icon'>
              <img src="/more.png" alt="" />
            </div>
          </div>
          <div className='img-upload-down'>
            <img src="/place.png" alt="" />
            <img src="/place.png" alt="" />
            <img src="/place.png" alt="" />

          </div>

        </div>

        <div className='detail'>
            <div className='detail-text'>
                商品详情
            </div>
            <div className='detail-input'>
              <input type="text" value={"商品详情"} />
            </div>
        </div>
    </div>
       <div className='Tabbar'>
        <Tabbar />
       </div>
    </div>
  )
}

export default Template
