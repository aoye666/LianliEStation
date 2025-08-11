import React, { useState, useEffect } from'react';
import './ForumDetail.scss'
import Navbar from '../../../components/Navbar/Navbar';
import { useMainStore,useUserStore } from '../../../store';
import { useLocation } from 'react-router-dom';

const ForumDetail = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const forumId = params.get('id');
    const user = useUserStore(state => state.userData)
    const forum = useMainStore(state => state.forums.find((forum)=> forum.id == (forumId?parseInt(forumId):null)))

    return (
        <div className='forum-detail'>

            <div className='navbar'>
                <Navbar title='详情' backActive={true} backPath='/forum'/>
            </div>

            <div className='content'>
                <div className="title">
                    {forum?.title}
                </div>

                <div className="detail">
                    <div className="text">
                        {forum?.content}
                    </div>

                    <div className="img">
                        {
                            forum?.images.map((img, index) => (
                                <img key={index} src={`${process.env.REACT_APP_API_URL||"http://localhost:5000"}/uploads/${img[index]}`} alt={`${img[index]}`} />
                            ))
                        }
                    </div>
                </div>

                <div className="function">
                    <div className="like">
                        <div className="icon">

                        </div>
                    </div>

                    <div className="delete">
                        <div className="icon">

                        </div>
                    </div>
                </div>

                <div className="comment">

                </div>
            </div>
        </div>
    )
}

export default ForumDetail;