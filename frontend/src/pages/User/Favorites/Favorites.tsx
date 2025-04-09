import Navbar from "../../../components/Navbar/Navbar"
import React,{ useEffect, useState } from "react"
import { useRecordStore } from "../../../store"
import takePlace from "../../../assets/takePlace.png"
import background1 from "../../../assets/background1.jpg"
import background2 from "../../../assets/background2.jpg"
import "./Favorites.scss"

type checkBox={[number:number]:boolean}

const Favorites: React.FC = () => {
  const { favoritesGoods, getFavoritesGoods, removeFavoriteGoods } = useRecordStore()
  const [checked, setChecked] = useState<checkBox>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    getFavoritesGoods()
  }, [])

  const handleOnClick = () => {
    setIsVisible(!isVisible)
  }

  const handleCheck = (id:number) => {
    setChecked({...checked, [id]:!checked[id]})
  }
  const handleOnDelete = () => {
    const ids = Object.keys(checked).filter(id => checked[parseInt(id)]).map(id => parseInt(id))
    ids.forEach(id => removeFavoriteGoods(id))
  }

  return (
    <div className="favorites-container">
      <div className="header">
        <Navbar title="收藏" backActive={true} backPath="/user" />
      </div>
      
      <div className="body">
        
        <div className="manage">
          <button onClick={() => handleOnClick()}>管理</button>
        </div>
        <div className="content">
          {
            favoritesGoods.map((post:any) => (
              <div className='commodity'>

                {
                  isVisible?<div className="commodity-delete" key={post.id} onClick={() => handleCheck(post.id)} style={checked[post.id] ? {backgroundColor: "#3498db",border: "none"} : {backgroundColor: "white"}} />:null
                }

                <div className='commodity-img'>
                <img src={takePlace} alt="" />
                </div>
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
            ))
          }
              <div className='commodity'>

                {
                  isVisible?<div className="commodity-delete" key={1} onClick={() => handleCheck(1)} style={checked[1] ? {backgroundColor: "#3498db",border: "none"} : {backgroundColor: "white"}} />:null
                }

                <div className='commodity-img'>
                <img src={background1} alt="" />
                </div>
                <div className="commodity-description">
                  <div className='commodity-title'>
                    c语言教材
                  </div>
                  <div className="commodity-detail">
                    有勾画，开发区校区面交
                  </div>
                  <div className='commodity-bottom'>
                    <div className='commodity-price'>
                      15r
                    </div>
                    <div className='commodity-tag'>
                      教材
                    </div>
                  </div> 
                </div>
              </div>

              <div className='commodity'>
                <div className='commodity-img'>
                <img src={background2} alt="" />
                </div>
                <div className="commodity-description">
                  <div className='commodity-title'>
                    模电教材
                  </div>
                  <div className="commodity-detail">
                    有勾画，开发区校区面交
                  </div>
                  <div className='commodity-bottom'>
                    <div className='commodity-price'>
                      5r
                    </div>
                    <div className='commodity-tag'>
                      教材
                    </div>
                  </div> 
                </div>
              </div>
        </div>
      </div>


      <div className="footer">
        {
          isVisible?        
          <div className="delete-button">
          <button onClick={()=>handleOnDelete()}>删除</button>
          </div>
          :null
        }
      </div>
    </div>
  )
}

export default Favorites;
