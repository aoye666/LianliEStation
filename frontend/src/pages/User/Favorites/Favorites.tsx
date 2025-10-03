import Navbar from "../../../components/Navbar/Navbar"
import React,{ useEffect, useState } from "react"
import { useRecordStore } from "../../../store"
import { Select,Card,Button } from "antd"
import type { TabsProps } from "antd/lib/tabs"
import takePlace from "../../../assets/takePlace.png"
import background1 from "../../../assets/background1.jpg"
import background2 from "../../../assets/background2.jpg"
import NoticeLogin from "../../../components/NoticeLogin/NoticeLogin"
import { useUserStore } from "../../../store"
import "./Favorites.scss"

type checkBox={[number:number]:boolean}

const Favorites: React.FC = () => {
  const { favoritesGoods,favoritePosts, getFavorites, removeFavoriteGoods,removeFavoritePost } = useRecordStore()
  const { isAuthenticated } = useUserStore()
  const [checked, setChecked] = useState<checkBox>({})
  const [isVisible, setIsVisible] = useState(false)
  const [isPosts, setIsPosts] = useState(false)

  useEffect(() => {
    getFavorites()
    console.log(favoritesGoods,favoritePosts)
  }, [])

  const items = [
    {
      value: 'goods',
      label: '商品',
    },
    {
      value: 'posts',
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
      {!isAuthenticated && <NoticeLogin />}
      <div className="header">
        <Navbar title="收藏" backActive={true} backPath="/user" />
      </div>
      
      <div className="body">
        <div className="select-container">
          <Select className="select" defaultValue={"goods"} options={items} onChange={(key) => {setIsPosts(key === "posts")}} />
          <Button onClick={() => handleOnClick()} className="button">管理</Button>
        </div>
        
        <div className="content">
          {
            !isPosts && (
            favoritesGoods.map((post:any) => (
              <div className='goods' key={post.id}>

                {
                  isVisible?<div className="goods-delete" key={post.id} onClick={() => handleCheck(post.id)} style={checked[post.id] ? {backgroundColor: "#3498db",border: "none"} : {backgroundColor: "white"}} />:null
                }

                {/* <div className='goods-img'>
                <img src={
                  post.images[0]
                  ? `${
                      process.env.REACT_APP_API_URL ||
                      "http://localhost:5000"
                    }${post.images[0]}`
                  : takePlace
                } alt="" />
                </div> */}
                <Card className="goods-description" title={post.title} hoverable>
                  <div className="goods-detail">
                    {post.content}
                  </div>
                  <div className='goods-bottom'>
                    <div className='goods-price'>
                      {post.price}r
                    </div>
                    <div className='goods-tag'>
                      {post.tag}
                    </div>
                  </div> 
                </Card>
              </div>
            )))
          }
          {
            isPosts && (
            favoritePosts.map((post:any, index:number) => (
              <div className='goods' key={index}>

                {
                  isVisible?<div className="goods-delete" key={post.id} onClick={() => handleCheck(post.id)} style={checked[post.id] ? {backgroundColor: "#3498db",border: "none"} : {backgroundColor: "white"}} />:null
                }

                <Card className="goods-description" title={post.title} hoverable>
                  <div className="goods-detail">
                    {post.content}
                  </div>
                </Card>
              </div>
            )))
          }

        </div>
      </div>


      <div className="footer">
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
