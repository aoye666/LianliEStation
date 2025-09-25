import React, { useState, useEffect,useRef } from'react';
import './ForumDetail.scss'
import Navbar from '../../../components/Navbar/Navbar';
import { useMainStore,useRecordStore } from '../../../store';
import { useLocation } from 'react-router-dom';
import { Image,Card,Avatar, Button,Input } from 'antd';
import { Carousel } from 'antd';
import dayjs from 'dayjs';
import Liked from '../../../assets/liked.svg';
import Star from '../../../assets/star.svg';
import Share from '../../../assets/share.svg';
import Like from '../../../assets/like.svg';
import Stared from '../../../assets/stared.svg';
import ChatInput from '../../../components/Comment/ChatInput';

const ForumDetail = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const forumId = params.get('id');
    const updateForumInteract = useMainStore(state => state.updateForumInteract)
    const {Meta} = Card;
    const [openReplies, setOpenReplies] = useState<number | null>(null);
    const [forumState, setForumState] = useState(false)
    const [showComment, setShowComment] = useState(false)
    const [likeState, setLikeState] = useState(false)
    const [parent_id,setParentId] = useState<number | undefined>(undefined)
    const commentRef = useRef<HTMLDivElement>(null)
    const mainStore = useMainStore()
    const recordStore = useRecordStore()

    useEffect(() => {
        mainStore.getForumPosts();
      }, []);

    const forum = mainStore.forums.find((forum)=> forum.id == (forumId?parseInt(forumId):null))

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (commentRef.current && !commentRef.current.contains(event.target as Node)) {
                setShowComment(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    },[])

    useEffect(() => {
        const fetchLikeStatus = async () => {
            if (forumId){
                const res =await updateForumInteract(parseInt(forumId), 'like',undefined,undefined,1)
                if(res === 400){
                    setLikeState(true)
                }else{
                    setLikeState(false)
                    updateForumInteract(parseInt(forumId), 'like',undefined,undefined,-1)
                }
            }
        }

        const fetchStarStatus = async () => {
            if (forumId){
                const res = await recordStore.addFavoritePost(forumId?parseInt(forumId):0)
                if(res === 400){
                    setForumState(true)
                }else{
                    setForumState(false)
                    recordStore.removeFavoritePost(forumId?parseInt(forumId):0)
                }
            }
        }
        fetchLikeStatus()
        fetchStarStatus()
    }, [])


    const like = () => {
        console.log('like')
        if (forumId){
            updateForumInteract(parseInt(forumId), 'like',undefined,undefined,likeState?-1:1)
            setLikeState(!likeState)
        }
    }

    const star = () => {
        console.log('star')
        setForumState(!forumState)
        if (!forumState){
            recordStore.addFavoritePost(forumId?parseInt(forumId):0)
        }
        else{
            recordStore.removeFavoritePost(forumId?parseInt(forumId):0)
        }
    }

    const comment = () => {
        console.log('comment')
        setShowComment(true)
    }

    const share = () => {
        console.log('share')
    }

    return (
        <div className='forum-detail'>

            <div className='navbar'>
                <Navbar title='详情' backActive={true} backPath='/forum'/>
            </div>

            <div className='content'>
                <div className="img-container">
                    <Image.PreviewGroup>
                        <Carousel>
                            {forum?.images.map((img, index) => (
                            <div key={index} className="carousel-item">
                                <Image className='img'
                                src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}${img}`}
                                alt={`image-${index}`}
                                />
                            </div>
                            ))}
                        </Carousel>
                    </Image.PreviewGroup>
                </div>


                <div className="title">
                    {forum?.title}
                </div>

                <div className="text">
                    {forum?.content}
                </div>

                <div className='author_info'>
                    <div className='author_avatar'>
                        <img src={`${process.env.REACT_APP_API_URL||"http://localhost:5000"}${forum?.author_avatar}`} alt="avatar" />
                    </div>
                    <div className='author_name'>
                        作者：{forum?.author_name}
                    </div>
                </div>

                <div className="date">
                    发布于 {dayjs(forum?.created_at).format('YYYY-MM-DD HH:mm')}
                </div>  
                
                <div className="comment">
                <div className="counter">
                    {`评论${forum?.comments.length||0}`}
                </div>

                <div className='comment-list'>
                    {
                        forum?.comments.map((comment, index) => (
                            <div className='comment-item' key={index}>
                                <Card  onClick={() => {
                                    setParentId(comment.id)
                                    setShowComment(true)
                                }}>
                                    <Meta
                                        avatar={<Avatar src={`${process.env.REACT_APP_API_URL||"http://localhost:5000"}${comment.user.avatar}`} />}
                                        title={comment.user.nickname}
                                        description={comment.content}
                                    />

                                    {
                                        comment.replies.length > 0 && (
                                            <Button type='link' onClick={(e) => {
                                                e.stopPropagation()
                                                setOpenReplies(openReplies === index ? null : index)
                                                }}>
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
                                                                    avatar={<Avatar src={`${process.env.REACT_APP_API_URL||"http://localhost:5000"}${reply.user.avatar}`} />}
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

        </div>
            
            <div className='commentBar' ref={commentRef}>
                {
                    showComment && (
                    <ChatInput id={forumId?parseInt(forumId):1} parent_id={parent_id}></ChatInput>
                    )
                }
            </div>

            <div className="function">
                <div className="comment" onClick={comment}>
                    说点什么吧
                </div>

                <div className="like">
                    <div className="icon">
                        <img src={likeState?Liked:Like} alt='like' onClick={like}/>
                    </div>
                </div>

                <div className='star'>
                    <div className="icon">
                        <img src={forumState?Stared:Star} alt='star' onClick={star}/>
                    </div>
                </div>

                <div className="share">
                    <div className='icon'>
                        <img src={Share} alt='share' onClick={share}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForumDetail;