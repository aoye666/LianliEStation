import React, { use } from 'react'
import './Template.scss'
import Tabbar from '../../components/Tabbar/Tabbar'
import add from '../../assets/more.png'
import takePlace from '../../assets/takePlace.png'
import logo from '../../assets/logo.png'
import { useState,useEffect,useReducer } from 'react'
import { useUserStore, usePostStore,useAuthStore } from '../../store'
import axios from 'axios'
import { useLocation } from 'react-router-dom'

const initialState = {
  id:1,
  title: '',
  content: '',
  auther_id: null as number | null,
  create_at: '',
  status:"active",
  price: 0,
  campus_id: 1,
  post_type: '买/卖',
  tag: '商品类型',
  images: [] as File[],
  error: null as string | null,
  campus_name: '校区选择',
}

type Action=
  | { type: 'SET_POST_TYPE', payload: string }
  | { type: 'SET_TAG', payload: string }
  | { type: 'SET_CONTENT', payload: string }
  | { type: 'SET_TITLE', payload: string }
  | { type: 'SET_IMAGES', payload: File[] }
  | { type: 'SET_ERROR', payload: string | null }
  | { type: 'SET_CAMPUS_ID', payload: number }
  | { type: 'SET_CAMPUS_NAME', payload: string }
  | { type: 'SET_AUTHER_ID', payload: number | null }
  | { type: 'SET_CREATE_AT', payload: string }
  | { type: 'SET_PRICE', payload: number }
  | { type: 'SET_ID', payload: number}

const reducer = (state: typeof initialState, action: Action) => {
  switch (action.type) {
    case 'SET_ID':
      return {
       ...state,
        id: action.payload,
      }
    case 'SET_POST_TYPE':
      return {
       ...state,
        selectedPostType: action.payload,
      }
    case 'SET_PRICE':
      return {
       ...state,
        price: action.payload,
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
    case 'SET_IMAGES':
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
    case 'SET_AUTHER_ID':
      return {
        ...state,
        auther_id: action.payload,
      }
    case 'SET_CREATE_AT':
      return {
       ...state,
        create_at: action.payload,
      }
    default:
      return state
  }
}


const Template = () => {
  const location = useLocation()
  const templateData = location.state as any
  const [state, dispatch] = useReducer(reducer, initialState)

  const initialPostType = (value: string) => {
    dispatch({ type: 'SET_POST_TYPE', payload: value })
  }
  const initialTag = (value: string) => {
    dispatch({ type: 'SET_TAG', payload: value })
  }
  const initialContent = (value: string) => {
    dispatch({ type: 'SET_CONTENT', payload: value })
  }
  const initialTitle = (value: string) => {
    dispatch({ type: 'SET_TITLE', payload: value })
  }
  const initialPrice = (value: number) => {
    dispatch({ type: 'SET_PRICE', payload: value })
  }
  const setPostType = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    dispatch({ type: 'SET_POST_TYPE', payload: e.currentTarget.innerText })
  }
  const setPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_PRICE', payload: e.target.valueAsNumber })
  }
  const setTag = (e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    dispatch({ type: 'SET_TAG', payload: e.currentTarget.innerText })
  }
  const setContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'SET_CONTENT', payload: e.target.value })
  }
  const setTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_TITLE', payload: e.target.value })
  }
  const setSelectedImages = (value: File[]) => {
    dispatch({ type: 'SET_IMAGES', payload: value })
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
  const setAuthorId = (value: number | null) => {
    dispatch({ type: 'SET_AUTHER_ID', payload: value })
  }
  const setCreateAt = (value: string) => {
    dispatch({ type: 'SET_CREATE_AT', payload: value })
  }
  const setId= (value: number) => {
    dispatch({ type: 'SET_ID', payload: value })
  }

  const currentUser = useUserStore(state => state.currentUser)
  const token = useAuthStore(state => state.token)

  useEffect(() => {
    setAuthorId(currentUser?.id || null)
    setCreateAt(new Date().toISOString())
    setId(currentUser?.id || 1)
    setCampusId(currentUser?.campus_id || 0)
    initialPostType(templateData?.post_type || '买/卖')
    initialTag(templateData?.tag || '商品类型')
    initialContent(templateData?.details || '')
    initialTitle(templateData?.title || '')    
    initialPrice(templateData?.price || 0)
  },[])

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

  const {
    id,
    post_type,
    tag,
    content,
    title,
    images,
    error,
    campus_id,
    campus_name,
    auther_id,
    create_at,
    price,
  } = state

  const handlePublish = async () => {
    axios.post('http://localhost:5000/api/posts/publish', {
      "id":id,
      "title": title,
      "content": content,
      "auther_id": auther_id,
      "create_at": create_at,
      "status": "active",
      "price": price,
      "campus_id": campus_id,
      "post_type": post_type,
      "tag": tag,
      "images": images,
    },{
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(() => {
      console.log('发布成功')
  })
  .catch((error) => {
      console.log(error)
  })
}

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
              <button className="dropdown-button">{`${post_type}`}</button>
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={(e) => setPostType(e)}>买</div>
                <div className="dropdown-item" onClick={(e) => setPostType(e)}>卖</div>
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
            <label htmlFor="price">价格</label>
              <div className='price-num'>
                <input type="number" placeholder='商品价格' onChange={(e) =>setPrice(e) }/>
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
                <img src={images[0] ? URL.createObjectURL(images[0]) : takePlace} alt="takePlace" />
                <img src={images[1] ? URL.createObjectURL(images[1]) : takePlace} alt="takePlace" />
                <img src={images[2] ? URL.createObjectURL(images[2]) : takePlace} alt="takePlace" />
              </div>
              }

          </div>

        </div>

        <div className='detail'>
            <label htmlFor="detail-input">
                商品详情
            </label>
            <div className='detail-input'>
              <textarea placeholder={"商品详情"} onChange={(e)=>setContent(e)} />
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
