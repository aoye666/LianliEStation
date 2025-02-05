import React from 'react'
import './Template.scss'
import Tabbar from '../../components/Tabbar/Tabbar'
import add from '../../assets/more.png'
import takePlace from '../../assets/takePlace.png'
import logo from '../../assets/logo.png'
import { useState,useEffect,useReducer } from 'react'
import { usePostStore } from 'store'

const initialState = {
  selectedPostType: '买/卖',
  lowPrice: 0,
  highPrice: 10000,
  tag: '商品类型',
  content: '',
  title: '',
  selectedImages: [] as File[],
  error: null as string | null,
  campus_id: 1,
  campus_name: '校区选择',
  user_id: 1,
}

type Action=
  | { type: 'SET_SELECTED_POST_TYPE', payload: string }
  | { type: 'SET_LOW_PRICE', payload: number }
  | { type: 'SET_HIGH_PRICE', payload: number }
  | { type: 'SET_TAG', payload: string }
  | { type: 'SET_CONTENT', payload: string }
  | { type: 'SET_TITLE', payload: string }
  | { type: 'SET_SELECTED_IMAGES', payload: File[] }
  | { type: 'SET_ERROR', payload: string | null }
  | { type: 'SET_CAMPUS_ID', payload: number }
  | { type: 'SET_CAMPUS_NAME', payload: string }
  | { type: 'SET_USER_ID', payload: number }

const reducer = (state: typeof initialState, action: Action) => {
  switch (action.type) {
    case 'SET_SELECTED_POST_TYPE':
      return {
       ...state,
        selectedPostType: action.payload,
      }
    case 'SET_LOW_PRICE':
      return {
       ...state,
        lowPrice: action.payload,
      }
    case 'SET_HIGH_PRICE':
      return {
       ...state,
        highPrice: action.payload,
      }
    case 'SET_TAG':
      return {
       ...state,
        tag: action.payload,
      }
    case 'SET_CONTENT':
      return {
       ...state,
        content: action.payload,
      }
    case 'SET_TITLE':
      return {
       ...state,
        title: action.payload,
      }
    case 'SET_SELECTED_IMAGES':
      return {
       ...state,
        selectedImages: action.payload,
      }
    case 'SET_ERROR':
      return {
       ...state,
        error: action.payload,
      }
    case 'SET_CAMPUS_ID':
      return {
       ...state,
        campus_id: action.payload,
      }
    case 'SET_CAMPUS_NAME':
      return {
       ...state,
        campus_name: action.payload,
      }
    case 'SET_USER_ID':
      return {
       ...state,
        user_id: action.payload,
      }
    default:
      return state
  }
}


const Template = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const updatePostType = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    dispatch({ type: 'SET_SELECTED_POST_TYPE', payload: e.currentTarget.innerText })
  }
  const setLowPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_LOW_PRICE', payload: e.target.valueAsNumber })
  }
  const setHighPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_HIGH_PRICE', payload: e.target.valueAsNumber })
  }
  const setTag = (e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    dispatch({ type: 'SET_TAG', payload: e.currentTarget.innerText })
  }
  const setContent = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_CONTENT', payload: e.target.value })
  }
  const setTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_TITLE', payload: e.target.value })
  }
  const setSelectedImages = (value: File[]) => {
    dispatch({ type: 'SET_SELECTED_IMAGES', payload: value })
  }
  const setError = (value: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: value })
  }
  const setCampusId = (value: number) => {
    dispatch({ type: 'SET_CAMPUS_ID', payload: value })
  }
  const setCampusName = (value: string) => {
    dispatch({ type: 'SET_CAMPUS_NAME', payload: value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 3) {
      setError('最多上传3张图片')
      return
    }
    setSelectedImages(files)
    setError(null)
  }

  const handleCampusChange = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setCampusId(parseInt(e.currentTarget.id))
    setCampusName(e.currentTarget.innerText)
  }

  const handlePublish = async () => {

  }



  const {
    selectedPostType,
    lowPrice,
    highPrice,
    tag,
    content,
    title,
    selectedImages,
    error,
    campus_id,
    campus_name,
  } = state



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
            <input type='text' placeholder='标题' onChange={(e)=>setTitle(e)}/>
          </div>
        </div>

        <div className='sort'>
          <label htmlFor="sort-input">分类</label>
          <div className='sort-input'>
          <div className="dropdown">
            <div className='dropdown-sellOrBuy'>
              <button className="dropdown-button">{`${selectedPostType}`}</button>
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={(e) => updatePostType(e)}>买</div>
                <div className="dropdown-item" onClick={(e) => updatePostType(e)}>卖</div>
              </div>
            </div>
            <div className='dropdown-category'>
              <button className="dropdown-button">{`${tag}`}</button>
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={(e) => setTag(e)}>跑腿</div>
                  <div className="dropdown-item" onClick={(e) => setTag(e)}>数码</div>
                </div>
            </div>
            <div className='dropdown-campus'>
              <button className="dropdown-button">{`${campus_name}`}</button>
                <div className="dropdown-menu">
                  <div className="dropdown-item" id="1" onClick={(e) => handleCampusChange(e)}>凌水校区</div>
                  <div className="dropdown-item" id="2" onClick={(e) => handleCampusChange(e)}>开发区校区</div>
                  <div className="dropdown-item" id="3" onClick={(e) => handleCampusChange(e)}>盘锦校区</div>
                </div>
            </div>
            
          </div>
          </div>
        </div>

        <div className='price'>
            <label htmlFor="price-unit">价格</label>
            <div className='price-unit'>
                <div className='price-low'>
                    <input type="number" placeholder='最低价格' onChange={(e) =>setLowPrice(e) }/>
                </div>
                -
                <div className='price-high'>
                    <input type="number" placeholder='最高价格' onChange={(e) =>setHighPrice(e) }/>
                </div>
            </div>
        </div>

        <div className='img-upload'>
          <div className='img-upload-up'>
            <label htmlFor="img-upload-icon">
              上传图片
            </label>
            <div className='img-upload-icon'>
              <input type="file" accept="image/*" id='upload-icon' multiple onChange={(e) => handleImageChange(e)}/>
              <img src={add} alt="add" onClick={()=>(document.getElementById('upload-icon') as HTMLInputElement)?.click()}/>
            </div>
          </div>
          <div className='img-upload-down'>
            {error? 
              <div className='error'>{error}</div> 
              : 
              <div>
                <img src={selectedImages[0] ? URL.createObjectURL(selectedImages[0]) : takePlace} alt="takePlace" />
                <img src={selectedImages[1] ? URL.createObjectURL(selectedImages[1]) : takePlace} alt="takePlace" />
                <img src={selectedImages[2] ? URL.createObjectURL(selectedImages[2]) : takePlace} alt="takePlace" />
              </div>

              }
            

          </div>

        </div>

        <div className='detail'>
            <label htmlFor="detail-input">
                商品详情
            </label>
            <div className='detail-input'>
              <input type="text" placeholder={"商品详情"} onChange={(e)=>setContent(e)} />
            </div>
        </div>
    </div>

    <div className='submit'>
      <button onClick={() => handlePublish()}>发布</button>
    </div>
       <div className='tabbar'>
        <Tabbar />
       </div>
    </div>
  )
}

export default Template
