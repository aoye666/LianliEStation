import React from 'react'
import "./Campus.scss"

const Campus = () => {

  const handleClick = ()=> {

  }
  
  return (
    <div className='campus-container'>
        <div className='campus-btn' onClick={handleClick}>主校区</div>
        <div className='campus-btn' onClick={handleClick}>开发区校区</div>
        <div className='campus-btn' onClick={handleClick}>盘锦校区</div>
    </div>
  )
}

export default Campus
