import React, { useState, useEffect } from'react';
import './ForumDetail.scss'
import Navbar from '../../../components/Navbar/Navbar';

const ForumDetail = () => {
    return (
        <div className='forum-detail'>

            <div className='navbar'>
                <Navbar title='详情' backActive={true} backPath='/forum-test'/>
            </div>
            <h1>ForumDetail</h1>
        </div>
    )
}

export default ForumDetail;