import Navbar from "../../components/Navbar/Navbar"
import Tabbar from "../../components/Tabbar/Tabbar"
import { use, useEffect, useState } from "react"
import { useFavoriteStore } from "../../store"
import takePlace from "../../assets/takePlace.png"

const History = () => {
  const posts=useFavoriteStore((state) => state.posts)
  const getPosts=useFavoriteStore((state) => state.getPosts)

  // useEffect(() => {
  //   getPosts()
  // }, [])


  return (

    <div className="history-container">
      <div className="header">
        <Navbar title="历史" />
      </div>

      <div className="content">
        {
          posts.map((post) => (
            <div className='commodity'>
            <div className='commodity-img'>
            <img src={post.images[0]?`http://localhost:5000${post.images[0]}`:takePlace} alt="" />
            </div>
            <div className='commodity-title'>
              {post.title}
            </div>
            <div className='commodity-bottom'>
              <div className='commodity-price'>
                {post.price}
              </div>
              <div className='commodity-tag'>
                {post.tag}
              </div>
            </div>      
            </div>
          ))
        }
      </div>

      <div className="footer">
        <Tabbar />
      </div>

    </div>
  )
}

export default History
