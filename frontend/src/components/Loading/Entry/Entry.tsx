import React from 'react'
import './Entry.scss'
import { LOGO_BASE64, TITLE_BASE64 } from '../../../constants/base64Images'

const Entry = () => {
  return (
    <div className='entry-container'>
      <img className='entry-logo' src={LOGO_BASE64} alt="logo" />
      <img className='entry-title' src={TITLE_BASE64} alt="title" />
    </div>
  )
}

export default Entry
