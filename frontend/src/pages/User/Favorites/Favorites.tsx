import Navbar from "../../../components/Navbar/Navbar"
import React,{ useEffect, useState } from "react"
import { useRecordStore } from "../../../store"
import { Tabs } from "antd"
import type { TabsProps } from "antd/lib/tabs"
import takePlace from "../../../assets/takePlace.png"
import background1 from "../../../assets/background1.jpg"
import background2 from "../../../assets/background2.jpg"
import "./Favorites.scss"

type checkBox={[number:number]:boolean}

const Favorites: React.FC = () => {
  const { favoritesGoods,favoritePosts, getFavorites, removeFavoriteGoods,removeFavoritePost } = useRecordStore()
  const [checked, setChecked] = useState<checkBox>({})
  const [isVisible, setIsVisible] = useState(false)
  const [isPosts, setIsPosts] = useState(false)

  useEffect(() => {
    getFavorites()
    console.log(favoritesGoods,favoritePosts)
  }, [])

  const items: TabsProps['items'] = [
    {
      key: 'goods',
      label: '商品',
    },
    {
      key: 'posts',
      label: '帖子',
    },
  ]

  const handleOnClick = () => {
    setIsVisible(!isVisible)
  }

  const handleCheck = (id:number) => {
    setChecked({...checked, [id]:!checked[id]})
  }
const handleOnDelete = async () => {
  const ids = Object.keys(checked)
    .filter(id => checked[parseInt(id)])
    .map(id => parseInt(id))

  if(isPosts){
    await Promise.all(ids.map(id => removeFavoritePost(id)))
  } else {
    await Promise.all(ids.map(id => removeFavoriteGoods(id)))
  }

  window.location.reload()
}


  return (
    <div className="favorites-container">
      <div className="header">
        <Navbar title="收藏" backActive={true} backPath="/user" />
      </div>
      
      <div className="body">
        <div className="tabs-container">
          <Tabs className="tabs" defaultActiveKey="goods" items={items} onChange={(key) => {setIsPosts(key === "posts")}} centered />
        </div>
        
        <div className="content">
          {
            !isPosts && (
            favoritesGoods.map((post:any) => (
              <div className='commodity' key={post.id}>

                {
                  isVisible?<div className="commodity-delete" key={post.id} onClick={() => handleCheck(post.id)} style={checked[post.id] ? {backgroundColor: "#3498db",border: "none"} : {backgroundColor: "white"}} />:null
                }

                {/* <div className='commodity-img'>
                <img src={
                  post.images[0]
                  ? `${
                      process.env.REACT_APP_API_URL ||
                      "http://localhost:5000"
                    }${post.images[0]}`
                  : takePlace
                } alt="" />
                </div> */}
                <div className="commodity-description">
                  <div className='commodity-title'>
                    {post.title}
                  </div>
                  <div className="commodity-detail">
                    {post.content}
                  </div>
                  <div className='commodity-bottom'>
                    <div className='commodity-price'>
                      {post.price}r
                    </div>
                    <div className='commodity-tag'>
                      {post.tag}
                    </div>
                  </div> 
                </div>
              </div>
            )))
          }
          {
            isPosts && (
            favoritePosts.map((post:any, index:number) => (
              <div className='commodity' key={index}>

                {
                  isVisible?<div className="commodity-delete" key={post.id} onClick={() => handleCheck(post.id)} style={checked[post.id] ? {backgroundColor: "#3498db",border: "none"} : {backgroundColor: "white"}} />:null
                }

                <div className="commodity-description">
                  <div className='commodity-title'>
                    {post.title}
                  </div>
                  <div className="commodity-detail">
                    {post.content}
                  </div>
                </div>
              </div>
            )))
          }

        </div>
      </div>


      <div className="footer">
        <div className="manage-button">
          <button onClick={() => handleOnClick()}>管理</button>
        </div>
        {isVisible ? (
          <div className="delete-button">
            <button onClick={() => handleOnDelete()}>删除</button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Favorites;
