import React from 'react'
import './Template.scss'
import Tabbar from '../../components/Tabbar/Tabbar'
import add from '../../assets/more.png'
import takePlace from '../../assets/takePlace.png'
import logo from '../../assets/logo.png'

const Template = () => {
  return (
    <div className='template-container'>
      <div className='navbar'>
        <div className='logo'>
          <img src={logo} alt="logo" />          
        </div>
        <div className='text'>
          连理e站
        </div>
      </div>
       
      <div className='content'>
        <div className='title'>
          <label htmlFor="title-input">标题</label>
          <div className='title-input'>
            <input type='text' placeholder='标题' />
          </div>
        </div>

        <div className='sort'>
          <label htmlFor="sort-input">分类</label>
          <div className='sort-input'>
            <input type='text' placeholder='分类' />
          </div>
        </div>

        <div className='price'>
            <label htmlFor="price-unit">价格</label>
            <div className='price-unit'>
                <div className='price-low'>
                    <input type="text" placeholder='最低价格'/>
                </div>
                -
                <div className='price-high'>
                    <input type="text" placeholder='最高价格'/>
                </div>
            </div>
        </div>

        <div className='img-upload'>
          <div className='img-upload-up'>
            <label htmlFor="img-upload-icon">
              上传图片
            </label>
            <div className='img-upload-icon'>
              <img src={add} alt="add" />
            </div>
          </div>
          <div className='img-upload-down'>
            <img src={takePlace} alt="" />
            <img src={takePlace} alt="" />
            <img src={takePlace} alt="" />

          </div>

        </div>

        <div className='detail'>
            <label htmlFor="detail-input">
                商品详情
            </label>
            <div className='detail-input'>
              <input type="text" placeholder={"商品详情"} />
            </div>
        </div>
    </div>

    <div className='submit'>
      <button>发布</button>
    </div>
       <div className='tabbar'>
        <Tabbar />
       </div>
    </div>
  )
}

export default Template
