import React from 'react'
import './Template.scss'

import { useEffect, useReducer } from 'react'
import { useUserStore } from '../../../../store'
import useMainStore from '../../../../store/mainStore'
import { useLocation } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import Navbar from '../../../../components/Navbar/Navbar'
import { Dropdown, Button, message } from 'antd'
import type { MenuProps } from 'antd'

const initialState = {
  id: 1,
  title: '',
  content: '',
  author_id: null as number | null,
  create_at: '',
  status: "active",
  price: null as number | null,
  campus_id: 1,
  post_type: '买/卖',
  tag: '商品类型',
  images: [] as File[],
  previewImages: [] as string[],
  error: null as string | null,
  campus_name: '校区选择',
  likes: 0,
  complaints: 0,
}

type Action =
  | { type: 'SET_POST_TYPE', payload: string }
  | { type: 'SET_TAG', payload: string }
  | { type: 'SET_CONTENT', payload: string }
  | { type: 'SET_TITLE', payload: string }
  | { type: 'SET_IMAGES', payload: File[] }
  | { type: 'SET_PREVIEW_IMAGES', payload: string[] }
  | { type: 'SET_ERROR', payload: string | null }
  | { type: 'SET_CAMPUS_ID', payload: number }
  | { type: 'SET_CAMPUS_NAME', payload: string }
  | { type: 'SET_AUTHOR_ID', payload: number | null }
  | { type: 'SET_CREATE_AT', payload: string }
  | { type: 'SET_PRICE', payload: number | null }
  | { type: 'SET_ID', payload: number }

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
        post_type: action.payload,
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
        images: action.payload,
      }
    case 'SET_PREVIEW_IMAGES':
      return {
        ...state,
        previewImages: action.payload,
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
    case 'SET_AUTHOR_ID':
      return {
        ...state,
        author_id: action.payload,
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
  const setPrice = (value: number | null) => {
    dispatch({ type: 'SET_PRICE', payload: value })
  }
  const setContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'SET_CONTENT', payload: e.target.value })
  }
  const setTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_TITLE', payload: e.target.value })
  }

  const setCampusId = (value: number) => {
    dispatch({ type: 'SET_CAMPUS_ID', payload: value })
    dispatch({ type: 'SET_CAMPUS_NAME', payload: document.getElementById(value.toString())?.innerText ?? '校区选择' })
  }
  const setCampusName = (value: string) => {
    dispatch({ type: 'SET_CAMPUS_NAME', payload: value })
  }
  const setCreateAt = (value: string) => {
    dispatch({ type: 'SET_CREATE_AT', payload: value })
  }

  const currentUser = useUserStore(state => state.currentUser)
  const publishMarketGoods = useMainStore(state => state.publishMarketGoods)
  const navigate = useNavigate()

  useEffect(() => {
    setCreateAt(new Date().toISOString())
    setCampusId(currentUser?.campus_id || 1)
    initialPostType(templateData?.post_type || 'receive')
    initialTag(templateData?.tag || '商品标签')
    initialContent(templateData?.details || '')
    initialTitle(templateData?.title || '')
    initialPrice(templateData?.price || 0)
  }, [currentUser?.campus_id, templateData?.post_type, templateData?.tag, templateData?.details, templateData?.title, templateData?.price])

  // 商品类型下拉菜单配置
  const postTypeItems: MenuProps['items'] = [
    {
      key: 'receive',
      label: '收',
      onClick: () => dispatch({ type: 'SET_POST_TYPE', payload: 'receive' })
    },
    {
      key: 'sell',
      label: '出',
      onClick: () => dispatch({ type: 'SET_POST_TYPE', payload: 'sell' })
    }
  ];

  // 商品标签下拉菜单配置
  const categoryItems: MenuProps['items'] = [
    {
      key: '学习资料',
      label: '学习资料',
      onClick: () => dispatch({ type: 'SET_TAG', payload: '学习资料' })
    },
    {
      key: '生活用品',
      label: '生活用品',
      onClick: () => dispatch({ type: 'SET_TAG', payload: '生活用品' })
    },
    {
      key: '代办跑腿',
      label: '代办跑腿',
      onClick: () => dispatch({ type: 'SET_TAG', payload: '代办跑腿' })
    },
    {
      key: '咨询答疑',
      label: '咨询答疑',
      onClick: () => dispatch({ type: 'SET_TAG', payload: '咨询答疑' })
    },
    {
      key: '账号会员',
      label: '账号会员',
      onClick: () => dispatch({ type: 'SET_TAG', payload: '账号会员' })
    },
    {
      key: '数码电子',
      label: '数码电子',
      onClick: () => dispatch({ type: 'SET_TAG', payload: '数码电子' })
    },
    {
      key: '其他',
      label: '其他',
      onClick: () => dispatch({ type: 'SET_TAG', payload: '其他' })
    }
  ];

  // 校区下拉菜单配置
  const campusItems: MenuProps['items'] = [
    {
      key: '1',
      label: '凌水校区',
      onClick: () => {
        setCampusId(1);
        setCampusName('凌水校区');
      }
    },
    {
      key: '2',
      label: '开发区校区',
      onClick: () => {
        setCampusId(2);
        setCampusName('开发区校区');
      }
    },
    {
      key: '3',
      label: '盘锦校区',
      onClick: () => {
        setCampusId(3);
        setCampusName('盘锦校区');
      }
    }
  ];

  const {
    post_type,
    tag,
    content,
    title,
    images,
    previewImages,
    campus_id,
    campus_name,
    price,
  } = state

  // 文件上传处理
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // 限制最多3张图片
    const validFiles = files.slice(0, 3 - images.length).filter(file => {
      if (file.type.startsWith('image/')) {
        return true;
      } else {
        message.error(`${file.name} 不是有效的图片文件`);
        return false;
      }
    });

    if (validFiles.length > 0) {
      const newImages = [...images, ...validFiles];
      dispatch({ type: 'SET_IMAGES', payload: newImages });
      
      // 生成预览图片URL
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      const allPreviewUrls = [...previewImages, ...newPreviewUrls];
      dispatch({ type: 'SET_PREVIEW_IMAGES', payload: allPreviewUrls });
    }
  };

  // 删除图片
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    dispatch({ type: 'SET_IMAGES', payload: newImages });
    
    // 清理预览URL
    URL.revokeObjectURL(previewImages[index]);
    const newPreviewUrls = previewImages.filter((_, i) => i !== index);
    dispatch({ type: 'SET_PREVIEW_IMAGES', payload: newPreviewUrls });
  };

  const handlePublish = async () => {
    try {
      const success = await publishMarketGoods(
        title,
        campus_id,
        post_type,
        content,
        price ?? undefined,
        tag,
        images
      );
      
      if (success) {
        console.log('发布成功');
        navigate('/market');
      }
    } catch (error) {
      console.error('发布失败:', error);
    }
  }

  return (
    <div className='template-container'>
      <div className='navbar'>
        <Navbar backActive={true} backPath='/publish/market-publish-choice' title='商品发布模板' />
      </div>

      <div className='content'>
        <div className='title'>
          <label htmlFor="title-input">标题</label>
          <div className='title-input'>
            <div className="input-wrapper">
              <input 
                id="title-input"
                type="text"
                placeholder='请输入商品标题' 
                value={title} 
                onChange={setTitle}
                maxLength={50}
                className="native-input"
              />
            </div>
          </div>
        </div>

        <div className='sort'>
          <label htmlFor="sort-input">分类（请选择合适的分类）</label>
          <div className='sort-input'>
            <div className="antd-dropdown-container">
              <Dropdown menu={{ items: postTypeItems }} placement="bottomLeft">
                <Button className="dropdown-button dropdown-goodstype">{post_type === 'receive' ? '收' : '出'}</Button>
              </Dropdown>
              <Dropdown menu={{ items: categoryItems }} placement="bottomLeft">
                <Button className="dropdown-button dropdown-category">{tag}</Button>
              </Dropdown>
              <Dropdown menu={{ items: campusItems }} placement="bottomLeft">
                <Button className="dropdown-button dropdown-campus">{campus_name}</Button>
              </Dropdown>
            </div>
          </div>
        </div>

        <div className='price'>
          <label htmlFor="price">价格</label>
          <div className='price-num'>
            <div className="input-number-wrapper">
              <input 
                id="price"
                type="number"
                placeholder='商品价格'
                value={price ?? ''}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : null)}
                min={0}
                max={999999}
                step={0.01}
                className="native-input-number"
              />
              <div className="input-addon">元</div>
            </div>
          </div>
        </div>

        <div className='img-upload'>
          <div className='img-upload-label'>
            上传图片（最多3张）
          </div>
          <div className={`template-upload ${images.length >= 3 ? 'upload-max-reached' : ''}`}>
            {/* 已上传图片预览 */}
            {previewImages.map((url, index) => (
              <div key={index} className="upload-item uploaded">
                <img src={url} alt={`preview-${index}`} />
                <div className="upload-actions">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            
            {/* 上传按钮 */}
            {images.length < 3 && (
              <div className="upload-item upload-button">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="upload-label">
                  <div className="upload-content">
                    <span className="plus-icon">+</span>
                    <div className="upload-text">上传图片</div>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className='detail'>
          <label htmlFor="detail-input">
            商品详情
          </label>
          <div className='detail-input'>
            <div className="textarea-wrapper">
              <textarea
                id="detail-input"
                placeholder="请详细描述商品信息、规格、使用状况等"
                value={content}
                onChange={setContent}
                maxLength={500}
                rows={4}
                className="native-textarea"
                style={{ height: '130px' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='submit'>
        <button onClick={() => handlePublish()}>发布</button>
      </div>
    </div>
  )
}

export default Template
