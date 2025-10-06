import React from 'react'
import './ForumPublish.scss'
import { useEffect, useReducer } from 'react'
import { useUserStore } from '../../../store'
import useMainStore from '../../../store/mainStore'
import { useLocation } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import Navbar from '../../../components/Navbar/Navbar'
import { Dropdown, Button, message } from 'antd'
import type { MenuProps } from 'antd'

const initialState = {
  id: 1,
  title: '',
  content: '',
  author_id: null as number | null,
  create_at: '',
  status: "active",
  campus_id: 1,
  tag: '帖子分类',
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


const ForumPublish = () => {
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
  const publishForumPost = useMainStore(state => state.publishForumPost)
  const navigate = useNavigate()

  useEffect(() => {
    setCreateAt(new Date().toISOString())
    setCampusId(currentUser?.campus_id || 1)
    initialPostType(templateData?.post_type || 'receive')
    initialTag(templateData?.tag || '帖子标签')
    initialContent(templateData?.details || '')
    initialTitle(templateData?.title || '')
  }, [currentUser?.campus_id, templateData?.post_type, templateData?.tag, templateData?.details, templateData?.title])

  // 帖子标签下拉菜单配置
  const tagItems: MenuProps['items'] = [
    {
      key: '新闻通知',
      label: '新闻通知',
      onClick: () => dispatch({ type: 'SET_TAG', payload: '新闻通知' })
    },
    {
      key: '吐槽倾诉',
      label: '吐槽倾诉',
      onClick: () => dispatch({ type: 'SET_TAG', payload: '吐槽倾诉' })
    },
    {
      key: '学习资料',
      label: '学习资料',
      onClick: () => dispatch({ type: 'SET_TAG', payload: '学习资料' })
    },
    {
      key: '咨询答疑',
      label: '咨询答疑',
      onClick: () => dispatch({ type: 'SET_TAG', payload: '咨询答疑' })
    },
    {
      key: '交友组队',
      label: '交友组队',
      onClick: () => dispatch({ type: 'SET_TAG', payload: '交友组队' })
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
    content,
    title,
    tag,
    images,
    previewImages,
    campus_id,
    campus_name,
  } = state

  // 原生文件上传处理
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
    // 验证所有必填字段
    if (!title.trim()) {
      message.warning('请输入帖子标题');
      return;
    }
    
    if (tag === '帖子分类' || tag === '帖子标签') {
      message.warning('请选择帖子标签');
      return;
    }
    
    if (campus_name === '校区选择') {
      message.warning('请选择校区');
      return;
    }

    try {
      const success = await publishForumPost(
        title,
        content,
        campus_id,
        tag,
        images
      );

      if (success) {
        console.log('发布成功');
        navigate('/forum');
      }
    } catch (error) {
      console.error('发布失败:', error);
    }
  }

  return (
    <div className='template-container'>
      <div className='navbar'>
        <Navbar backActive={true} backPath='/forum' title='帖子发布' />
      </div>

      <div className='content'>
        <div className='title'>
          <label htmlFor="title-input">标题</label>
          <div className='title-input'>
            <div className="input-wrapper">
              <input
                id="title-input"
                type="text"
                placeholder='请输入帖子标题'
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
              <Dropdown menu={{ items: tagItems }} placement="bottom" arrow>
                <Button className="ant-btn dropdown-button dropdown-category">
                  {tag}
                </Button>
              </Dropdown>
              <Dropdown menu={{ items: campusItems }} placement="bottom" arrow>
                <Button className="ant-btn dropdown-button dropdown-campus">
                  {campus_name}
                </Button>
              </Dropdown>
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
                    className="remove-btn"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {/* 上传按钮 */}
            {images.length < 3 && (
              <div className="upload-item upload-button">
                <label htmlFor="file-input" className="upload-label">
                  <div className="upload-content">
                    <span className="plus-icon">+</span>
                    <span className="upload-text">上传</span>
                  </div>
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        </div>

        <div className='detail'>
          <label htmlFor="detail-input">
            内容详情
          </label>
          <div className='detail-input'>
            <div className="textarea-wrapper">
              <textarea
                id="detail-input"
                placeholder="请输入帖子详情"
                value={content}
                onChange={setContent}
                maxLength={500}
                className="native-textarea"
                style={{ height: '180px' }}
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

export default ForumPublish
