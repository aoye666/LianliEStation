import React, { useState, useEffect } from'react';
import './ForumDetail.scss'
import Navbar from '../../../components/Navbar/Navbar';
import { useMainStore } from '../../../store';
import { useLocation } from 'react-router-dom';
import { Image,Card,Avatar, Button } from 'antd';
import dayjs from 'dayjs';
import takePlace from '../../../assets/takePlace.png';

const ForumDetail = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const forumId = params.get('id');
    const forum = useMainStore(state => state.forums.find((forum)=> forum.id == (forumId?parseInt(forumId):null)))
    const {Meta} = Card;
    const [openReplies, setOpenReplies] = useState<number | null>(null);

    return (
        <div className='forum-detail'>

            <div className='navbar'>
                <Navbar title='详情' backActive={true} backPath='/forum'/>
            </div>

            <div className='content'>
                <div className="img">
                    <Image.PreviewGroup>
                        <Image preview={{ visible: true, }} src={takePlace} style={{ height: '320px' }}  />
                    {
                        forum?.images.map((img, index) => (
                            <Image preview={{ visible: true, }} key={index} src={`${process.env.REACT_APP_API_URL||"http://localhost:5000"}/uploads/${img[index]}`} alt={`${img[index]}`} />
                        ))
                    }
                    </Image.PreviewGroup>
                </div>

                <div className="title">
                    {forum?.title}
                    标题11111111
                </div>

                <div className="text">
                    {forum?.content}
                    内容1
                    内容2111
                </div>

                <div className="date">
                    发布于 {dayjs(forum?.created_at).format('YYYY-MM-DD HH:mm')}
                </div>

            </div>

            <div className="comment">
                <div className="counter">
                    {`评论${forum?.comments.length||0}`}
                </div>

                <div className='comment-list'>
                    {
                        forum?.comments.map((comment, index) => (
                            <div className='comment-item' key={index}>
                                <Card >
                                    <Meta
                                        avatar={<Avatar src={comment.user.avatar} />}
                                        title={comment.user.nickname}
                                        description={comment.content}
                                    />

                                    {
                                        comment.replies.length > 0 && (
                                            <Button type='link' onClick={() => setOpenReplies(openReplies === index ? null : index)}>
                                                {openReplies === index ? '收起回复' : `展开${comment.replies.length}条回复`}
                                            </Button>
                                        )
                                    }

                                    {
                                        openReplies === index && (
                                            <div className='replies'>
                                                {
                                                    comment.replies.map((reply, index) => (
                                                        <div className='reply-item' key={index}>
                                                            <Card >
                                                                <Meta
                                                                    avatar={<Avatar src={reply.user.avatar} />}
                                                                    title={reply.user.nickname}
                                                                    description={reply.content}
                                                                />
                                                            </Card>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        )
                                    }
                                </Card>
                            </div>
                        ))
                    }
                </div>
            </div>

            <div className="function">
                <div className="comment">
                    <div className="icon">
                        
                    </div>
                </div>

                <div className="like">
                    <div className="icon">

                    </div>
                </div>

                <div className='star'>
                    <div className="icon">

                    </div>
                </div>

                <div className="share">
                    <div className='icon'>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForumDetail;